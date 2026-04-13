/**
 * Seeds the marketing module with realistic Google Ads data, GBP metrics,
 * and AI recommendations. Run AFTER seed-production.ts (adds to existing data).
 */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seed() {
  console.log('📊 Seeding marketing module data...\n');

  // Clear marketing-specific data only
  await prisma.googleAdsRecommendation.deleteMany();
  await prisma.googleAdsKeyword.deleteMany();
  await prisma.googleAdsCampaign.deleteMany();
  await prisma.gbpMetricsSnapshot.deleteMany();
  await prisma.aiConversation.deleteMany();
  await prisma.marketingAttribution.deleteMany();

  // ─── GOOGLE ADS CAMPAIGNS ───────────────────────────────
  const campaigns = [
    { id: 'camp-1', name: 'Gas Fireplaces Springfield', status: 'ENABLED', type: 'SEARCH', budget: 35, spendToday: 28.50, spendMonth: 487, impr: 8420, clicks: 312, ctr: 0.037, cpc: 1.56, conv: 18, costConv: 27.06, convValue: 54000 },
    { id: 'camp-2', name: 'Fireplace Installation', status: 'ENABLED', type: 'SEARCH', budget: 25, spendToday: 24.80, spendMonth: 412, impr: 5680, clicks: 198, ctr: 0.035, cpc: 2.08, conv: 12, costConv: 34.33, convValue: 42000 },
    { id: 'camp-3', name: 'Fireplace Repair & Service', status: 'ENABLED', type: 'SEARCH', budget: 20, spendToday: 14.20, spendMonth: 289, impr: 4200, clicks: 245, ctr: 0.058, cpc: 1.18, conv: 22, costConv: 13.14, convValue: 8800 },
    { id: 'camp-4', name: 'Wood Stoves & Inserts', status: 'ENABLED', type: 'SEARCH', budget: 15, spendToday: 11.40, spendMonth: 198, impr: 2800, clicks: 124, ctr: 0.044, cpc: 1.60, conv: 7, costConv: 28.29, convValue: 17500 },
    { id: 'camp-5', name: 'Brand Campaign - Aarons Fireplace', status: 'ENABLED', type: 'SEARCH', budget: 10, spendToday: 3.20, spendMonth: 67, impr: 890, clicks: 78, ctr: 0.088, cpc: 0.86, conv: 8, costConv: 8.38, convValue: 12000 },
    { id: 'camp-6', name: 'Outdoor Fireplaces', status: 'PAUSED', type: 'SEARCH', budget: 15, spendToday: 0, spendMonth: 0, impr: 0, clicks: 0, ctr: 0, cpc: 0, conv: 0, costConv: 0, convValue: 0 },
    { id: 'camp-7', name: 'New Construction Fireplaces', status: 'ENABLED', type: 'SEARCH', budget: 20, spendToday: 16.80, spendMonth: 312, impr: 3200, clicks: 156, ctr: 0.049, cpc: 2.00, conv: 9, costConv: 34.67, convValue: 36000 },
  ];

  const campaignMap: Record<string, string> = {};
  for (const c of campaigns) {
    const camp = await prisma.googleAdsCampaign.create({
      data: { campaignId: c.id, name: c.name, status: c.status, type: c.type, dailyBudget: c.budget, spendToday: c.spendToday, spendThisMonth: c.spendMonth, impressions: c.impr, clicks: c.clicks, ctr: c.ctr, avgCpc: c.cpc, conversions: c.conv, costPerConv: c.costConv, conversionValue: c.convValue },
    });
    campaignMap[c.id] = camp.id;
  }
  console.log(`  Campaigns: ${campaigns.length}`);

  // ─── GOOGLE ADS KEYWORDS ───────────────────────────────
  const keywords = [
    // Gas Fireplaces campaign
    { camp: 'camp-1', ag: 'Gas Fireplaces - Exact', kw: 'gas fireplace springfield mo', match: 'EXACT', impr: 2400, clicks: 112, ctr: 0.047, cpc: 1.82, conv: 8, qs: 8 },
    { camp: 'camp-1', ag: 'Gas Fireplaces - Exact', kw: 'gas fireplace store near me', match: 'EXACT', impr: 1800, clicks: 78, ctr: 0.043, cpc: 1.45, conv: 4, qs: 7 },
    { camp: 'camp-1', ag: 'Gas Fireplaces - Phrase', kw: 'gas fireplace dealer', match: 'PHRASE', impr: 1200, clicks: 45, ctr: 0.038, cpc: 1.32, conv: 3, qs: 6 },
    { camp: 'camp-1', ag: 'Gas Fireplaces - Broad', kw: 'buy gas fireplace', match: 'BROAD', impr: 3020, clicks: 77, ctr: 0.025, cpc: 1.65, conv: 3, qs: 5 },
    // Installation campaign
    { camp: 'camp-2', ag: 'Installation - Exact', kw: 'fireplace installation springfield mo', match: 'EXACT', impr: 1800, clicks: 72, ctr: 0.040, cpc: 2.45, conv: 6, qs: 7 },
    { camp: 'camp-2', ag: 'Installation - Exact', kw: 'fireplace installer near me', match: 'EXACT', impr: 1400, clicks: 56, ctr: 0.040, cpc: 2.12, conv: 3, qs: 6 },
    { camp: 'camp-2', ag: 'Installation - Phrase', kw: 'fireplace installation cost', match: 'PHRASE', impr: 2480, clicks: 70, ctr: 0.028, cpc: 1.67, conv: 3, qs: 5 },
    // Repair campaign
    { camp: 'camp-3', ag: 'Repair - Exact', kw: 'fireplace repair springfield mo', match: 'EXACT', impr: 1600, clicks: 98, ctr: 0.061, cpc: 1.22, conv: 12, qs: 9 },
    { camp: 'camp-3', ag: 'Repair - Exact', kw: 'chimney repair near me', match: 'EXACT', impr: 1200, clicks: 67, ctr: 0.056, cpc: 1.08, conv: 6, qs: 8 },
    { camp: 'camp-3', ag: 'Repair - Phrase', kw: 'fireplace maintenance', match: 'PHRASE', impr: 1400, clicks: 80, ctr: 0.057, cpc: 1.24, conv: 4, qs: 7 },
    // Wood Stoves campaign
    { camp: 'camp-4', ag: 'Wood Stoves - Exact', kw: 'wood stove springfield mo', match: 'EXACT', impr: 1200, clicks: 52, ctr: 0.043, cpc: 1.72, conv: 4, qs: 7 },
    { camp: 'camp-4', ag: 'Wood Stoves - Phrase', kw: 'fireplace insert', match: 'PHRASE', impr: 1600, clicks: 72, ctr: 0.045, cpc: 1.48, conv: 3, qs: 6 },
    // New Construction campaign
    { camp: 'camp-7', ag: 'New Construction - Exact', kw: 'fireplace for new home', match: 'EXACT', impr: 1400, clicks: 68, ctr: 0.049, cpc: 2.18, conv: 5, qs: 7 },
    { camp: 'camp-7', ag: 'New Construction - Phrase', kw: 'new construction fireplace cost', match: 'PHRASE', impr: 1800, clicks: 88, ctr: 0.049, cpc: 1.82, conv: 4, qs: 6 },
  ];

  for (const kw of keywords) {
    await prisma.googleAdsKeyword.create({
      data: { campaignId: campaignMap[kw.camp], adGroupName: kw.ag, keyword: kw.kw, matchType: kw.match, impressions: kw.impr, clicks: kw.clicks, ctr: kw.ctr, avgCpc: kw.cpc, conversions: kw.conv, costPerConv: kw.conv > 0 ? (kw.clicks * kw.cpc) / kw.conv : 0, qualityScore: kw.qs },
    });
  }
  console.log(`  Keywords: ${keywords.length}`);

  // ─── AI RECOMMENDATIONS ────────────────────────────────
  const recs = [
    { camp: 'camp-2', type: 'budget', title: 'Increase Installation campaign budget', desc: 'Your "Fireplace Installation" campaign is hitting its $25/day budget by 2pm every day. You\'re missing about 40% of potential search traffic in the afternoon.', impact: 'Increasing to $40/day could bring ~80 more clicks and 5-6 more conversions per month.' },
    { camp: 'camp-1', type: 'negative_keyword', title: 'Add negative keywords to Gas Fireplaces', desc: 'You\'re spending about $45/month on clicks from people searching "electric fireplace amazon" and "gas fireplace walmart" — these are online shoppers, not store customers. Add "amazon", "walmart", "online", "cheap" as negative keywords.', impact: 'Save ~$45/month in wasted spend, improve conversion rate.' },
    { camp: 'camp-3', type: 'keyword', title: 'Add repair keywords that are converting well', desc: 'Your "fireplace repair springfield mo" keyword has a 12% conversion rate — the highest in your account. Add related terms: "gas fireplace won\'t light", "fireplace maintenance springfield", "chimney inspection springfield mo".', impact: 'Could add 5-8 new conversions per month at your current CPC.' },
    { camp: 'camp-1', type: 'ad_copy', title: 'Refresh Gas Fireplaces ad copy', desc: 'Your current ad for gas fireplaces hasn\'t been updated since it was created. Google rewards fresh ad copy with better ad rank. Here are 3 new headline and description options to test.', impact: 'Fresh ad copy typically improves CTR by 10-20% in the first month.' },
    { camp: null, type: 'schedule', title: 'Pause ads overnight (10pm-6am)', desc: 'Looking at your data, you get zero conversions between 10pm and 6am, but you\'re spending about $8/day during those hours across all campaigns.', impact: 'Save ~$240/month by not showing ads when nobody converts.' },
    { camp: null, type: 'seasonal', title: 'Increase budgets for fall fireplace season', desc: 'Fireplace search volume spikes 300% from August through November. Your current budgets were set during the slower summer months. Recommend increasing all campaign budgets by 50% for Sep-Nov.', impact: 'Capture significantly more high-intent searchers during peak season.' },
    { camp: 'camp-7', type: 'bid', title: 'Increase mobile bids for New Construction', desc: 'Mobile clicks in your New Construction campaign convert 2x better than desktop (6.2% vs 3.1% conversion rate). Homeowners on job sites are searching from their phones.', impact: '+25% mobile bid adjustment could increase mobile conversions by 30%.' },
  ];

  for (const r of recs) {
    await prisma.googleAdsRecommendation.create({
      data: { campaignId: r.camp ? campaignMap[r.camp] : null, type: r.type, title: r.title, description: r.desc, impact: r.impact },
    });
  }
  console.log(`  AI Recommendations: ${recs.length}`);

  // ─── GBP METRICS SNAPSHOTS ────────────────────────────
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const base = isWeekend ? 0.7 : 1.0;

    await prisma.gbpMetricsSnapshot.create({
      data: {
        date,
        views: Math.round((280 + Math.random() * 120) * base),
        searches: Math.round((85 + Math.random() * 40) * base),
        calls: Math.round((3 + Math.random() * 4) * base),
        directions: Math.round((5 + Math.random() * 6) * base),
        websiteClicks: Math.round((8 + Math.random() * 8) * base),
        photoViews: Math.round((40 + Math.random() * 30) * base),
      },
    });
  }
  console.log('  GBP Metrics: 30 days');

  // ─── MARKETING ATTRIBUTION ────────────────────────────
  const sources = [
    { source: 'google_ads', channel: 'paid_search', count: 12 },
    { source: 'organic', channel: 'organic_search', count: 8 },
    { source: 'gbp', channel: 'local', count: 6 },
    { source: 'permit', channel: 'outreach', count: 15 },
    { source: 'referral', channel: 'referral', count: 4 },
    { source: 'direct', channel: 'direct', count: 3 },
  ];

  for (const s of sources) {
    for (let i = 0; i < s.count; i++) {
      const d = new Date();
      d.setDate(d.getDate() - Math.floor(Math.random() * 60));
      await prisma.marketingAttribution.create({
        data: { source: s.source, channel: s.channel, conversionDate: d, revenue: s.source === 'permit' ? 2500 + Math.random() * 5000 : 1000 + Math.random() * 3000 },
      });
    }
  }
  console.log('  Attribution: 48 records');

  console.log('\n✅ Marketing data seeded!');
}

seed().catch(console.error).finally(() => prisma.$disconnect());
