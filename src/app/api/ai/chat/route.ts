import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { generateReviewResponse, generateGbpPost } from '@/lib/ai/review-responder';
import { formatCurrency } from '@/lib/utils';

/**
 * AI Chat endpoint. Handles natural language queries about the business.
 *
 * If ANTHROPIC_API_KEY is set, uses Claude for intelligent responses.
 * Otherwise, uses built-in data analysis and templates.
 */
export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    if (!message) return NextResponse.json({ error: 'Message required' }, { status: 400 });

    const lower = message.toLowerCase();

    // Route to the right handler based on intent
    let response: string;
    let category: string;

    if (lower.includes('weekly') || lower.includes('summary') || lower.includes('this week') || lower.includes('how') && lower.includes('doing')) {
      response = await generateWeeklySummary();
      category = 'summary';
    } else if (lower.includes('review') && (lower.includes('respond') || lower.includes('reply') || lower.includes('draft'))) {
      response = await handleReviewResponse();
      category = 'gbp';
    } else if (lower.includes('google business') && lower.includes('post') || lower.includes('gbp post') || lower.includes('draft') && lower.includes('post')) {
      response = await handleGbpPostDraft(message);
      category = 'gbp';
    } else if (lower.includes('ad') && (lower.includes('recommend') || lower.includes('improve') || lower.includes('performance') || lower.includes('optim'))) {
      response = await handleAdsRecommendations();
      category = 'ads';
    } else if (lower.includes('ad copy') || lower.includes('write') && lower.includes('ad')) {
      response = await handleAdCopyRequest(message);
      category = 'ads';
    } else if (lower.includes('seo') || lower.includes('keyword') || lower.includes('ranking') || lower.includes('search console')) {
      response = await handleSeoQuery(message);
      category = 'seo';
    } else if (lower.includes('blog') || lower.includes('content') || lower.includes('article')) {
      response = await handleContentRequest(message);
      category = 'content';
    } else if (lower.includes('permit') && (lower.includes('subdivision') || lower.includes('target') || lower.includes('market') || lower.includes('campaign'))) {
      response = await handlePermitMarketingQuery();
      category = 'strategy';
    } else if (lower.includes('focus') || lower.includes('priority') || lower.includes('what should')) {
      response = await handlePrioritiesQuery();
      category = 'strategy';
    } else {
      response = await handleGeneralQuery(message);
      category = 'general';
    }

    // Save conversation
    await prisma.aiConversation.create({
      data: { userMessage: message, aiResponse: response, category },
    }).catch(() => {}); // Don't fail if save fails

    return NextResponse.json({ response, category });
  } catch (err) {
    return NextResponse.json({ response: 'Sorry, I ran into an error. Try again.', category: 'error' });
  }
}

async function generateWeeklySummary(): Promise<string> {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86400000);

  const [newPermits, newLeads, openLeads, soldLeads, unreviewedReviews, campaigns, seoTasks] = await Promise.all([
    prisma.permit.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.lead.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.lead.count({ where: { stage: { in: ['new', 'contacted', 'quoted'] } } }),
    prisma.lead.count({ where: { stage: 'sold', soldDate: { gte: weekAgo } } }),
    prisma.gbpReview.count({ where: { status: 'needs_response' } }),
    prisma.googleAdsCampaign.findMany({ where: { status: 'ENABLED' } }),
    prisma.seoTask.count({ where: { status: 'todo' } }),
  ]);

  const totalAdSpend = campaigns.reduce((s, c) => s + c.spendThisMonth, 0);
  const totalConversions = campaigns.reduce((s, c) => s + c.conversions, 0);
  const overdueFollowUps = await prisma.lead.count({ where: { nextFollowUp: { lt: now }, stage: { in: ['new', 'contacted', 'quoted'] } } });

  const month = now.getMonth();
  const seasonal = month >= 6 && month <= 10
    ? '\n\n**Seasonal note:** We\'re in peak fireplace season (Aug-Feb). This is your time to push hard on ads and content.'
    : month >= 2 && month <= 5
    ? '\n\n**Seasonal note:** Off-season. Focus on repair/maintenance marketing and build up content for fall.'
    : '';

  return `**Here's your weekly marketing snapshot:**

**Permit Pipeline**
• ${newPermits} new building permits found this week
• ${openLeads} leads in your active pipeline
• ${soldLeads} deals closed this week
${overdueFollowUps > 0 ? `• ⚠️ ${overdueFollowUps} follow-ups are overdue — don't let these go cold!` : '• All follow-ups are current ✅'}

**Google Ads**
• ${campaigns.length} active campaigns
• ${formatCurrency(totalAdSpend)} spent this month
• ${totalConversions} conversions
${totalConversions > 0 ? `• Cost per conversion: ${formatCurrency(totalAdSpend / totalConversions)}` : ''}

**Google Business**
${unreviewedReviews > 0 ? `• ⚠️ ${unreviewedReviews} reviews need responses — reply today to keep your rating strong` : '• All reviews responded to ✅'}

**SEO**
• ${seoTasks} open SEO tasks to work on

**What I'd focus on this week:**
${overdueFollowUps > 0 ? `1. Follow up with your ${overdueFollowUps} overdue leads — these are getting cold` : ''}
${unreviewedReviews > 0 ? `${overdueFollowUps > 0 ? '2' : '1'}. Respond to those ${unreviewedReviews} Google reviews` : ''}
${seoTasks > 0 ? `${overdueFollowUps > 0 && unreviewedReviews > 0 ? '3' : overdueFollowUps > 0 || unreviewedReviews > 0 ? '2' : '1'}. Knock out the top SEO task on your list` : ''}${seasonal}`;
}

async function handleReviewResponse(): Promise<string> {
  const unreplied = await prisma.gbpReview.findMany({
    where: { status: 'needs_response' },
    orderBy: { reviewDate: 'desc' },
    take: 3,
  });

  if (unreplied.length === 0) {
    return 'All your Google reviews have been responded to — nice work! Keeping a 100% response rate is great for your local ranking.';
  }

  let response = `You have **${unreplied.length} reviews** that need responses. Here are my drafts:\n\n`;

  for (const review of unreplied) {
    const draft = generateReviewResponse({
      reviewerName: review.reviewerName,
      rating: review.rating,
      text: review.text,
      platform: review.platform,
    });

    response += `---\n**${review.reviewerName}** — ${'⭐'.repeat(review.rating)}\n`;
    if (review.text) response += `> "${review.text.slice(0, 150)}${review.text.length > 150 ? '...' : ''}"\n\n`;
    response += `**My suggested response:**\n${draft}\n\n`;
  }

  response += 'Go to the **Google Business** page to review and send these responses.';
  return response;
}

async function handleGbpPostDraft(message: string): Promise<string> {
  const lower = message.toLowerCase();
  let type: 'seasonal' | 'promotion' | 'product' | 'project_showcase' = 'seasonal';
  if (lower.includes('sale') || lower.includes('promo') || lower.includes('discount') || lower.includes('off')) type = 'promotion';
  else if (lower.includes('product') || lower.includes('showroom') || lower.includes('new arrival') || lower.includes('selection')) type = 'product';
  else if (lower.includes('project') || lower.includes('install') || lower.includes('before') || lower.includes('after')) type = 'project_showcase';

  const post = generateGbpPost(type);

  return `Here's a Google Business post draft for you:\n\n**${post.title}**\n\n${post.body}\n\n*CTA: ${post.ctaType}*\n\nWant me to adjust anything? Otherwise, head to the **Google Business** page to publish it.`;
}

async function handleAdsRecommendations(): Promise<string> {
  const [campaigns, recommendations] = await Promise.all([
    prisma.googleAdsCampaign.findMany({ where: { status: 'ENABLED' } }),
    prisma.googleAdsRecommendation.findMany({ where: { status: 'pending' }, take: 5 }),
  ]);

  if (campaigns.length === 0) {
    return 'I don\'t see any Google Ads campaign data yet. Connect your Google Ads account in **Settings**, or the mock data will load when you seed the database.';
  }

  const totalSpend = campaigns.reduce((s, c) => s + c.spendThisMonth, 0);
  const totalConversions = campaigns.reduce((s, c) => s + c.conversions, 0);

  let response = `**Google Ads Performance This Month:**\n• ${campaigns.length} active campaigns\n• ${formatCurrency(totalSpend)} total spend\n• ${totalConversions} conversions\n`;

  if (totalConversions > 0) {
    response += `• Cost per conversion: ${formatCurrency(totalSpend / totalConversions)}\n`;
  }

  if (recommendations.length > 0) {
    response += `\n**My recommendations:**\n\n`;
    for (const rec of recommendations) {
      response += `**${rec.type.replace('_', ' ').toUpperCase()}:** ${rec.title}\n${rec.description}\n`;
      if (rec.impact) response += `*Impact: ${rec.impact}*\n`;
      response += '\n';
    }
    response += 'Head to **Google Ads** to approve or dismiss these.';
  } else {
    response += '\nNo pending recommendations right now. Your campaigns look good!';
  }

  return response;
}

async function handleAdCopyRequest(message: string): Promise<string> {
  // Determine what the ad is for based on the message
  const lower = message.toLowerCase();
  let product = 'fireplace';
  if (lower.includes('gas')) product = 'gas fireplace';
  else if (lower.includes('wood')) product = 'wood-burning fireplace';
  else if (lower.includes('insert')) product = 'fireplace insert';
  else if (lower.includes('stove')) product = 'pellet stove';
  else if (lower.includes('repair') || lower.includes('maintenance')) product = 'fireplace repair';
  else if (lower.includes('outdoor')) product = 'outdoor fireplace';
  else if (lower.includes('install')) product = 'fireplace installation';

  return `Here are **responsive search ad** options for "${product}" in Springfield MO:\n\n**Headlines (pick up to 15):**\n1. ${product === 'fireplace repair' ? 'Expert Fireplace Repair' : `Premium ${product.split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}s`}\n2. Springfield's Trusted Hearth Shop\n3. Free In-Home Consultation\n4. Visit Our Showroom Today\n5. Licensed & Insured Since 2005\n6. ${product.includes('install') ? 'Save $3K vs Retrofit' : '15% Off This Month'}\n7. 5-Star Rated on Google\n8. Same-Week Installation Available\n9. Financing Options Available\n10. Call (417) 823-3411 Today\n\n**Descriptions (pick up to 4):**\n1. Aaron's Fireplace in Springfield MO — your local ${product} experts. Visit our showroom or call for a free consultation. Serving Greene & Christian County.\n2. Don't wait until winter! Schedule your ${product} ${product.includes('repair') ? 'service' : 'installation'} now and beat the rush. Licensed, insured, and 5-star rated.\n3. From selection to installation, we handle everything. Gas, wood, electric, and outdoor options. Financing available. Call today!\n4. Springfield's #1 rated fireplace dealer. Hundreds of models on display. Expert installation included. Visit us or call (417) 823-3411.\n\nWant me to adjust the tone, add specific promotions, or focus on different benefits?`;
}

async function handleSeoQuery(message: string): Promise<string> {
  const [keywords, tasks, pages] = await Promise.all([
    prisma.seoKeyword.findMany({ where: { isTracking: true }, orderBy: { currentRank: 'asc' }, take: 10 }),
    prisma.seoTask.findMany({ where: { status: 'todo' }, orderBy: { priority: 'asc' }, take: 5 }),
    prisma.seoPage.findMany({ orderBy: { healthScore: 'asc' }, take: 5 }),
  ]);

  const lower = message.toLowerCase();

  if (lower.includes('priority') || lower.includes('top') || lower.includes('should')) {
    let response = '**Your top SEO priorities right now:**\n\n';
    for (let i = 0; i < Math.min(tasks.length, 3); i++) {
      const t = tasks[i];
      response += `**${i + 1}. ${t.title}**\n${t.description || ''}\n`;
      if (t.impact) response += `*Why: ${t.impact}*\n`;
      response += '\n';
    }
    return response || 'No SEO tasks queued. Run a site audit from the **SEO** page to generate tasks.';
  }

  let response = '**Your SEO Snapshot:**\n\n';

  if (keywords.length > 0) {
    const page1 = keywords.filter(k => k.currentRank && k.currentRank <= 10);
    const nearPage1 = keywords.filter(k => k.currentRank && k.currentRank > 10 && k.currentRank <= 20);

    response += `**Rankings:** ${page1.length} keywords on page 1, ${nearPage1.length} on page 2 (close to breaking through)\n\n`;

    if (nearPage1.length > 0) {
      response += '**Quick wins — almost on page 1:**\n';
      for (const kw of nearPage1.slice(0, 3)) {
        response += `• "${kw.keyword}" — currently #${kw.currentRank} (${kw.monthlyVolume || 0} searches/mo)\n`;
      }
      response += '\n';
    }
  }

  if (tasks.length > 0) {
    response += `**${tasks.length} open tasks** — top 3:\n`;
    for (const t of tasks.slice(0, 3)) {
      response += `• [${t.priority.toUpperCase()}] ${t.title}\n`;
    }
  }

  return response;
}

async function handleContentRequest(message: string): Promise<string> {
  const month = new Date().getMonth();
  const isFallWinter = month >= 6 && month <= 1;

  const topics = isFallWinter ? [
    { title: 'Gas Fireplace vs Wood-Burning: Which Is Right for Your Springfield Home?', keyword: 'gas vs wood fireplace springfield mo', vol: 210 },
    { title: 'How Much Does Fireplace Installation Cost in 2026?', keyword: 'fireplace installation cost', vol: 6600 },
    { title: 'Top 5 Fireplace Trends for New Homes in Southwest Missouri', keyword: 'fireplace trends new home', vol: 720 },
  ] : [
    { title: 'Spring Fireplace Maintenance Checklist for Missouri Homeowners', keyword: 'fireplace maintenance checklist', vol: 1200 },
    { title: 'Is It Cheaper to Install a Fireplace During Construction? (Yes — Here\'s Why)', keyword: 'fireplace new construction cost', vol: 1900 },
    { title: 'Outdoor Fireplace Ideas for Ozarks Backyards', keyword: 'outdoor fireplace springfield mo', vol: 170 },
  ];

  let response = '**Blog post ideas based on your keyword gaps and seasonal trends:**\n\n';

  for (let i = 0; i < topics.length; i++) {
    const t = topics[i];
    response += `**${i + 1}. "${t.title}"**\nTarget keyword: "${t.keyword}" (${t.vol.toLocaleString()} monthly searches)\n`;
    if (i === 0) {
      response += `\n**Outline:**\n- Introduction: Why this matters for Springfield homeowners\n- Comparison table: cost, maintenance, efficiency, aesthetics\n- Local angle: natural gas availability, Springfield building codes\n- Your expert recommendation (with CTA to visit showroom)\n- FAQ section for additional keywords\n\n`;
    }
    response += '\n';
  }

  response += 'Want me to write a full draft for any of these? Just say "write #1" or tell me which topic.';
  return response;
}

async function handlePermitMarketingQuery(): Promise<string> {
  const [topSubdivisions, topBuilders, recentPermits] = await Promise.all([
    prisma.permit.groupBy({ by: ['subdivision'], _count: true, where: { subdivision: { not: null } }, orderBy: { _count: { subdivision: 'desc' } }, take: 5 }),
    prisma.permit.groupBy({ by: ['contractorName'], _count: true, where: { contractorName: { not: null } }, orderBy: { _count: { contractorName: 'desc' } }, take: 5 }),
    prisma.permit.count({ where: { createdAt: { gte: new Date(Date.now() - 30 * 86400000) } } }),
  ]);

  let response = `**Permit Data → Marketing Opportunities:**\n\n`;
  response += `${recentPermits} new residential permits in the last 30 days.\n\n`;

  if (topSubdivisions.length > 0) {
    response += '**Hottest subdivisions (most new permits):**\n';
    for (const sub of topSubdivisions) {
      if (sub.subdivision) {
        response += `• ${sub.subdivision} — ${sub._count} permits\n`;
      }
    }
    response += `\n**Marketing ideas:**\n`;
    const topSub = topSubdivisions[0]?.subdivision || 'this area';
    response += `1. **Google Ads:** Create a campaign targeting "${topSub} fireplace" and "new home fireplace ${topSubdivisions[0]?.subdivision?.split(' ')[0] || 'Springfield'}"\n`;
    response += `2. **Blog post:** "Fireplace Options for ${topSub} Homeowners"\n`;
    response += `3. **GBP post:** "Just installed a beautiful fireplace in ${topSub}!" (with a photo)\n\n`;
  }

  if (topBuilders.length > 0) {
    response += '**Most active builders:**\n';
    for (const b of topBuilders.slice(0, 3)) {
      if (b.contractorName) {
        response += `• ${b.contractorName} — ${b._count} permits\n`;
      }
    }
    response += '\nThese builders have the most new homes going up. If you\'re not already partnered with them, now\'s the time to reach out.\n';
  }

  return response;
}

async function handlePrioritiesQuery(): Promise<string> {
  const now = new Date();
  const [overdueLeads, unreviewedReviews, hotPermits, seoTasks, adRecs] = await Promise.all([
    prisma.lead.count({ where: { nextFollowUp: { lt: now }, stage: { in: ['new', 'contacted', 'quoted'] } } }),
    prisma.gbpReview.count({ where: { status: 'needs_response' } }),
    prisma.permit.count({ where: { urgency: { in: ['hot', 'warm'] }, createdAt: { gte: new Date(now.getTime() - 7 * 86400000) } } }),
    prisma.seoTask.findMany({ where: { status: 'todo', priority: { in: ['critical', 'high'] } }, take: 2 }),
    prisma.googleAdsRecommendation.count({ where: { status: 'pending' } }),
  ]);

  let response = '**Here\'s what I\'d focus on this week, in order of priority:**\n\n';
  let priority = 1;

  if (overdueLeads > 0) {
    response += `**${priority}. Follow up with ${overdueLeads} overdue leads** (HIGH)\nThese people were interested in fireplaces and you haven't reached back out. The longer you wait, the colder they get. Go to **Leads** and work through your overdue follow-ups.\n\n`;
    priority++;
  }

  if (unreviewedReviews > 0) {
    response += `**${priority}. Respond to ${unreviewedReviews} Google reviews** (HIGH)\nEvery day you don't respond hurts your local ranking. Go to **Google Business** — I already have draft responses ready.\n\n`;
    priority++;
  }

  if (hotPermits > 0) {
    response += `**${priority}. Contact ${hotPermits} warm/hot permit leads from this week** (HIGH)\nNew permits mean new homes being built RIGHT NOW. The sooner you reach out, the better your chances of getting the fireplace job. Go to **Permits** and filter by "hot" or "warm".\n\n`;
    priority++;
  }

  if (adRecs > 0) {
    response += `**${priority}. Review ${adRecs} Google Ads recommendations** (MEDIUM)\nI have suggestions to improve your ad performance. Go to **Google Ads** to approve or dismiss them.\n\n`;
    priority++;
  }

  for (const task of seoTasks) {
    response += `**${priority}. ${task.title}** (${task.priority.toUpperCase()})\n${task.description || ''}\n${task.impact ? `*${task.impact}*` : ''}\n\n`;
    priority++;
  }

  if (priority === 1) {
    response = 'You\'re all caught up! No urgent tasks right now. Here are some proactive things you could do:\n\n1. Write a blog post (ask me for topic ideas)\n2. Create a Google Business post\n3. Review your Google Ads performance for optimization opportunities';
  }

  return response;
}

async function handleGeneralQuery(message: string): Promise<string> {
  return `I can help with that! Here are the things I'm best at:\n\n• **"How are my ads doing?"** — I'll pull your Google Ads performance\n• **"Write a Google Business post"** — I'll draft one for your approval\n• **"Help me respond to reviews"** — I'll draft personalized responses\n• **"What keywords should I target?"** — SEO analysis and recommendations\n• **"Write ad copy for [product]"** — Responsive search ad headlines and descriptions\n• **"What should I focus on this week?"** — Prioritized to-do list based on all your data\n• **"Any marketing opportunities from permit data?"** — Connect building permits to marketing strategy\n• **"Write a blog post about [topic]"** — SEO-optimized content outline\n\nTry any of these, or ask me something specific about your business!`;
}
