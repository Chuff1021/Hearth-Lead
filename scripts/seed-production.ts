/**
 * Production seed script — wipes all fake data and populates with REAL permits
 * scraped from actual Greene & Christian County sources.
 *
 * Sources:
 * 1. Springfield Permit Report (www1.springfieldmo.gov/permitreport) — live HTML
 * 2. HBA Excel files (hbaspringfield.com) — monthly .xlsx with $ values
 * 3. Christian County PDFs (christiancountymo.gov) — monthly PDFs
 *
 * Also sets up: real builders (from scraped data), SEO keywords, SEO tasks,
 * outreach templates, and competitors — but NO fake leads or reviews.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function wipeAllData() {
  console.log('🗑️  Wiping all fake data...');
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
  console.log('  Done — database is empty.\n');
}

async function scrapeRealPermits() {
  console.log('🔍 Scraping REAL permits from county sources...\n');

  const { scrapeAllPermits } = await import('../src/lib/scrapers/index');
  const { scorePermitLead } = await import('../src/lib/scoring/lead-score');
  const { geocodeAddress } = await import('../src/lib/geocode');

  const results = await scrapeAllPermits({ monthsBack: 6 });

  let totalPermits = 0;
  let totalGeocode = 0;
  const builderCounts: Record<string, number> = {};

  for (const result of results) {
    console.log(`  ${result.source}: ${result.permits.length} permits found${result.error ? ` (error: ${result.error})` : ''}`);

    for (const permit of result.permits) {
      // Score the permit
      const score = scorePermitLead({
        type: permit.type,
        estimatedValue: permit.estimatedValue,
        squareFootage: permit.squareFootage,
        status: permit.status,
        subdivision: permit.subdivision,
        contractorName: permit.contractorName,
        city: permit.city,
        dateFiled: permit.dateFiled ? new Date(permit.dateFiled) : null,
        isPartnerBuilder: false,
      });

      // Geocode the address
      let lat: number | undefined;
      let lng: number | undefined;
      try {
        const geo = await geocodeAddress(permit.propertyAddress, permit.city);
        if (geo) {
          lat = geo.lat;
          lng = geo.lng;
          totalGeocode++;
        }
      } catch {
        // Geocoding failure is fine — we just won't have map coordinates
      }

      // Deduplicate by permit number
      const existing = await prisma.permit.findUnique({ where: { permitNumber: permit.permitNumber } });
      if (existing) continue;

      // Track builders
      if (permit.contractorName) {
        builderCounts[permit.contractorName] = (builderCounts[permit.contractorName] || 0) + 1;
      }

      await prisma.permit.create({
        data: {
          permitNumber: permit.permitNumber,
          source: permit.source,
          type: permit.type,
          subType: permit.subType,
          status: permit.status,
          propertyAddress: permit.propertyAddress,
          city: permit.city,
          county: permit.county,
          zip: permit.zip,
          ownerName: permit.ownerName,
          contractorName: permit.contractorName,
          subdivision: permit.subdivision,
          estimatedValue: permit.estimatedValue,
          squareFootage: permit.squareFootage,
          dateFiled: permit.dateFiled ? new Date(permit.dateFiled) : null,
          dateApproved: permit.dateApproved ? new Date(permit.dateApproved) : null,
          description: permit.description,
          lat,
          lng,
          leadScore: score.total,
          urgency: score.urgency,
        },
      });
      totalPermits++;

      // Rate-limit geocoding (Census API is free but be nice)
      if (totalGeocode % 5 === 0 && totalGeocode > 0) {
        await new Promise(r => setTimeout(r, 300));
      }
    }
  }

  console.log(`\n  ✅ ${totalPermits} real permits saved, ${totalGeocode} geocoded for map\n`);

  // Create builder records from actual scraped contractor names
  console.log('🏗️  Creating builder records from real permit data...');
  const sortedBuilders = Object.entries(builderCounts).sort((a, b) => b[1] - a[1]);
  let builderCount = 0;

  for (const [name, count] of sortedBuilders) {
    if (count < 1 || !name.trim()) continue;

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const existing = await prisma.builder.findUnique({ where: { slug } });
    if (existing) continue;

    await prisma.builder.create({
      data: {
        slug,
        name: name.trim(),
        totalPermits: count,
        activePermits: count,
        relationship: 'unknown',
      },
    });
    builderCount++;
  }
  console.log(`  ✅ ${builderCount} builders created from permit data\n`);
}

async function seedProductionData() {
  console.log('📋 Setting up production reference data...\n');

  // ─── SEO KEYWORDS (real keywords Aaron's should track) ─────────
  const keywords = [
    { kw: 'fireplace store springfield mo', cat: 'primary', vol: 880 },
    { kw: 'gas fireplace installation springfield mo', cat: 'primary', vol: 320 },
    { kw: 'fireplace store near me', cat: 'local', vol: 14800 },
    { kw: 'fireplace repair springfield mo', cat: 'primary', vol: 390 },
    { kw: 'gas fireplace insert springfield mo', cat: 'primary', vol: 170 },
    { kw: 'wood burning fireplace springfield mo', cat: 'secondary', vol: 210 },
    { kw: 'pellet stove springfield mo', cat: 'secondary', vol: 140 },
    { kw: 'electric fireplace springfield mo', cat: 'secondary', vol: 260 },
    { kw: 'fireplace installation cost', cat: 'long_tail', vol: 6600 },
    { kw: 'gas fireplace cost', cat: 'long_tail', vol: 4400 },
    { kw: 'best fireplace for new construction', cat: 'long_tail', vol: 1900 },
    { kw: 'napoleon fireplace dealer missouri', cat: 'long_tail', vol: 110 },
    { kw: 'hearth products ozark mo', cat: 'local', vol: 90 },
    { kw: 'fireplace insert nixa mo', cat: 'local', vol: 70 },
    { kw: 'outdoor fireplace springfield mo', cat: 'secondary', vol: 170 },
    { kw: 'fireplace showroom springfield mo', cat: 'primary', vol: 110 },
    { kw: 'ventless gas fireplace springfield', cat: 'secondary', vol: 90 },
    { kw: 'fireplace mantels springfield mo', cat: 'secondary', vol: 50 },
    { kw: 'gas log sets springfield mo', cat: 'secondary', vol: 70 },
    { kw: 'chimney repair springfield mo', cat: 'secondary', vol: 260 },
  ];
  for (const kw of keywords) {
    await prisma.seoKeyword.create({
      data: { keyword: kw.kw, category: kw.cat, monthlyVolume: kw.vol, isTracking: true },
    });
  }
  console.log(`  SEO Keywords: ${keywords.length}`);

  // ─── SEO TASKS (actionable items for the real business) ────────
  const tasks = [
    { title: 'Audit your GoDaddy website for SEO issues', desc: 'Run the built-in site audit (SEO page > "Audit Site") against your GoDaddy website. This will find missing meta descriptions, slow pages, missing alt text, and other issues hurting your Google ranking.', priority: 'critical', cat: 'technical', impact: 'This is step one. You can\'t fix what you don\'t know is broken.' },
    { title: 'Claim and verify Google Business Profile', desc: 'Make sure your Google Business Profile is claimed, verified, and has accurate hours, phone, address, and website URL. This is the #1 factor in showing up in the Google Map results.', priority: 'critical', cat: 'local', impact: 'If your GBP isn\'t claimed and optimized, you\'re invisible in local search.' },
    { title: 'Get 5 new Google reviews this month', desc: 'Ask your last 5 customers to leave a Google review. Send them a direct link to your review page. More reviews = higher local ranking.', priority: 'high', cat: 'local', impact: 'Each review directly improves your local ranking and makes customers more likely to call you vs competitors.' },
    { title: 'Add product photos to Google Business', desc: 'Upload 10+ photos of your showroom, installed fireplaces, and products to your Google Business Profile. Businesses with photos get 42% more direction requests.', priority: 'high', cat: 'local', impact: 'Photos make your listing stand out and tell Google your business is active.' },
    { title: 'Post weekly on Google Business Profile', desc: 'Use the GBP post generator in this tool to create a post every week — promotions, new products, project photos, seasonal tips. Regular posting signals to Google that your business is active.', priority: 'medium', cat: 'local', impact: 'Businesses that post weekly rank higher in local results.' },
    { title: 'Write a blog post about fireplace installation costs', desc: '"Fireplace installation cost" gets 6,600 searches per month. If you don\'t have a page on your website answering this question, someone else is getting that traffic.', priority: 'high', cat: 'content', impact: 'Could bring 50-100 new visitors per month looking for exactly what you sell.' },
    { title: 'Check NAP consistency across directories', desc: 'Make sure your business Name, Address, and Phone number are identical on Google, Yelp, BBB, Angi, Facebook, YellowPages, and HomeAdvisor. Inconsistencies hurt your ranking.', priority: 'medium', cat: 'local', impact: 'Google cross-references your info across the web. Mismatches = less trust = lower ranking.' },
    { title: 'Create a page for each service you offer', desc: 'If you do gas fireplaces, wood fireplaces, inserts, stoves, repair, and outdoor — each needs its own page on your website. One page per service = one opportunity to rank for that service.', priority: 'high', cat: 'content', impact: 'You can\'t rank for "gas fireplace installation springfield mo" if you don\'t have a page about gas fireplace installation.' },
  ];
  for (const t of tasks) {
    await prisma.seoTask.create({ data: { title: t.title, description: t.desc, priority: t.priority, category: t.cat, impact: t.impact } });
  }
  console.log(`  SEO Tasks: ${tasks.length}`);

  // ─── OUTREACH TEMPLATES ────────────────────────────────────────
  const templates = [
    { name: 'Homeowner Intro (Permit Lead)', type: 'homeowner_intro', channel: 'email', subject: 'Fireplace options for your new home at {{address}}', body: 'Hi {{firstName}},\n\nCongratulations on your new home at {{address}}! I\'m Aaron from Aaron\'s Fireplace here in Springfield.\n\nI noticed your building permit was recently filed and wanted to reach out while there\'s still time to include a fireplace in your build. Once framing starts, it gets a lot more expensive to add one later.\n\nWe offer free consultations and work directly with your builder. Most new construction installs run $2,500-$6,000.\n\nWould you be open to a quick chat?\n\nAaron\nAaron\'s Fireplace\n(417) 823-3411' },
    { name: 'Builder Partnership Pitch', type: 'builder_pitch', channel: 'email', subject: 'Fireplace partnership — {{builderName}}', body: 'Hi,\n\nI\'m Aaron from Aaron\'s Fireplace — local hearth dealer here in Springfield.\n\nI work with several builders in the area as their go-to fireplace supplier. What that looks like:\n- Wholesale pricing on gas, wood, and electric units\n- We coordinate directly with your framing crew\n- Quick turnaround — we won\'t slow down your schedule\n- Warranty support for your homebuyers\n\nWould you be open to a quick meeting? Happy to bring product info and pricing.\n\nAaron\n(417) 823-3411' },
    { name: 'Follow-Up (No Response)', type: 'follow_up', channel: 'email', subject: 'Quick follow-up — fireplace for your new home', body: 'Hi {{firstName}},\n\nJust following up on my earlier message about fireplace options for your new home. I know things get busy during a build!\n\nThe key timing note: the fireplace rough-in needs to happen during framing. After that, it costs $3,000-$5,000 more.\n\nHappy to work around your schedule. Even a 10-minute call would help.\n\nAaron\n(417) 823-3411' },
    { name: 'Quote Follow-Up', type: 'quote_follow_up', channel: 'email', subject: 'Checking in on your fireplace quote', body: 'Hi {{firstName}},\n\nWanted to check in on the quote I sent for your {{productInterest}} at {{address}}. Any questions I can answer?\n\nIf the timing or budget isn\'t right, no worries at all. Just let me know.\n\nAaron' },
    { name: 'Post-Install Thank You + Review Request', type: 'thank_you', channel: 'email', subject: 'Enjoy your new fireplace!', body: 'Hi {{firstName}},\n\nHope you\'re enjoying the new fireplace! It was great working with you.\n\nIf you have a moment, a Google review would mean the world to our small business:\n[INSERT GOOGLE REVIEW LINK]\n\nAnd if anything comes up with the fireplace, don\'t hesitate to call.\n\nThanks,\nAaron' },
  ];
  for (const t of templates) {
    await prisma.outreachTemplate.create({ data: t });
  }
  console.log(`  Outreach Templates: ${templates.length}`);

  // ─── COMPETITORS (real Springfield-area competitors) ────────────
  const competitors = [
    { name: 'The Fireplace Center', website: 'thefireplacecenter.com' },
    { name: 'Springfield Fireplace & Patio', website: 'springfieldfireplace.com' },
    { name: 'Ozark Hearth & Home' },
    { name: 'Lowes (Springfield)', website: 'lowes.com' },
    { name: 'Home Depot (Springfield)', website: 'homedepot.com' },
    { name: "Menard's (Springfield)", website: 'menards.com' },
  ];
  for (const c of competitors) {
    await prisma.competitor.create({ data: { name: c.name, website: c.website } });
  }
  console.log(`  Competitors: ${competitors.length}`);

  console.log('');
}

async function main() {
  console.log('🔥 Aaron\'s Fireplace Lead Engine — Production Setup\n');
  console.log('='.repeat(55) + '\n');

  await wipeAllData();
  await scrapeRealPermits();
  await seedProductionData();

  // Print summary
  const [permitCount, builderCount, keywordCount, taskCount] = await Promise.all([
    prisma.permit.count(),
    prisma.builder.count(),
    prisma.seoKeyword.count(),
    prisma.seoTask.count(),
  ]);

  const geocodedCount = await prisma.permit.count({ where: { lat: { not: null } } });
  const hotCount = await prisma.permit.count({ where: { urgency: 'hot' } });
  const warmCount = await prisma.permit.count({ where: { urgency: 'warm' } });

  console.log('='.repeat(55));
  console.log('📊 Production Database Summary');
  console.log('='.repeat(55));
  console.log(`  Real permits:     ${permitCount}`);
  console.log(`  Geocoded (map):   ${geocodedCount}`);
  console.log(`  Hot leads:        ${hotCount}`);
  console.log(`  Warm leads:       ${warmCount}`);
  console.log(`  Builders found:   ${builderCount}`);
  console.log(`  SEO keywords:     ${keywordCount}`);
  console.log(`  SEO tasks:        ${taskCount}`);
  console.log('='.repeat(55));
  console.log('\n✅ Production data ready. All permits are REAL.');
  console.log('   Visit your Vercel deployment to see the live data.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
