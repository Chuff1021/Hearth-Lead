import { PrismaClient } from '@prisma/client';
import { scorePermitLead } from '../src/lib/scoring/lead-score';

const prisma = new PrismaClient();

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function rand(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min; }
function ago(days: number): Date { const d = new Date(); d.setDate(d.getDate() - rand(0, days)); return d; }

const STREETS = ['E Sunshine St','S National Ave','W Republic Rd','E Battlefield Rd','S Campbell Ave','N Glenstone Ave','W Catalpa St','E Division St','S Lone Pine Ave','N Kansas Expy','Meadowlark Ln','Whitetail Dr','Summerfield Ct','Oakwood Trl','Creekside Dr','Heritage Blvd','Fox Run Dr','Brookstone Way','Timber Ridge Rd','Valley View Dr','Deer Run Ln','Hickory Hills Dr','Saddlebrook Ct','Stone Creek Dr','Prairie View Ln','Cypress Point Dr'];

const SUBDIVISIONS = ['The Lakes at Wild Horse','Lakepointe Reserve','Fremont Hills','The Bridges','Elfindale','Southern Hills','Riverton Park','Aldersgate','McCracken Hills','Finley Crossing','Greenbridge Estates','Rivercut','Ozark Highlands','Greenfield Estates','Olde Savannah','Wilson Creek Farms','Old Wire Crossing','Cannonball Creek','North Point','Willard Heights','Logan Creek','Bradford Park','Raintree','Stone Bridge','Millwood'];

const CITIES = [
  { name: 'Springfield', county: 'Greene', zips: ['65801','65802','65803','65804','65807','65809','65810'], weight: 5 },
  { name: 'Nixa', county: 'Christian', zips: ['65714'], weight: 2 },
  { name: 'Ozark', county: 'Christian', zips: ['65721'], weight: 2 },
  { name: 'Republic', county: 'Greene', zips: ['65738'], weight: 1.5 },
  { name: 'Battlefield', county: 'Greene', zips: ['65619'], weight: 1 },
  { name: 'Rogersville', county: 'Greene', zips: ['65742'], weight: 0.5 },
  { name: 'Willard', county: 'Greene', zips: ['65781'], weight: 0.5 },
  { name: 'Strafford', county: 'Greene', zips: ['65757'], weight: 0.3 },
];

const BUILDERS_SEED = [
  { name: 'Schuber Mitchell Homes', slug: 'schuber-mitchell', website: 'https://www.schubermitchell.com', city: 'Springfield', relationship: 'partner', fp: 0.35, permits: 48, sales: 8, rev: 32000 },
  { name: 'Cronkhite Homes', slug: 'cronkhite-homes', website: 'https://www.cronkhitehomes.com', city: 'Springfield', relationship: 'partner', fp: 0.28, permits: 32, sales: 4, rev: 14000 },
  { name: 'John Marion Custom Homes', slug: 'john-marion', website: 'https://johnmarioncustomhomes.com', city: 'Springfield', relationship: 'pitched', fp: 0.85, permits: 12, sales: 2, rev: 14000 },
  { name: 'WiseBuilt Homes', slug: 'wisebuilt', website: 'https://www.wise-built.com', city: 'Ozark', relationship: 'contacted', fp: 0.72, permits: 9, sales: 0, rev: 0 },
  { name: 'Built By Brett', slug: 'built-by-brett', website: 'https://builtbybrett.com', city: 'Springfield', relationship: 'partner', fp: 0.65, permits: 7, sales: 3, rev: 18000 },
  { name: 'Trendsetter Homes', slug: 'trendsetter', website: 'https://trendsetterhomes.com', city: 'Springfield', relationship: 'unknown', fp: 0.80, permits: 5, sales: 0, rev: 0 },
  { name: 'Alair Homes Springfield', slug: 'alair-homes', city: 'Springfield', relationship: 'pitched', fp: 0.90, permits: 4, sales: 1, rev: 8500 },
  { name: 'Davis Homes LLC', slug: 'davis-homes', city: 'Nixa', relationship: 'partner', fp: 0.40, permits: 18, sales: 5, rev: 17500 },
  { name: 'Millstone Homes', slug: 'millstone', city: 'Republic', relationship: 'contacted', fp: 0.20, permits: 15, sales: 0, rev: 0 },
  { name: 'Ozark Mountain Builders', slug: 'ozark-mountain', city: 'Ozark', relationship: 'unknown', fp: 0.55, permits: 10, sales: 0, rev: 0 },
  { name: 'Prestige Construction', slug: 'prestige', city: 'Springfield', relationship: 'declined', fp: 0.15, permits: 22, sales: 0, rev: 0 },
  { name: 'Heartland Homes', slug: 'heartland', city: 'Battlefield', relationship: 'contacted', fp: 0.45, permits: 8, sales: 0, rev: 0 },
];

const FIRST = ['James','Robert','Michael','David','John','Sarah','Jennifer','Lisa','Jessica','Emily','Chris','Brian','Kevin','Matt','Amanda','Ashley','Daniel','Andrew','Joshua','Mark','Stephanie','Nicole','Rachel','Brandon','Tyler','Ryan','Nathan','Aaron','Blake','Travis'];
const LAST = ['Smith','Johnson','Williams','Brown','Jones','Davis','Miller','Wilson','Anderson','Taylor','Thomas','Moore','Martin','Clark','Lewis','Walker','Hall','Young','King','Wright','Baker','Carter','Mitchell','Turner','Phillips','Evans','Roberts','Campbell','Parker','Edwards'];

async function seed() {
  console.log('🔥 Seeding Aaron\'s Fireplace Lead Engine...\n');

  // Clear all data
  await prisma.$transaction([
    prisma.outreachLog.deleteMany(),
    prisma.lead.deleteMany(),
    prisma.permit.deleteMany(),
    prisma.builder.deleteMany(),
    prisma.outreachTemplate.deleteMany(),
    prisma.seoKeyword.deleteMany(),
    prisma.seoTask.deleteMany(),
    prisma.seoPage.deleteMany(),
    prisma.gbpReview.deleteMany(),
    prisma.gbpPost.deleteMany(),
    prisma.contentItem.deleteMany(),
    prisma.competitor.deleteMany(),
  ]);
  console.log('  Cleared existing data.');

  // ─── BUILDERS ────────────────────────────────
  const builderMap: Record<string, string> = {};
  for (const b of BUILDERS_SEED) {
    const builder = await prisma.builder.create({
      data: {
        slug: b.slug, name: b.name, website: b.website, city: b.city,
        relationship: b.relationship, fireplaceRate: b.fp, totalPermits: b.permits,
        activePermits: rand(1, Math.min(b.permits, 8)), totalSales: b.sales, totalRevenue: b.rev,
        contactName: `${pick(FIRST)} ${pick(LAST)}`, phone: `(417) ${rand(200,999)}-${rand(1000,9999)}`,
        partnerSince: b.relationship === 'partner' ? ago(365) : null,
      },
    });
    builderMap[b.slug] = builder.id;
  }
  console.log(`  Builders: ${BUILDERS_SEED.length}`);

  // ─── PERMITS ─────────────────────────────────
  const permitIds: string[] = [];
  for (let i = 0; i < 150; i++) {
    const city = pick(CITIES);
    const builder = pick(BUILDERS_SEED);
    const sub = pick(SUBDIVISIONS);
    const addr = `${rand(100,9999)} ${pick(STREETS)}`;
    const val = rand(180, 750) * 1000;
    const sqft = rand(1200, 4500);
    const status = pick(['applied','applied','approved','approved','approved','in_review','under_inspection','under_inspection','final','co_issued']);
    const filed = ago(365);

    const isPartner = builder.relationship === 'partner';
    const score = scorePermitLead({ type: 'new_residential', estimatedValue: val, squareFootage: sqft, status, subdivision: sub, contractorName: builder.name, city: city.name, dateFiled: filed, isPartnerBuilder: isPartner });

    // Generate realistic lat/lng in the Springfield metro area
    const cityCoords: Record<string, [number, number]> = {
      'Springfield': [37.2090, -93.2923], 'Nixa': [37.0431, -93.2946],
      'Ozark': [37.0209, -93.2060], 'Republic': [37.1200, -93.4802],
      'Battlefield': [37.1148, -93.3696], 'Rogersville': [37.1170, -93.0557],
      'Willard': [37.3054, -93.4285], 'Strafford': [37.2681, -93.1172],
    };
    const [baseLat, baseLng] = cityCoords[city.name] || [37.2090, -93.2923];
    const lat = baseLat + (Math.random() - 0.5) * 0.06;
    const lng = baseLng + (Math.random() - 0.5) * 0.08;

    const permit = await prisma.permit.create({
      data: {
        permitNumber: `${city.name.slice(0,3).toUpperCase()}-${2024 + Math.floor(i/75)}-${String(1000+i).slice(1)}`,
        source: city.name.toLowerCase(), type: 'new_residential', subType: pick(['single_family','single_family','single_family','townhome']),
        status, propertyAddress: addr, city: city.name, county: city.county, zip: pick(city.zips),
        ownerName: `${pick(FIRST)} ${pick(LAST)}`, contractorName: builder.name, builderId: builderMap[builder.slug],
        subdivision: sub, estimatedValue: val, squareFootage: sqft, stories: pick([1,1,2,2,2]),
        bedrooms: pick([3,3,4,4,5]), bathrooms: pick([2,2,2.5,3,3.5]),
        lat, lng,
        dateFiled: filed, dateApproved: status !== 'applied' ? new Date(filed.getTime() + rand(7,30)*86400000) : null,
        description: `New SFR, ${sqft} sqft, ${pick([3,4,4,5])} bed/${pick([2,2.5,3])} bath`,
        leadScore: score.total, urgency: score.urgency,
      },
    });
    permitIds.push(permit.id);
  }
  console.log('  Permits: 150');

  // ─── LEADS ───────────────────────────────────
  const stages = ['new','new','new','contacted','contacted','contacted','quoted','quoted','sold','sold','lost'];
  for (let i = 0; i < 45; i++) {
    const isPermit = i < 30;
    const city = pick(CITIES);
    const builder = pick(BUILDERS_SEED);
    const stage = pick(stages);
    const sc = rand(25, 95);
    const urgency = sc >= 70 ? 'hot' : sc >= 50 ? 'warm' : sc >= 30 ? 'normal' : 'cold';
    const firstName = pick(FIRST);
    const lastName = pick(LAST);
    const created = ago(120);

    const lead = await prisma.lead.create({
      data: {
        source: isPermit ? 'permit' : pick(['organic','google_business','referral','walk_in','phone']),
        stage, score: sc, urgency, firstName, lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${pick(['gmail.com','yahoo.com','outlook.com'])}`,
        phone: `(417) ${rand(200,999)}-${rand(1000,9999)}`,
        address: isPermit ? `${rand(100,9999)} ${pick(STREETS)}` : null,
        city: city.name, county: city.county, subdivision: isPermit ? pick(SUBDIVISIONS) : null,
        builderId: builderMap[builder.slug], homeValue: isPermit ? rand(200,600)*1000 : null,
        fuelPreference: pick(['gas','gas','gas','wood','electric',null]),
        productInterest: pick(['fireplace','fireplace','fireplace','insert','stove','outdoor',null]),
        budget: pick(['$2,000-$4,000','$4,000-$7,000','$7,000-$12,000','Not sure yet',null]),
        timeline: isPermit ? pick(['planning','foundation','framing','finishing']) : pick(['planning','unknown']),
        notes: isPermit ? `From permit data. Builder: ${builder.name}` : null,
        soldAmount: stage === 'sold' ? rand(25,85)*100 : null,
        soldDate: stage === 'sold' ? ago(60) : null,
        lostReason: stage === 'lost' ? pick(['Went with competitor','Changed mind on fireplace','Builder provided their own','Budget too tight','No response after 3 attempts']) : null,
        firstContactAt: ['contacted','quoted','sold','lost'].includes(stage) ? new Date(created.getTime() + rand(1,7)*86400000) : null,
        nextFollowUp: ['new','contacted','quoted'].includes(stage) ? (Math.random() > 0.5 ? ago(-rand(0,14)) : ago(rand(0,5))) : null,
        createdAt: created,
        ...(isPermit && permitIds[i] ? { permits: { connect: { id: permitIds[i] } } } : {}),
      },
    });

    // Add outreach logs for contacted+ leads
    if (['contacted','quoted','sold','lost'].includes(stage)) {
      await prisma.outreachLog.create({
        data: {
          leadId: lead.id, type: pick(['email','phone','phone']), direction: 'outbound',
          subject: 'Fireplace options for your new home',
          outcome: pick(['spoke','left_message','no_answer','meeting_set']),
          createdAt: new Date(created.getTime() + rand(1,5)*86400000),
        },
      });
      if (['quoted','sold'].includes(stage)) {
        await prisma.outreachLog.create({
          data: {
            leadId: lead.id, type: 'in_person', direction: 'outbound',
            subject: 'Site visit and quote',
            outcome: stage === 'sold' ? 'sold' : 'quote_sent',
            createdAt: new Date(created.getTime() + rand(7,21)*86400000),
          },
        });
      }
    }
  }
  console.log('  Leads: 45');

  // ─── SEO KEYWORDS ────────────────────────────
  const keywords = [
    { kw: 'fireplace springfield mo', cat: 'primary', rank: 4, prev: 6, vol: 880, page: '/gas-fireplaces' },
    { kw: 'gas fireplace installation springfield', cat: 'primary', rank: 7, prev: 9, vol: 320, page: '/gas-fireplaces' },
    { kw: 'fireplace store near me', cat: 'local', rank: 3, prev: 3, vol: 14800, page: '/' },
    { kw: 'hearth products ozark mo', cat: 'local', rank: 12, prev: 18, vol: 90, page: null },
    { kw: 'fireplace insert nixa mo', cat: 'local', rank: 15, prev: null, vol: 70, page: '/fireplace-inserts' },
    { kw: 'gas fireplace cost', cat: 'long_tail', rank: 22, prev: 28, vol: 4400, page: null },
    { kw: 'wood burning fireplace springfield', cat: 'secondary', rank: 8, prev: 11, vol: 210, page: '/wood-fireplaces' },
    { kw: 'fireplace installation cost', cat: 'long_tail', rank: 35, prev: 42, vol: 6600, page: null },
    { kw: 'best fireplace for new construction', cat: 'long_tail', rank: 18, prev: 25, vol: 1900, page: null },
    { kw: 'fireplace dealer springfield mo', cat: 'primary', rank: 2, prev: 2, vol: 170, page: '/' },
    { kw: 'pellet stove springfield mo', cat: 'secondary', rank: 11, prev: 14, vol: 140, page: '/pellet-stoves' },
    { kw: 'outdoor fireplace ozark mo', cat: 'local', rank: null, prev: null, vol: 50, page: null },
    { kw: 'electric fireplace springfield', cat: 'secondary', rank: 19, prev: null, vol: 260, page: '/electric-fireplaces' },
    { kw: 'fireplace repair springfield mo', cat: 'primary', rank: 5, prev: 7, vol: 390, page: '/services/repair' },
    { kw: 'napoleon fireplace dealer missouri', cat: 'long_tail', rank: 6, prev: 8, vol: 110, page: '/brands/napoleon' },
  ];
  for (const kw of keywords) {
    await prisma.seoKeyword.create({
      data: { keyword: kw.kw, category: kw.cat, currentRank: kw.rank, previousRank: kw.prev, monthlyVolume: kw.vol, targetPage: kw.page, isTracking: true, lastChecked: ago(3) },
    });
  }
  console.log(`  SEO Keywords: ${keywords.length}`);

  // ─── SEO TASKS ───────────────────────────────
  const tasks = [
    { title: 'Add meta description to /gas-fireplaces', desc: 'This page has no meta description. Google is showing a random snippet instead of something compelling.', priority: 'critical', cat: 'technical', page: '/gas-fireplaces', impact: 'Could improve click-through rate by 15-30% for "gas fireplace springfield" searches.' },
    { title: 'Write blog post: "Fireplace Installation Cost in Springfield MO"', desc: 'You\'re not ranking for "fireplace installation cost" (6,600 searches/mo). A detailed local cost guide could capture this traffic.', priority: 'high', cat: 'content', impact: 'Could bring 50-100 new visitors per month and establish you as the local expert.' },
    { title: 'Compress images on /wood-fireplaces', desc: 'This page loads in 6.2 seconds. The images are huge uncompressed JPEGs. Compress them to WebP format.', priority: 'high', cat: 'speed', page: '/wood-fireplaces', impact: 'Page speed directly affects Google ranking. Getting under 3 seconds could move you up 3-5 positions.' },
    { title: 'Add alt text to 14 images', desc: '14 product images across your site are missing alt text. Google can\'t "see" images without it.', priority: 'medium', cat: 'technical', impact: 'Helps Google understand your products and can drive image search traffic.' },
    { title: 'Create a page for "outdoor fireplaces"', desc: 'You\'re getting zero traffic for outdoor fireplace searches. Competitors have dedicated pages. You need one too.', priority: 'medium', cat: 'content', impact: 'Outdoor fireplace searches spike March-June. Get ahead of next season.' },
    { title: 'Fix broken internal links (3 found)', desc: 'Three pages have links pointing to pages that don\'t exist anymore. This confuses Google and wastes your ranking power.', priority: 'high', cat: 'technical', impact: 'Quick fix that immediately helps Google crawl your site better.' },
    { title: 'Add FAQ section to /fireplace-inserts', desc: 'People search lots of questions about inserts. An FAQ section would help you rank for these "how" and "what" searches.', priority: 'medium', cat: 'content', page: '/fireplace-inserts', impact: 'FAQ sections often appear as rich results in Google, giving you more visibility.' },
    { title: 'Claim Yelp business listing', desc: 'Your Yelp profile is unclaimed. Someone else could claim it. Claim it and make sure the name/address/phone matches Google.', priority: 'high', cat: 'local', impact: 'Consistent business info across platforms is a major local SEO ranking factor.' },
  ];
  for (const t of tasks) {
    await prisma.seoTask.create({ data: { title: t.title, description: t.desc, priority: t.priority, category: t.cat, page: t.page, impact: t.impact } });
  }
  console.log(`  SEO Tasks: ${tasks.length}`);

  // ─── SEO PAGES ───────────────────────────────
  const pages = [
    { url: '/', title: "Aaron's Fireplace | Springfield MO Fireplace Store", h1: "Aaron's Fireplace", wordCount: 850, health: 82, speed: 2100, issues: [] },
    { url: '/gas-fireplaces', title: null, h1: 'Gas Fireplaces', wordCount: 320, health: 38, speed: 3400, issues: ['Missing meta description','Low word count (aim for 800+)','Only 1 internal link'] },
    { url: '/wood-fireplaces', title: 'Wood Burning Fireplaces | Aaron\'s Fireplace', h1: 'Wood Burning Fireplaces', wordCount: 450, health: 52, speed: 6200, issues: ['Page loads too slowly (6.2s)','Missing alt text on 5 images'] },
    { url: '/fireplace-inserts', title: 'Fireplace Inserts Springfield MO', h1: 'Fireplace Inserts', wordCount: 280, health: 45, speed: 2800, issues: ['Low word count','No FAQ section','Missing alt text on 3 images'] },
    { url: '/pellet-stoves', title: 'Pellet Stoves | Springfield MO', h1: 'Pellet Stoves', wordCount: 600, health: 71, speed: 2400, issues: ['Could use more internal links'] },
    { url: '/electric-fireplaces', title: 'Electric Fireplaces', h1: 'Electric Fireplaces', wordCount: 200, health: 35, speed: 2900, issues: ['Missing meta description','Very low word count','No internal links to other pages'] },
    { url: '/services/repair', title: 'Fireplace Repair Springfield MO | Aaron\'s Fireplace', h1: 'Fireplace Repair', wordCount: 720, health: 78, speed: 1900, issues: [] },
    { url: '/about', title: 'About Aaron\'s Fireplace', h1: 'About Us', wordCount: 400, health: 65, speed: 2100, issues: ['Missing alt text on 6 images'] },
  ];
  for (const p of pages) {
    await prisma.seoPage.create({
      data: { url: p.url, title: p.title, h1: p.h1, wordCount: p.wordCount, healthScore: p.health, loadTimeMs: p.speed, issues: JSON.stringify(p.issues), internalLinks: rand(1,8), externalLinks: rand(0,3), lastAudited: ago(7), hasAltTags: p.issues.some(i => i.includes('alt text')) ? false : true },
    });
  }
  console.log(`  SEO Pages: ${pages.length}`);

  // ─── GBP REVIEWS ─────────────────────────────
  const reviewTexts = [
    { name: 'Mike Thompson', rating: 5, text: 'Aaron and his team were fantastic. They installed our gas fireplace during our new build and it looks incredible. Great price too.', status: 'responded', response: 'Thanks Mike! It was great working with you and your builder on the Greenbridge project. Enjoy the new fireplace!' },
    { name: 'Sarah M.', rating: 5, text: 'Best fireplace store in Springfield! Huge selection and really knowledgeable staff. They helped us pick the perfect insert for our older home.', status: 'responded', response: 'Thanks Sarah! We love helping people find the right fit. Let us know if you need anything!' },
    { name: 'David Clark', rating: 4, text: 'Good experience overall. Installation was professional and on time. Only reason for 4 stars is the wait time for the unit to arrive was longer than expected.', status: 'responded', response: 'Thanks David! Sorry about the wait — supply chains have been tough. Glad the install went well!' },
    { name: 'Jennifer L.', rating: 5, text: 'We just moved into our new home in Riverton Park and Aaron\'s did our fireplace. Couldn\'t be happier with the result.', status: 'needs_response', response: null },
    { name: 'Brad Wilson', rating: 3, text: 'Decent work but the communication could have been better. Had to call multiple times to get status updates on my order.', status: 'needs_response', response: null },
    { name: 'Rachel Edwards', rating: 5, text: 'Aaron personally came out to our house to measure and recommend options. You don\'t get that kind of service at the big box stores. Highly recommend.', status: 'needs_response', response: null },
    { name: 'Tom B.', rating: 5, text: 'Third fireplace we\'ve bought from Aaron\'s. Consistent quality every time. They\'re our go-to for all our rental properties.', status: 'responded', response: 'Tom, you\'re the best! Thanks for your continued trust. See you next time!' },
    { name: 'Karen Reynolds', rating: 1, text: 'Very disappointed. The fireplace had a manufacturer defect and it took 3 weeks to get it resolved. Not acceptable.', status: 'needs_response', response: null },
    { name: 'Chris Martinez', rating: 5, text: 'Incredible outdoor fireplace setup for our patio. Friends are jealous. Aaron\'s team nailed the design.', status: 'responded', response: 'Thanks Chris! Your patio turned out amazing. Enjoy those Ozarks evenings!' },
  ];
  for (let i = 0; i < reviewTexts.length; i++) {
    const r = reviewTexts[i];
    await prisma.gbpReview.create({
      data: { reviewerName: r.name, rating: r.rating, text: r.text, reviewDate: ago(90 - i * 10), responseText: r.response, responseDate: r.response ? ago(90 - i * 10 - 1) : null, status: r.status, platform: 'google' },
    });
  }
  console.log(`  GBP Reviews: ${reviewTexts.length}`);

  // ─── GBP POSTS ───────────────────────────────
  const gbpPosts = [
    { title: 'Fall Fireplace Sale — 15% Off Gas Inserts', body: 'Get ready for the cold season! 15% off all gas fireplace inserts through October 31st. Schedule your free consultation today.', type: 'offer', status: 'published', pub: ago(5) },
    { title: 'New Napoleon Linear Series In Stock', body: 'Just got the new Napoleon Luxuria series in our showroom. Come see the 50" and 62" models in person. Stunning modern designs perfect for new construction.', type: 'product', status: 'published', pub: ago(18) },
    { title: 'Before & After: Rivercut Home Fireplace Install', body: 'Check out this beautiful gas fireplace we installed in a new home in the Rivercut subdivision. Stone surround with a reclaimed wood mantel. The homeowners are thrilled!', type: 'update', status: 'published', pub: ago(32) },
    { title: 'Winter Tune-Up Special', body: 'Before you light that first fire this season, make sure your fireplace is safe and efficient. $99 tune-up special this month only.', type: 'offer', status: 'draft' },
    { title: 'Employee Spotlight: Meet Our Lead Installer', body: 'With 15 years of experience and over 500 installations, our lead installer ensures every fireplace is perfect. Learn more about the team behind your fireplace.', type: 'update', status: 'draft' },
  ];
  for (const p of gbpPosts) {
    await prisma.gbpPost.create({
      data: { title: p.title, body: p.body, type: p.type, status: p.status, publishedAt: p.status === 'published' ? p.pub : null },
    });
  }
  console.log(`  GBP Posts: ${gbpPosts.length}`);

  // ─── COMPETITORS ─────────────────────────────
  const competitors = [
    { name: 'The Fireplace Center', website: 'thefireplacecenter.com', rating: 4.6, reviews: 87, freq: 'weekly' },
    { name: 'Ozark Hearth & Home', website: 'ozarkhearth.com', rating: 4.3, reviews: 42, freq: 'monthly' },
    { name: 'Springfield Fireplace & Patio', website: 'springfieldfireplace.com', rating: 4.8, reviews: 124, freq: 'weekly' },
    { name: 'Lowes (Springfield)', website: 'lowes.com', rating: 3.9, reviews: 340, freq: 'never' },
    { name: 'Home Depot (Springfield)', website: 'homedepot.com', rating: 3.8, reviews: 290, freq: 'never' },
  ];
  for (const c of competitors) {
    await prisma.competitor.create({
      data: { name: c.name, website: c.website, googleRating: c.rating, reviewCount: c.reviews, gbpPostFreq: c.freq, lastChecked: ago(3) },
    });
  }
  console.log(`  Competitors: ${competitors.length}`);

  // ─── CONTENT CALENDAR ────────────────────────
  const contentItems = [
    { title: 'Fireplace Installation Cost in Springfield MO (2025 Guide)', type: 'blog_post', status: 'idea', kw: 'fireplace installation cost springfield mo', vol: 320, outline: 'Cover gas vs wood vs electric costs, new construction vs retrofit, include local pricing from our actual installs.' },
    { title: 'Gas vs Wood Fireplace: Which Is Right for Your Missouri Home?', type: 'blog_post', status: 'planned', kw: 'gas vs wood fireplace', vol: 2400, due: ago(-14), outline: 'Compare costs, maintenance, efficiency. Include local angle about natural gas availability and firewood sources.' },
    { title: 'Fall Fireplace Prep Checklist', type: 'blog_post', status: 'published', kw: 'fireplace maintenance checklist', vol: 1200, pub: ago(30), views: 340, leads: 3 },
    { title: 'Why Every New Home in Springfield Needs a Fireplace', type: 'blog_post', status: 'drafting', kw: 'new home fireplace springfield', vol: 90, outline: 'Tie to local permit data. X new homes built last year, Y% included fireplaces. ROI of adding during construction.' },
    { title: 'Instagram: Before/After Carousel — Greenbridge Install', type: 'social_post', status: 'published', pub: ago(7), views: 890, leads: 0 },
    { title: 'Partner Spotlight: Built By Brett x Aaron\'s Fireplace', type: 'blog_post', status: 'idea', outline: 'Co-branded content with our builder partner. Show recent projects, explain the partnership model.' },
    { title: 'Outdoor Fireplace Ideas for Ozarks Living', type: 'blog_post', status: 'idea', kw: 'outdoor fireplace ozark mo', vol: 50, outline: 'Target the outdoor living keyword gap. Show our outdoor installs, cover costs, patio integration.' },
    { title: 'Video: Fireplace Showroom Tour', type: 'video', status: 'planned', due: ago(-21), outline: 'Walk-through of the showroom showing gas, wood, electric, and outdoor options. Post on YouTube and embed on site.' },
  ];
  for (const c of contentItems) {
    await prisma.contentItem.create({
      data: { title: c.title, type: c.type, status: c.status, targetKeyword: c.kw, searchVolume: c.vol, dueDate: c.due, publishDate: c.pub, outline: c.outline, pageViews: c.views, leadsGenerated: c.leads },
    });
  }
  console.log(`  Content Items: ${contentItems.length}`);

  // ─── OUTREACH TEMPLATES ──────────────────────
  const templates = [
    { name: 'Homeowner Intro (Permit)', type: 'homeowner_intro', channel: 'email', subject: 'Fireplace options for your new home at {{address}}', body: 'Hi {{firstName}},\n\nCongratulations on your new home at {{address}}! I\'m Aaron from Aaron\'s Fireplace here in Springfield.\n\nI noticed your building permit was recently filed and wanted to reach out while there\'s still time to include a fireplace in your build. Once framing starts, it gets a lot more expensive to add one later.\n\nWe offer free consultations and work directly with your builder ({{builderName}}). Most new construction installs run $2,500-$6,000.\n\nWould you be open to a quick chat?\n\nAaron\nAaron\'s Fireplace\n(417) 823-3411' },
    { name: 'Builder Partnership Pitch', type: 'builder_pitch', channel: 'email', subject: 'Fireplace partnership opportunity for {{builderName}}', body: 'Hi,\n\nI\'m Aaron from Aaron\'s Fireplace. I work with several builders in the Springfield area as their go-to fireplace supplier.\n\nWhat that looks like:\n- Wholesale pricing on gas, wood, and electric units\n- We coordinate directly with your framing crew\n- Quick turnaround — we won\'t slow down your schedule\n- Warranty support for your homebuyers\n\nWould you be open to a quick meeting?\n\nAaron\n(417) 823-3411' },
    { name: 'Follow-Up (No Response)', type: 'follow_up', channel: 'email', subject: 'Quick follow-up about your fireplace', body: 'Hi {{firstName}},\n\nJust following up on my earlier message about fireplace options for your new home. I know things get busy during a build!\n\nThe key timing note: the fireplace rough-in needs to happen during framing. After that, it costs $3,000-$5,000 more.\n\nHappy to work around your schedule. Even a 10-minute call would let me give you a ballpark.\n\nAaron\n(417) 823-3411' },
    { name: 'Quote Follow-Up', type: 'quote_follow_up', channel: 'email', subject: 'Checking in on your fireplace quote', body: 'Hi {{firstName}},\n\nWanted to check in on the quote I sent over for your {{productInterest}} at {{address}}. Any questions I can answer?\n\nIf the timing or budget isn\'t right, no worries at all. Just let me know and I won\'t keep bugging you.\n\nAaron' },
    { name: 'Thank You + Review Request', type: 'thank_you', channel: 'email', subject: 'Your new fireplace is installed!', body: 'Hi {{firstName}},\n\nHope you\'re enjoying the new {{productInterest}}! It was great working with you.\n\nIf you have a moment, a Google review would mean the world to our small business. Here\'s the link: [Google Review Link]\n\nAnd if anything comes up with the fireplace, don\'t hesitate to call.\n\nThanks again,\nAaron' },
  ];
  for (const t of templates) {
    await prisma.outreachTemplate.create({ data: t });
  }
  console.log(`  Outreach Templates: ${templates.length}`);

  console.log('\n✅ Seed complete! Run `npm run dev` to start the app.');
}

seed().catch(console.error).finally(() => prisma.$disconnect());
