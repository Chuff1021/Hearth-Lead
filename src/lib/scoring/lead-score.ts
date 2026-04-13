/**
 * Lead scoring engine. Scores 0-100 and assigns urgency (hot/warm/normal/cold).
 * Higher score = more likely to buy a fireplace from Aaron's.
 */

interface ScoreInput {
  type: string;
  estimatedValue?: number | null;
  squareFootage?: number | null;
  status?: string | null;
  subdivision?: string | null;
  contractorName?: string | null;
  city?: string | null;
  dateFiled?: Date | null;
  isPartnerBuilder?: boolean;
}

interface ScoreResult {
  total: number;
  urgency: 'hot' | 'warm' | 'normal' | 'cold';
  factors: { name: string; points: number; reason: string }[];
  idealContactWindow: string;
}

const PARTNER_BUILDERS: string[] = []; // filled from DB at runtime
const PREMIUM_SUBS = ['lakes at wild horse', 'lakepointe reserve', 'fremont hills', 'the bridges', 'elfindale', 'southern hills', 'rivercut'];

export function scorePermitLead(input: ScoreInput): ScoreResult {
  const factors: ScoreResult['factors'] = [];

  // 1. Permit type (0-20)
  if (input.type === 'new_residential') {
    factors.push({ name: 'type', points: 20, reason: 'New residential construction' });
  } else if (input.type === 'addition') {
    factors.push({ name: 'type', points: 8, reason: 'Home addition' });
  } else if (input.type === 'remodel') {
    factors.push({ name: 'type', points: 4, reason: 'Remodel' });
  }

  // 2. Construction value (0-20)
  if (input.estimatedValue) {
    if (input.estimatedValue >= 500000) factors.push({ name: 'value', points: 20, reason: 'Luxury home ($500K+)' });
    else if (input.estimatedValue >= 350000) factors.push({ name: 'value', points: 16, reason: 'Upper-mid home ($350K+)' });
    else if (input.estimatedValue >= 250000) factors.push({ name: 'value', points: 12, reason: 'Mid-range home ($250K+)' });
    else if (input.estimatedValue >= 180000) factors.push({ name: 'value', points: 6, reason: 'Starter home ($180K+)' });
  }

  // 3. Square footage (0-15)
  if (input.squareFootage) {
    if (input.squareFootage >= 3000) factors.push({ name: 'sqft', points: 15, reason: 'Large home (3000+ sqft)' });
    else if (input.squareFootage >= 2200) factors.push({ name: 'sqft', points: 11, reason: 'Above average (2200+ sqft)' });
    else if (input.squareFootage >= 1600) factors.push({ name: 'sqft', points: 7, reason: 'Average size (1600+ sqft)' });
    else factors.push({ name: 'sqft', points: 3, reason: 'Smaller home' });
  }

  // 4. Permit timing (0-15) — earlier = hotter
  if (input.status) {
    switch (input.status) {
      case 'applied': factors.push({ name: 'timing', points: 15, reason: 'Just applied — reach out NOW' }); break;
      case 'in_review': factors.push({ name: 'timing', points: 13, reason: 'In review — perfect timing' }); break;
      case 'approved': factors.push({ name: 'timing', points: 10, reason: 'Approved — contact before framing starts' }); break;
      case 'under_inspection': factors.push({ name: 'timing', points: 5, reason: 'Under inspection — may be too late for rough-in' }); break;
      case 'final': case 'co_issued': factors.push({ name: 'timing', points: 2, reason: 'Construction done — retrofit only' }); break;
    }
  }

  // 5. Builder relationship (0-15)
  if (input.isPartnerBuilder) {
    factors.push({ name: 'builder', points: 15, reason: 'Partner builder — warm lead!' });
  } else if (input.contractorName) {
    factors.push({ name: 'builder', points: 5, reason: `Known builder: ${input.contractorName}` });
  }

  // 6. Subdivision (0-10)
  if (input.subdivision) {
    const sub = input.subdivision.toLowerCase();
    if (PREMIUM_SUBS.some(s => sub.includes(s))) {
      factors.push({ name: 'subdivision', points: 10, reason: `Premium area: ${input.subdivision}` });
    } else {
      factors.push({ name: 'subdivision', points: 4, reason: input.subdivision });
    }
  }

  // 7. Recency (0-5)
  if (input.dateFiled) {
    const daysOld = Math.floor((Date.now() - input.dateFiled.getTime()) / 86400000);
    if (daysOld <= 3) factors.push({ name: 'recency', points: 5, reason: 'Filed in last 3 days' });
    else if (daysOld <= 7) factors.push({ name: 'recency', points: 4, reason: 'Filed this week' });
    else if (daysOld <= 14) factors.push({ name: 'recency', points: 2, reason: 'Filed in last 2 weeks' });
    else if (daysOld <= 30) factors.push({ name: 'recency', points: 1, reason: 'Filed this month' });
  }

  const total = Math.min(100, factors.reduce((s, f) => s + f.points, 0));

  let urgency: ScoreResult['urgency'] = 'cold';
  if (total >= 70 || input.isPartnerBuilder) urgency = 'hot';
  else if (total >= 50) urgency = 'warm';
  else if (total >= 30) urgency = 'normal';

  // Override urgency for time-sensitive permits
  if (input.status === 'applied' || input.status === 'in_review') {
    if (urgency === 'normal') urgency = 'warm';
  }

  let idealContactWindow = 'No rush';
  if (input.status === 'applied' || input.status === 'in_review') idealContactWindow = 'Contact within 48 hours';
  else if (input.status === 'approved') idealContactWindow = 'Contact within 1 week';
  else if (input.status === 'under_inspection') idealContactWindow = 'Window closing — contact ASAP';
  else if (input.status === 'final' || input.status === 'co_issued') idealContactWindow = 'Retrofit opportunity only';

  return { total, urgency, factors, idealContactWindow };
}

export function generateOutreachMessage(type: 'homeowner' | 'builder', data: { name?: string; address?: string; builderName?: string; subdivision?: string }): string {
  if (type === 'homeowner') {
    return `Hi ${data.name || 'there'},

Congratulations on your new home${data.address ? ` at ${data.address}` : ''}! I'm Aaron from Aaron's Fireplace here in Springfield.

I wanted to reach out because there's a short window during construction where adding a fireplace is easy and affordable — once the framing goes up, it gets a lot more expensive. If your builder hasn't already planned for one, I'd love to show you some options.

We offer free on-site consultations and work directly with your builder's crew. Most of our new construction installs run $2,500-$6,000 depending on what you're looking for.

Would you be open to a quick chat? You can reach me at (417) 823-3411 or just reply to this message.

Thanks,
Aaron
Aaron's Fireplace
Springfield, MO`;
  }

  return `Hi,

I noticed ${data.builderName || 'your company'} has some new permits filed${data.subdivision ? ` in ${data.subdivision}` : ''}. I'm Aaron from Aaron's Fireplace — we're a local hearth dealer here in Springfield.

I work with several builders in the area as their go-to fireplace supplier. What that looks like:
- Wholesale pricing on gas, wood, and electric fireplaces
- We handle all rough-in coordination with your framing crew
- Quick turnaround — we don't hold up your schedule
- Full warranty support for your buyers

Would you be open to a quick meeting? Happy to bring some product info and pricing.

Aaron
Aaron's Fireplace
(417) 823-3411`;
}
