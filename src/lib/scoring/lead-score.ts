/**
 * Lead scoring engine for building permit leads.
 *
 * Scores range from 0-100 based on multiple factors that indicate
 * likelihood of fireplace purchase.
 */

interface LeadScoreInput {
  type: string;           // permit type
  estimatedValue?: number;
  squareFootage?: number;
  status?: string;        // permit status
  subdivision?: string;
  contractorName?: string;
  city?: string;
  county?: string;
  dateFiled?: Date;
  description?: string;
}

interface ScoreBreakdown {
  total: number;
  factors: { name: string; points: number; reason: string }[];
}

// Known builders who frequently include fireplaces
const HIGH_FIREPLACE_BUILDERS = [
  'john marion',
  'alair homes',
  'wisebuilt',
  'wise-built',
  'built by brett',
  'trendsetter',
];

// Known builders with fireplace as optional upgrade (good prospects)
const OPTIONAL_FIREPLACE_BUILDERS = [
  'schuber mitchell',
  'cronkhite',
];

// Premium subdivisions where fireplaces are common
const PREMIUM_SUBDIVISIONS = [
  'lakes at wild horse',
  'lakepointe reserve',
  'woodvale',
  'elfindale',
  'rivercut',
  'greenbridge estates',
];

export function scorePermitLead(input: LeadScoreInput): ScoreBreakdown {
  const factors: ScoreBreakdown['factors'] = [];

  // Factor 1: Permit type (0-20 points)
  if (input.type === 'new_residential') {
    factors.push({ name: 'permit_type', points: 20, reason: 'New residential construction' });
  } else if (input.type === 'addition') {
    factors.push({ name: 'permit_type', points: 8, reason: 'Home addition (possible fireplace add)' });
  } else if (input.type === 'remodel') {
    factors.push({ name: 'permit_type', points: 5, reason: 'Remodel (possible fireplace retrofit)' });
  }

  // Factor 2: Construction value (0-20 points)
  if (input.estimatedValue) {
    if (input.estimatedValue >= 500000) {
      factors.push({ name: 'value', points: 20, reason: `High value home ($${(input.estimatedValue/1000).toFixed(0)}K)` });
    } else if (input.estimatedValue >= 350000) {
      factors.push({ name: 'value', points: 16, reason: `Above-average value ($${(input.estimatedValue/1000).toFixed(0)}K)` });
    } else if (input.estimatedValue >= 250000) {
      factors.push({ name: 'value', points: 12, reason: `Mid-range value ($${(input.estimatedValue/1000).toFixed(0)}K)` });
    } else if (input.estimatedValue >= 150000) {
      factors.push({ name: 'value', points: 6, reason: `Moderate value ($${(input.estimatedValue/1000).toFixed(0)}K)` });
    }
  }

  // Factor 3: Square footage (0-15 points)
  if (input.squareFootage) {
    if (input.squareFootage >= 3000) {
      factors.push({ name: 'size', points: 15, reason: `Large home (${input.squareFootage} sq ft)` });
    } else if (input.squareFootage >= 2200) {
      factors.push({ name: 'size', points: 12, reason: `Above-average size (${input.squareFootage} sq ft)` });
    } else if (input.squareFootage >= 1600) {
      factors.push({ name: 'size', points: 8, reason: `Average size (${input.squareFootage} sq ft)` });
    } else {
      factors.push({ name: 'size', points: 3, reason: `Smaller home (${input.squareFootage} sq ft)` });
    }
  }

  // Factor 4: Permit timing / status (0-15 points)
  // Earlier stages = hotter leads (they haven't committed to a fireplace yet)
  if (input.status) {
    switch (input.status) {
      case 'applied':
        factors.push({ name: 'timing', points: 15, reason: 'Just applied — earliest possible contact' });
        break;
      case 'approved':
      case 'in_review':
        factors.push({ name: 'timing', points: 12, reason: 'Approved/in review — ideal timing for fireplace discussion' });
        break;
      case 'under_inspection':
        factors.push({ name: 'timing', points: 6, reason: 'Under inspection — may still be able to add fireplace' });
        break;
      case 'final':
      case 'co_issued':
        factors.push({ name: 'timing', points: 2, reason: 'Construction complete — retrofit only' });
        break;
    }
  }

  // Factor 5: Builder/contractor (0-15 points)
  if (input.contractorName) {
    const contractor = input.contractorName.toLowerCase();

    if (HIGH_FIREPLACE_BUILDERS.some(b => contractor.includes(b))) {
      factors.push({ name: 'builder', points: 15, reason: `Premium builder: ${input.contractorName}` });
    } else if (OPTIONAL_FIREPLACE_BUILDERS.some(b => contractor.includes(b))) {
      factors.push({ name: 'builder', points: 12, reason: `Builder offers fireplace upgrades: ${input.contractorName}` });
    } else {
      factors.push({ name: 'builder', points: 5, reason: `Known builder: ${input.contractorName}` });
    }
  }

  // Factor 6: Subdivision (0-10 points)
  if (input.subdivision) {
    const sub = input.subdivision.toLowerCase();
    if (PREMIUM_SUBDIVISIONS.some(s => sub.includes(s))) {
      factors.push({ name: 'subdivision', points: 10, reason: `Premium subdivision: ${input.subdivision}` });
    } else {
      factors.push({ name: 'subdivision', points: 4, reason: `Known subdivision: ${input.subdivision}` });
    }
  }

  // Factor 7: Recency bonus (0-5 points)
  if (input.dateFiled) {
    const daysAgo = Math.floor((Date.now() - input.dateFiled.getTime()) / (1000 * 60 * 60 * 24));
    if (daysAgo <= 7) {
      factors.push({ name: 'recency', points: 5, reason: 'Filed within last week' });
    } else if (daysAgo <= 14) {
      factors.push({ name: 'recency', points: 3, reason: 'Filed within last 2 weeks' });
    } else if (daysAgo <= 30) {
      factors.push({ name: 'recency', points: 1, reason: 'Filed within last month' });
    }
  }

  const total = Math.min(100, factors.reduce((sum, f) => sum + f.points, 0));

  return { total, factors };
}

export function getLeadPriority(score: number): 'hot' | 'warm' | 'cool' | 'cold' {
  if (score >= 75) return 'hot';
  if (score >= 50) return 'warm';
  if (score >= 30) return 'cool';
  return 'cold';
}

export function generateOutreachMessage(
  type: 'homeowner' | 'builder',
  data: {
    name?: string;
    address?: string;
    builderName?: string;
    subdivision?: string;
  }
): string {
  if (type === 'homeowner') {
    const name = data.name || 'Homeowner';
    const address = data.address ? ` at ${data.address}` : '';
    return `Dear ${name},

Congratulations on your new home${address}! Building a new home is one of life's most exciting experiences, and we'd love to help you make it even more special.

Before your builder frames the fireplace chase, let's discuss your options. Installing a fireplace during construction saves $3,000–$5,000 compared to adding one after the home is complete.

We offer free in-home consultations where we'll review your floor plan and recommend the perfect fireplace for your space, style, and budget. We work with all major builders in the Springfield area and can coordinate directly with your construction team.

Would you like to schedule a free consultation? Call us at ${process.env.NEXT_PUBLIC_PHONE || '(417) 555-0199'} or reply to this message.

Warm regards,
${process.env.NEXT_PUBLIC_BUSINESS_NAME || 'Hearth & Home Fireplace Co.'}`;
  }

  const builderName = data.builderName || 'your team';
  const subdivision = data.subdivision ? ` in ${data.subdivision}` : '';
  return `Hello,

We noticed ${builderName} is starting new construction${subdivision}. We'd love to be your preferred fireplace supplier for these homes.

As a local fireplace dealer, we can offer:
- Competitive wholesale pricing on gas, wood, and electric fireplaces
- Direct coordination with your framing crew on rough-in specs
- Quick turnaround on product selection and installation
- Warranty support and service for your homebuyers

Many of our builder partners find that offering a fireplace upgrade increases their average sale price by $4,000–$8,000 while only adding $2,500–$5,000 in cost.

Could we schedule a quick meeting to discuss a partnership? I'd be happy to bring product samples and pricing.

Best regards,
${process.env.NEXT_PUBLIC_BUSINESS_NAME || 'Hearth & Home Fireplace Co.'}
${process.env.NEXT_PUBLIC_PHONE || '(417) 555-0199'}`;
}
