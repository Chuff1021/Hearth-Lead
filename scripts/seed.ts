import { PrismaClient } from '@prisma/client';
import { scorePermitLead } from '../src/lib/scoring/lead-score';

const prisma = new PrismaClient();

// Realistic Springfield-area street names and subdivisions
const STREETS = [
  'E Sunshine St', 'S National Ave', 'W Republic Rd', 'E Battlefield Rd',
  'S Campbell Ave', 'N Glenstone Ave', 'W Chestnut Expy', 'E Cherry St',
  'S Fremont Ave', 'N Kansas Expy', 'W Catalpa St', 'E Division St',
  'S Lone Pine Ave', 'N Delaware Ave', 'W Grand St', 'E Elm St',
  'S Ingram Mill Rd', 'N Farm Rd 145', 'W State Hwy FF', 'E FR 164',
  'Meadowlark Ln', 'Whitetail Dr', 'Summerfield Ct', 'Oakwood Trl',
  'Creekside Dr', 'Heritage Blvd', 'Fox Run Dr', 'Brookstone Way',
  'Timber Ridge Rd', 'Valley View Dr', 'Deer Run Ln', 'Hickory Hills Dr',
];

const SUBDIVISIONS = [
  'The Lakes at Wild Horse', 'Woodvale', 'Lakepointe Reserve', 'Elfindale',
  'Riverton Park', 'North Point', 'Aldersgate', 'McCracken Hills',
  'Finley Crossing', 'Greenbridge Estates', 'Rivercut', 'Ozark Highlands',
  'Greenfield Estates', 'Olde Savannah', 'Brookstone Meadows', 'Wilson Creek Farms',
  'Old Wire Crossing', 'Battlefield Estates', 'Cannonball Creek', 'Logan Creek',
  'Valley View Estates', 'Willard Heights', 'Prairie Creek', 'Strafford Meadows',
];

const BUILDERS_DATA = [
  { slug: 'schuber-mitchell-homes', name: 'Schuber Mitchell Homes', website: 'https://www.schubermitchell.com', city: 'Springfield', fireplaceRate: 0.35, totalPermits: 45, activePermits: 12 },
  { slug: 'cronkhite-homes', name: 'Cronkhite Homes', website: 'https://www.cronkhitehomes.com', city: 'Springfield', fireplaceRate: 0.28, totalPermits: 28, activePermits: 8 },
  { slug: 'john-marion-custom-homes', name: 'John Marion Custom Homes', website: 'https://johnmarioncustomhomes.com', city: 'Springfield', fireplaceRate: 0.85, totalPermits: 12, activePermits: 3 },
  { slug: 'wisebuilt-homes', name: 'WiseBuilt', website: 'https://www.wise-built.com', city: 'Ozark', fireplaceRate: 0.72, totalPermits: 8, activePermits: 2 },
  { slug: 'built-by-brett', name: 'Built By Brett', website: 'https://builtbybrett.com', city: 'Springfield', fireplaceRate: 0.65, totalPermits: 6, activePermits: 2 },
  { slug: 'trendsetter-homes', name: 'Trendsetter Homes', website: 'https://trendsetterhomes.com', city: 'Springfield', fireplaceRate: 0.80, totalPermits: 5, activePermits: 1 },
  { slug: 'alair-homes-springfield', name: 'Alair Homes Springfield', website: 'https://alairhomes.com/springfield', city: 'Springfield', fireplaceRate: 0.90, totalPermits: 4, activePermits: 1 },
  { slug: 'davis-homes-llc', name: 'Davis Homes LLC', city: 'Nixa', fireplaceRate: 0.40, totalPermits: 15, activePermits: 4 },
  { slug: 'price-cutter-homes', name: 'Price Cutter Homes', city: 'Republic', fireplaceRate: 0.20, totalPermits: 18, activePermits: 5 },
  { slug: 'ozark-mountain-builders', name: 'Ozark Mountain Builders', city: 'Ozark', fireplaceRate: 0.55, totalPermits: 10, activePermits: 3 },
];

const CITIES = [
  { name: 'Springfield', county: 'Greene', zips: ['65801', '65802', '65803', '65804', '65807', '65809', '65810'] },
  { name: 'Nixa', county: 'Christian', zips: ['65714'] },
  { name: 'Ozark', county: 'Christian', zips: ['65721'] },
  { name: 'Republic', county: 'Greene', zips: ['65738'] },
  { name: 'Battlefield', county: 'Greene', zips: ['65619'] },
  { name: 'Rogersville', county: 'Greene', zips: ['65742'] },
  { name: 'Willard', county: 'Greene', zips: ['65781'] },
  { name: 'Strafford', county: 'Greene', zips: ['65757'] },
];

const FIRST_NAMES = ['James', 'Robert', 'Michael', 'David', 'John', 'Sarah', 'Jennifer', 'Lisa', 'Jessica', 'Emily', 'Chris', 'Brian', 'Kevin', 'Matt', 'Amanda', 'Ashley', 'Daniel', 'Andrew', 'Joshua', 'Mark'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Davis', 'Miller', 'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Martin', 'Clark', 'Lewis', 'Walker', 'Hall', 'Young', 'King', 'Wright'];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(daysBack: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - randomInt(0, daysBack));
  return date;
}

async function seed() {
  console.log('Seeding database...\n');

  // Clear existing data
  await prisma.analyticsEvent.deleteMany();
  await prisma.leadCapture.deleteMany();
  await prisma.outreachLog.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.permit.deleteMany();
  await prisma.subdivision.deleteMany();
  await prisma.builder.deleteMany();
  await prisma.blogPost.deleteMany();
  console.log('Cleared existing data.');

  // Seed builders
  const builders: Record<string, string> = {};
  for (const b of BUILDERS_DATA) {
    const builder = await prisma.builder.create({
      data: {
        slug: b.slug,
        name: b.name,
        website: b.website,
        city: b.city,
        fireplaceRate: b.fireplaceRate,
        totalPermits: b.totalPermits,
        activePermits: b.activePermits,
        relationship: ['unknown', 'contacted', 'pitched', 'partner'][randomInt(0, 3)],
        specialties: JSON.stringify(
          b.fireplaceRate > 0.7
            ? ['Custom homes', 'Luxury', 'Design-build']
            : ['Production homes', 'Semi-custom', 'First-time buyer']
        ),
      },
    });
    builders[b.slug] = builder.id;
    console.log(`  Builder: ${b.name}`);
  }

  // Seed subdivisions
  for (const sub of SUBDIVISIONS) {
    const city = randomItem(CITIES);
    const builderSlug = randomItem(Object.keys(builders));
    await prisma.subdivision.create({
      data: {
        slug: sub.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name: sub,
        city: city.name,
        county: city.county,
        zip: randomItem(city.zips),
        builderId: builders[builderSlug],
        priceRange: `$${randomInt(22, 55) * 10},000–$${randomInt(35, 80) * 10},000`,
        totalLots: randomInt(20, 200),
        activeLots: randomInt(2, 30),
      },
    });
  }
  console.log(`  Subdivisions: ${SUBDIVISIONS.length}`);

  // Seed permits (120 realistic permits)
  const permits: string[] = [];
  for (let i = 0; i < 120; i++) {
    const city = randomItem(CITIES);
    const builder = randomItem(BUILDERS_DATA);
    const subdivision = randomItem(SUBDIVISIONS);
    const address = `${randomInt(100, 9999)} ${randomItem(STREETS)}`;
    const value = randomInt(180, 750) * 1000;
    const sqft = randomInt(1200, 4500);
    const status = randomItem(['applied', 'approved', 'in_review', 'under_inspection', 'final', 'co_issued']);
    const dateFiled = randomDate(365);
    const ownerFirst = randomItem(FIRST_NAMES);
    const ownerLast = randomItem(LAST_NAMES);

    const score = scorePermitLead({
      type: 'new_residential',
      estimatedValue: value,
      squareFootage: sqft,
      status,
      subdivision,
      contractorName: builder.name,
      city: city.name,
      dateFiled,
    });

    const permit = await prisma.permit.create({
      data: {
        permitNumber: `${city.name.slice(0, 3).toUpperCase()}-${2024 + Math.floor(i / 60)}-${String(1000 + i).slice(1)}`,
        source: city.name.toLowerCase(),
        type: 'new_residential',
        subType: randomItem(['single_family', 'single_family', 'single_family', 'townhome']),
        status,
        propertyAddress: address,
        city: city.name,
        county: city.county,
        zip: randomItem(city.zips),
        ownerName: `${ownerFirst} ${ownerLast}`,
        contractorName: builder.name,
        subdivision,
        estimatedValue: value,
        squareFootage: sqft,
        stories: randomItem([1, 1, 2, 2, 2]),
        dateFiled,
        dateApproved: status !== 'applied' ? new Date(dateFiled.getTime() + randomInt(7, 30) * 86400000) : null,
        description: `New single-family residence, ${sqft} sq ft, ${randomItem([3, 4, 4, 5])} bed, ${randomItem([2, 2.5, 3, 3.5])} bath`,
        leadScore: score.total,
      },
    });
    permits.push(permit.id);
  }
  console.log(`  Permits: 120`);

  // Seed leads (mix of permit-derived and website leads)
  for (let i = 0; i < 35; i++) {
    const isPermitLead = i < 20;
    const city = randomItem(CITIES);
    const firstName = randomItem(FIRST_NAMES);
    const lastName = randomItem(LAST_NAMES);
    const score = randomInt(25, 95);
    const statuses = ['new', 'new', 'new', 'contacted', 'contacted', 'quoted', 'won', 'lost'];

    const lead = await prisma.lead.create({
      data: {
        type: isPermitLead ? 'permit_lead' : 'website_lead',
        status: randomItem(statuses),
        score,
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${randomItem(['gmail.com', 'yahoo.com', 'outlook.com', 'icloud.com'])}`,
        phone: `(417) ${randomInt(200, 999)}-${String(randomInt(1000, 9999))}`,
        address: isPermitLead ? `${randomInt(100, 9999)} ${randomItem(STREETS)}` : null,
        city: city.name,
        county: city.county,
        builderName: randomItem(BUILDERS_DATA).name,
        builderId: builders[randomItem(Object.keys(builders))],
        subdivision: isPermitLead ? randomItem(SUBDIVISIONS) : null,
        homeSize: `${randomInt(15, 40) * 100} sq ft`,
        budget: randomItem(['$2,000–$4,000', '$4,000–$7,000', '$7,000–$12,000', 'Not sure']),
        fuelPreference: randomItem(['gas', 'gas', 'gas', 'wood', 'electric', null]),
        style: randomItem(['modern', 'traditional', 'rustic', 'contemporary', null]),
        timeline: randomItem(['planning', 'contracted', 'foundation', 'framing', 'finishing']),
        source: isPermitLead ? 'permit_data' : randomItem(['organic', 'direct', 'referral']),
        sourcePage: isPermitLead ? null : randomItem([
          'home', 'fireplaces-springfield-mo', 'cost-guide',
          'builders/schuber-mitchell-homes', 'blog/fireplace-cost-new-construction-missouri',
        ]),
        ...(isPermitLead && permits[i] ? { permits: { connect: { id: permits[i] } } } : {}),
      },
    });

    // Add some outreach logs for non-new leads
    if (['contacted', 'quoted', 'won'].includes(lead.status)) {
      await prisma.outreachLog.create({
        data: {
          leadId: lead.id,
          type: randomItem(['email', 'phone', 'email']),
          direction: 'outbound',
          subject: 'Fireplace consultation for your new home',
          outcome: randomItem(['spoke', 'left_message', 'no_answer', 'meeting_set']),
        },
      });
    }
  }
  console.log(`  Leads: 35`);

  // Seed some website lead captures
  for (let i = 0; i < 15; i++) {
    await prisma.leadCapture.create({
      data: {
        firstName: randomItem(FIRST_NAMES),
        lastName: randomItem(LAST_NAMES),
        email: `${randomItem(FIRST_NAMES).toLowerCase()}${randomInt(1, 99)}@${randomItem(['gmail.com', 'yahoo.com'])}`,
        phone: `(417) ${randomInt(200, 999)}-${String(randomInt(1000, 9999))}`,
        page: randomItem([
          'home', 'fireplaces-springfield-mo', 'fireplaces-nixa-mo',
          'builders/schuber-mitchell-homes', 'cost-guide', 'contact',
        ]),
        cta: randomItem(['hero', 'sidebar', 'bottom', 'mobile-bottom']),
        formType: randomItem(['consultation', 'contact', 'quiz', 'checklist']),
        createdAt: randomDate(30),
      },
    });
  }
  console.log(`  Lead captures: 15`);

  console.log('\nSeed complete!');
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
