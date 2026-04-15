import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import {
  generateCompetitorStrategy,
  generateWeeklyStrategy,
  generateAdStrategy,
  generateSeoStrategy,
  generateGbpStrategy,
  generateContentPlan,
  generateReviewResponse,
  generateGbpPostDraft,
  generateAdCopy,
} from '@/lib/ai/engine';

/**
 * POST /api/ai/strategy — Generate specific strategic outputs.
 *
 * Body: { action: string, ...params }
 *
 * Actions:
 *   competitor_strategy — Full competitive analysis
 *   weekly_strategy — This week's marketing plan
 *   ad_strategy — Google Ads optimization plan
 *   seo_strategy — SEO roadmap
 *   gbp_strategy — Google Business domination plan
 *   content_plan — 30-day content calendar
 *   review_response — Draft a review reply
 *   gbp_post — Draft a Google Business post
 *   ad_copy — Write responsive search ad copy
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    let result: unknown;

    switch (action) {
      case 'competitor_strategy':
        result = { strategy: await generateCompetitorStrategy() };
        break;

      case 'weekly_strategy':
        result = { strategy: await generateWeeklyStrategy() };
        break;

      case 'ad_strategy':
        result = { strategy: await generateAdStrategy(body.campaignName) };
        break;

      case 'seo_strategy':
        result = { strategy: await generateSeoStrategy() };
        break;

      case 'gbp_strategy':
        result = { strategy: await generateGbpStrategy() };
        break;

      case 'content_plan':
        result = { plan: await generateContentPlan() };
        break;

      case 'review_response': {
        if (!body.reviewerName || !body.rating || !body.text) {
          return NextResponse.json({ error: 'reviewerName, rating, and text required' }, { status: 400 });
        }
        const response = await generateReviewResponse(body.reviewerName, body.rating, body.text);
        result = { response };
        break;
      }

      case 'gbp_post': {
        const post = await generateGbpPostDraft(body.postType || 'seasonal', body.topic);
        result = { post };
        break;
      }

      case 'ad_copy': {
        if (!body.product) return NextResponse.json({ error: 'product required' }, { status: 400 });
        const copy = await generateAdCopy(body.product, body.campaign);
        result = { copy };
        break;
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('AI strategy error:', err);
    return NextResponse.json({ error: 'AI strategy generation failed' }, { status: 500 });
  }
}
