import prisma from '@/lib/db';

/**
 * The AI SEO Brain — NVIDIA-powered strategic engine for Aaron's Fireplace.
 *
 * Uses NVIDIA's hosted models via their OpenAI-compatible API.
 * Default model: meta/llama-3.3-70b-instruct (great balance of speed + quality)
 * Override with NVIDIA_MODEL env var. Recommended models:
 *   - meta/llama-3.3-70b-instruct (default — fast, smart, handles strategy well)
 *   - nvidia/llama-3.3-nemotron-super-49b-v1 (NVIDIA-tuned for reasoning)
 *   - deepseek-ai/deepseek-r1 (deepest reasoning, slower)
 *   - meta/llama-3.1-405b-instruct (premium quality, heaviest)
 *
 * This is the core intelligence. It:
 * 1. Gathers all business data (permits, leads, ads, SEO, reviews, competitors)
 * 2. Builds a comprehensive context prompt
 * 3. Sends to NVIDIA model with the specific question
 * 4. Returns strategic, actionable output
 *
 * Works with or without NVIDIA_API_KEY — falls back to built-in analysis.
 */

const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1';
const DEFAULT_MODEL = 'meta/llama-3.3-70b-instruct';

function hasNvidiaKey(): boolean {
  return !!process.env.NVIDIA_API_KEY;
}

async function callNvidia(systemPrompt: string, userMessage: string, options: { maxTokens?: number; temperature?: number } = {}): Promise<string | null> {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) return null;

  const model = process.env.NVIDIA_MODEL || DEFAULT_MODEL;
  const { maxTokens = 2000, temperature = 0.5 } = options;

  try {
    const res = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        max_tokens: maxTokens,
        temperature,
        top_p: 0.9,
        stream: false,
      }),
      signal: AbortSignal.timeout(60000),
    });

    if (!res.ok) {
      console.error(`NVIDIA API ${res.status}:`, await res.text());
      return null;
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (err) {
    console.error('NVIDIA API error:', err);
    return null;
  }
}

// ─── BUSINESS CONTEXT BUILDER ────────────────────────────

async function buildBusinessContext(): Promise<string> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
  const month = now.getMonth(); // 0-indexed

  const [
    permitCount, recentPermits, topSubdivisions, topBuilders,
    leadsByStage, soldLeads,
    campaigns, keywords, pendingRecs,
    seoKeywords, seoTasks, seoPages,
    reviews, recentReviews, competitors,
    gbpMetrics, contentItems,
  ] = await Promise.all([
    prisma.permit.count(),
    prisma.permit.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.permit.groupBy({ by: ['subdivision'], _count: true, where: { subdivision: { not: null } }, orderBy: { _count: { subdivision: 'desc' } }, take: 10 }),
    prisma.permit.groupBy({ by: ['contractorName'], _count: true, where: { contractorName: { not: null } }, orderBy: { _count: { contractorName: 'desc' } }, take: 10 }),
    prisma.lead.groupBy({ by: ['stage'], _count: true }),
    prisma.lead.findMany({ where: { stage: 'sold' }, select: { soldAmount: true, source: true }, take: 50 }),
    prisma.googleAdsCampaign.findMany(),
    prisma.googleAdsKeyword.findMany({ orderBy: { clicks: 'desc' }, take: 20, include: { campaign: { select: { name: true } } } }),
    prisma.googleAdsRecommendation.count({ where: { status: 'pending' } }),
    prisma.seoKeyword.findMany({ where: { isTracking: true }, orderBy: { currentRank: 'asc' } }),
    prisma.seoTask.findMany({ where: { status: { in: ['todo', 'in_progress'] } } }),
    prisma.seoPage.findMany(),
    prisma.gbpReview.findMany({ orderBy: { reviewDate: 'desc' } }),
    prisma.gbpReview.findMany({ where: { reviewDate: { gte: thirtyDaysAgo } }, orderBy: { reviewDate: 'desc' } }),
    prisma.competitor.findMany(),
    prisma.gbpMetricsSnapshot.findMany({ orderBy: { date: 'desc' }, take: 30 }),
    prisma.contentItem.findMany(),
  ]);

  const pipelineMap = Object.fromEntries(leadsByStage.map(l => [l.stage, l._count]));
  const totalRevenue = soldLeads.reduce((s, l) => s + (l.soldAmount || 0), 0);
  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : 'N/A';
  const unrepliedReviews = reviews.filter(r => r.status === 'needs_response');
  const totalAdSpend = campaigns.reduce((s, c) => s + c.spendThisMonth, 0);
  const totalAdConversions = campaigns.reduce((s, c) => s + c.conversions, 0);

  const seasonName = month >= 7 && month <= 1 ? 'PEAK SEASON (Aug-Feb)' : month >= 2 && month <= 4 ? 'SHOULDER SEASON (Mar-May)' : 'OFF SEASON (Jun-Jul)';

  return `
BUSINESS: Aaron's Fireplace — a fireplace/hearth retail store and installation company in Springfield, Missouri.
OWNER: Aaron (the user). Local small business, not a chain.
PRODUCTS: Gas fireplaces, wood-burning fireplaces, fireplace inserts, pellet stoves, electric fireplaces, outdoor fireplaces, gas logs, mantels, accessories. Brands include Napoleon, Heat & Glo, Majestic.
SERVICES: New installation (new construction + retrofit), repair, maintenance, chimney service.
SERVICE AREA: Springfield MO, Nixa, Ozark, Republic, Battlefield, Rogersville, Willard, Strafford — Greene & Christian County.
CUSTOMERS: Homeowners building new homes, homeowners remodeling, walk-in retail, builders/contractors.
SEASON: Currently ${seasonName}. Fireplace search demand peaks Aug-Nov, installation peaks Sep-Feb, repair year-round. Marketing should lead the season by 6-8 weeks.
TODAY: ${now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}

--- PERMIT PIPELINE DATA ---
Total permits tracked: ${permitCount}
New permits (last 30 days): ${recentPermits}
Top subdivisions by activity: ${topSubdivisions.map(s => `${s.subdivision} (${s._count})`).join(', ') || 'N/A'}
Most active builders: ${topBuilders.map(b => `${b.contractorName} (${b._count})`).join(', ') || 'N/A'}

--- LEAD PIPELINE ---
New: ${pipelineMap.new || 0} | Contacted: ${pipelineMap.contacted || 0} | Quoted: ${pipelineMap.quoted || 0} | Sold: ${pipelineMap.sold || 0} | Lost: ${pipelineMap.lost || 0}
Total revenue from closed leads: $${totalRevenue.toLocaleString()}
Revenue by source: ${Object.entries(soldLeads.reduce((acc, l) => { acc[l.source] = (acc[l.source] || 0) + (l.soldAmount || 0); return acc; }, {} as Record<string, number>)).map(([k, v]) => `${k}: $${v.toLocaleString()}`).join(', ') || 'N/A'}

--- GOOGLE ADS ---
${campaigns.length > 0 ? campaigns.map(c => `Campaign "${c.name}" (${c.status}): Budget $${c.dailyBudget}/day, Spend $${c.spendThisMonth.toLocaleString()} MTD, ${c.clicks} clicks, ${c.conversions} conversions, CTR ${(c.ctr * 100).toFixed(1)}%, CPC $${c.avgCpc.toFixed(2)}`).join('\n') : 'No campaigns connected yet'}
Total ad spend this month: $${totalAdSpend.toLocaleString()}
Total ad conversions: ${totalAdConversions}
${totalAdConversions > 0 ? `Cost per conversion: $${(totalAdSpend / totalAdConversions).toFixed(2)}` : ''}
Pending AI recommendations: ${pendingRecs}

Top keywords by performance:
${keywords.slice(0, 10).map(k => `"${k.keyword}" (${k.matchType}) — ${k.clicks} clicks, ${k.conversions} conv, QS: ${k.qualityScore || '?'}/10, CTR: ${(k.ctr * 100).toFixed(1)}%`).join('\n') || 'N/A'}

--- SEO / ORGANIC SEARCH ---
Keywords tracked: ${seoKeywords.length}
${seoKeywords.filter(k => k.currentRank).map(k => `"${k.keyword}" — rank #${k.currentRank}${k.previousRank ? ` (was #${k.previousRank})` : ''}, ${k.monthlyVolume || 0} searches/mo`).join('\n') || 'No ranking data yet'}
Open SEO tasks: ${seoTasks.length} (${seoTasks.filter(t => t.priority === 'critical').length} critical)
Pages audited: ${seoPages.length}
${seoPages.filter(p => (p.healthScore || 0) < 60).map(p => `⚠️ ${p.url} — health score ${p.healthScore}/100: ${p.issues ? JSON.parse(p.issues).join(', ') : 'issues unknown'}`).join('\n') || 'All pages healthy'}

--- GOOGLE BUSINESS PROFILE ---
Total reviews: ${reviews.length}, Average rating: ${avgRating}
Reviews needing response: ${unrepliedReviews.length}
Recent reviews (30 days): ${recentReviews.length} — ratings: ${recentReviews.map(r => r.rating + '★').join(', ') || 'none'}
Negative reviews (≤3 stars): ${reviews.filter(r => r.rating <= 3).length}
${gbpMetrics.length > 0 ? `GBP views (30-day avg): ${Math.round(gbpMetrics.reduce((s, m) => s + m.views, 0) / gbpMetrics.length)}/day
GBP calls (30-day total): ${gbpMetrics.reduce((s, m) => s + m.calls, 0)}
GBP website clicks (30-day total): ${gbpMetrics.reduce((s, m) => s + m.websiteClicks, 0)}` : 'No GBP metrics yet'}

--- COMPETITORS ---
${competitors.map(c => `${c.name}: ${c.googleRating || '?'}★ rating, ${c.reviewCount || '?'} reviews, posts ${c.gbpPostFreq || 'unknown'}`).join('\n') || 'No competitors tracked'}

--- CONTENT ---
Published: ${contentItems.filter(c => c.status === 'published').length}
In progress: ${contentItems.filter(c => c.status === 'drafting' || c.status === 'review').length}
Ideas backlog: ${contentItems.filter(c => c.status === 'idea').length}
`.trim();
}

// ─── CLAUDE AI CALL ──────────────────────────────────────

export async function askAI(userMessage: string, systemOverride?: string): Promise<{ response: string; category: string }> {
  const context = await buildBusinessContext();

  const systemPrompt = systemOverride || `You are the AI marketing strategist for Aaron's Fireplace, a local fireplace/hearth company in Springfield, Missouri. Aaron is talking to you directly — he's a business owner, not a marketer or developer.

YOUR ROLE: You are Aaron's virtual CMO. You analyze all of his business data and give him specific, actionable marketing advice. You think like a senior marketing executive who deeply understands local service businesses, SEO, Google Ads, and Google Business Profile optimization.

YOUR PERSONALITY:
- Direct and confident — tell Aaron what to do, don't hedge
- Use plain language — no marketing jargon unless you explain it
- Always give specific next steps, not vague advice
- Reference his actual data (permit numbers, keyword rankings, ad spend)
- Think about ROI — every recommendation should tie back to revenue
- Be proactive — don't just answer questions, spot opportunities he hasn't asked about
- Think seasonally — fireplace demand peaks Aug-Nov, plan ahead

CURRENT BUSINESS DATA:
${context}

RESPONSE FORMAT:
- Use **bold** for key points and numbers
- Use bullet points for lists
- Keep responses concise but complete — busy business owner reading on his phone
- Always end with a clear "next step" or action item
- If you recommend changes to Google Ads, GBP, or website, be specific about exactly what to change
- When analyzing competitors, focus on actionable gaps Aaron can exploit`;

  if (!hasNvidiaKey()) {
    return fallbackAnalysis(userMessage, context);
  }

  const response = await callNvidia(systemPrompt, userMessage, { maxTokens: 2000, temperature: 0.5 });
  if (!response) return fallbackAnalysis(userMessage, context);

  return { response, category: categorizeMessage(userMessage) };
}

// ─── SPECIALIZED AI FUNCTIONS ────────────────────────────

export async function generateCompetitorStrategy(): Promise<string> {
  const { response } = await askAI(
    'Analyze my competitors and give me a detailed competitive strategy. For each competitor, tell me: what they\'re doing better than me, what I\'m doing better than them, and specific actions I should take to win against them. Focus on Google Business Profile, reviews, and local SEO.',
    undefined,
  );
  return response;
}

export async function generateWeeklyStrategy(): Promise<string> {
  const { response } = await askAI(
    'Give me my weekly marketing strategy. What should I focus on this week across Google Ads, SEO, Google Business, content, and lead outreach? Prioritize by impact. Be specific — tell me exactly what to do, not just what to think about. Reference my actual data.',
    undefined,
  );
  return response;
}

export async function generateAdStrategy(campaignName?: string): Promise<string> {
  const prompt = campaignName
    ? `Analyze my "${campaignName}" Google Ads campaign in detail. What's working, what's not, and what specific changes should I make to keywords, bids, ad copy, and budget?`
    : 'Analyze all of my Google Ads campaigns. Which ones are performing well, which need work? Give me a prioritized list of changes to make, with expected impact for each.';
  const { response } = await askAI(prompt);
  return response;
}

export async function generateSeoStrategy(): Promise<string> {
  const { response } = await askAI(
    'Give me a comprehensive SEO strategy for my fireplace business. Analyze my current keyword rankings, page health, and content gaps. Tell me: which keywords I should prioritize, what content to create, what technical fixes to make, and how to improve my local SEO. Reference my actual ranking data and competitor positions.',
  );
  return response;
}

export async function generateGbpStrategy(): Promise<string> {
  const { response } = await askAI(
    'Analyze my Google Business Profile performance and give me a strategy to dominate local search. Look at my reviews, posting frequency, photos, and how I compare to competitors. Tell me exactly what to post this week, how to get more reviews, and what my competitors are doing that I should copy or counter.',
  );
  return response;
}

export async function generateContentPlan(): Promise<string> {
  const { response } = await askAI(
    'Create a content plan for the next 30 days. Based on my keyword gaps, seasonal trends, permit data, and competitor analysis, give me: 4 blog post topics with target keywords and outlines, 8 Google Business posts, and 4 social media post ideas. Each should tie to a business goal (drive traffic, capture leads, build authority, or support a specific campaign).',
  );
  return response;
}

export async function generateReviewResponse(reviewerName: string, rating: number, reviewText: string): Promise<string> {
  const { response } = await askAI(
    `Write a response to this Google review from ${reviewerName} (${rating} stars): "${reviewText}"

The response should be from Aaron, the owner. It should:
- Be warm and personal, not corporate
- Reference specific things they mentioned
- If positive: thank them genuinely and invite them back
- If negative: acknowledge the issue, apologize, and offer to make it right with a phone call to (417) 823-3411
- Keep it under 150 words
- Don't be sycophantic or over-the-top

Just give me the response text, nothing else.`,
    `You write Google Business review responses for Aaron's Fireplace in Springfield, MO. You write as Aaron, the owner. Be genuine, warm, and professional. Never be generic or templated.`,
  );
  return response;
}

export async function generateGbpPostDraft(postType: string, topic?: string): Promise<{ title: string; body: string; cta: string }> {
  const { response } = await askAI(
    `Write a Google Business Profile post for Aaron's Fireplace.
Type: ${postType}
${topic ? `Topic: ${topic}` : 'Choose a relevant topic based on the current season and business data.'}

Return the post in this exact format:
TITLE: [post title]
BODY: [post body, 100-200 words]
CTA: [one of: LEARN_MORE, CALL, BOOK, ORDER, SHOP]`,
    `You write Google Business posts for Aaron's Fireplace in Springfield, MO. Posts should be conversational, helpful, and include local references. Always include a call to action.`,
  );

  // Parse the response
  const titleMatch = response.match(/TITLE:\s*(.+)/);
  const bodyMatch = response.match(/BODY:\s*([\s\S]+?)(?=CTA:|$)/);
  const ctaMatch = response.match(/CTA:\s*(\w+)/);

  return {
    title: titleMatch?.[1]?.trim() || 'New from Aaron\'s Fireplace',
    body: bodyMatch?.[1]?.trim() || response,
    cta: ctaMatch?.[1]?.trim() || 'CALL',
  };
}

export async function generateAdCopy(product: string, campaign?: string): Promise<string> {
  const { response } = await askAI(
    `Write Google Ads responsive search ad copy for Aaron's Fireplace targeting "${product}" in Springfield, MO.

Give me:
- 10 headlines (max 30 characters each)
- 4 descriptions (max 90 characters each)
${campaign ? `This is for the "${campaign}" campaign.` : ''}

Make the copy compelling, local, and action-oriented. Include the phone number (417) 823-3411 in one headline. Reference the Springfield/Ozarks market. Include a seasonal angle if relevant.`,
  );
  return response;
}

// ─── FALLBACK ANALYSIS (no API key) ──────────────────────

function fallbackAnalysis(message: string, context: string): { response: string; category: string } {
  const lower = message.toLowerCase();
  const category = categorizeMessage(message);

  // Parse some numbers from context for basic analysis
  const permitMatch = context.match(/New permits \(last 30 days\): (\d+)/);
  const recentPermits = permitMatch ? parseInt(permitMatch[1]) : 0;

  const reviewMatch = context.match(/Reviews needing response: (\d+)/);
  const unrepliedReviews = reviewMatch ? parseInt(reviewMatch[1]) : 0;

  const adSpendMatch = context.match(/Total ad spend this month: \$([0-9,]+)/);
  const adSpend = adSpendMatch ? parseInt(adSpendMatch[1].replace(',', '')) : 0;

  if (lower.includes('competitor') || lower.includes('competition')) {
    return {
      response: `**Competitor Analysis (based on tracked data):**

To get AI-powered competitor analysis with specific strategies, add your Anthropic API key (\`NVIDIA_API_KEY\`) to Vercel environment variables.

**What I can see from your data:**
- You're tracking competitors on the Google Business page
- The AI engine needs the Claude API to analyze their strengths/weaknesses and generate strategies

**Quick wins you can do right now:**
1. Check each competitor's Google Business listing — are they posting more often than you?
2. Compare your review count and rating to theirs
3. Search for "fireplace springfield mo" and see who's ranking above you
4. Look at what keywords competitors are bidding on in Google Ads

Set up \`NVIDIA_API_KEY\` in Vercel and I'll give you detailed, data-driven strategies.`,
      category,
    };
  }

  if (lower.includes('strategy') || lower.includes('plan') || lower.includes('focus') || lower.includes('priority') || lower.includes('should')) {
    return {
      response: `**This Week's Priorities (based on your data):**

${unrepliedReviews > 0 ? `1. **Respond to ${unrepliedReviews} Google reviews** — every day without a response hurts your ranking\n` : ''}${recentPermits > 0 ? `2. **${recentPermits} new permits this month** — filter by "hot" and "warm" on the Permits page and start outreach\n` : ''}${adSpend > 0 ? `3. **Review your $${adSpend} in ad spend** — check the Google Ads page for AI recommendations\n` : ''}4. **Post on Google Business** — go to Google Business page and use the AI to draft a post
5. **Audit your website** — go to SEO page and run a site audit

**To unlock full AI strategy (competitor analysis, ad optimization, content planning):**
Add \`NVIDIA_API_KEY\` to your Vercel environment variables. Get a key at console.anthropic.com.`,
      category,
    };
  }

  return {
    response: `I can help with that! For detailed, AI-powered analysis and strategies, connect the Claude AI engine:

1. Get an API key at **console.anthropic.com**
2. Add \`NVIDIA_API_KEY\` to Vercel → Settings → Environment Variables
3. Redeploy (or it picks up on next deploy)

Once connected, I can:
- **Analyze competitors** and tell you exactly how to beat them
- **Optimize your Google Ads** with specific keyword, bid, and budget changes
- **Create SEO strategies** based on your actual ranking data
- **Write ad copy, blog posts, review responses** — all personalized to your business
- **Generate weekly action plans** prioritized by impact

The app works without it (built-in templates), but with Claude it becomes a real AI marketing strategist.`,
    category,
  };
}

function categorizeMessage(msg: string): string {
  const l = msg.toLowerCase();
  if (l.includes('ad') || l.includes('campaign') || l.includes('keyword') || l.includes('bid') || l.includes('budget')) return 'ads';
  if (l.includes('seo') || l.includes('ranking') || l.includes('search console') || l.includes('organic')) return 'seo';
  if (l.includes('review') || l.includes('gbp') || l.includes('google business') || l.includes('post')) return 'gbp';
  if (l.includes('competitor') || l.includes('competition')) return 'strategy';
  if (l.includes('content') || l.includes('blog') || l.includes('article')) return 'content';
  if (l.includes('permit') || l.includes('lead') || l.includes('builder')) return 'leads';
  return 'general';
}
