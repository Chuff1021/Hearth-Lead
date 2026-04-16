import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { isGoogleAdsConnected, pauseCampaign, enableCampaign, updateBudget, addKeywords, addNegativeKeywords } from '@/lib/google/ads';

/**
 * GET — list pending recommendations
 * POST — approve or dismiss a recommendation. If approved AND Google Ads is connected,
 *        actually push the change live via the API.
 */
export async function GET() {
  try {
    const recs = await prisma.googleAdsRecommendation.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'desc' },
      include: { campaign: true },
    });
    return NextResponse.json({ recommendations: recs, googleAdsConnected: isGoogleAdsConnected() });
  } catch {
    return NextResponse.json({ recommendations: [], googleAdsConnected: false });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { recommendationId, action } = await req.json();
    if (!recommendationId || !action) {
      return NextResponse.json({ error: 'recommendationId and action required' }, { status: 400 });
    }

    const rec = await prisma.googleAdsRecommendation.findUnique({
      where: { id: recommendationId },
      include: { campaign: true },
    });
    if (!rec) return NextResponse.json({ error: 'Recommendation not found' }, { status: 404 });

    if (action === 'dismiss') {
      await prisma.googleAdsRecommendation.update({
        where: { id: recommendationId },
        data: { status: 'dismissed' },
      });
      return NextResponse.json({ success: true, message: 'Recommendation dismissed' });
    }

    if (action === 'approve') {
      let actuallyApplied = false;
      let appliedMessage = 'Marked as approved (no Google Ads connection — applied to local data only)';

      // If Google Ads is connected, actually push the change
      if (isGoogleAdsConnected() && rec.details) {
        try {
          const details = JSON.parse(rec.details);

          switch (rec.type) {
            case 'budget':
              if (details.budgetResource && details.newBudgetUsd) {
                actuallyApplied = await updateBudget(details.budgetResource, details.newBudgetUsd);
              }
              break;
            case 'keyword':
              if (details.adGroupResource && details.keywords) {
                actuallyApplied = await addKeywords(details.adGroupResource, details.keywords);
              }
              break;
            case 'negative_keyword':
              if (details.campaignResource && details.keywords) {
                actuallyApplied = await addNegativeKeywords(details.campaignResource, details.keywords);
              }
              break;
            case 'pause_campaign':
              if (details.campaignResource) {
                actuallyApplied = await pauseCampaign(details.campaignResource);
              }
              break;
            case 'enable_campaign':
              if (details.campaignResource) {
                actuallyApplied = await enableCampaign(details.campaignResource);
              }
              break;
          }

          appliedMessage = actuallyApplied
            ? 'Change applied live to your Google Ads account!'
            : 'Recommendation marked approved, but the API call failed. Check Vercel logs.';
        } catch (err) {
          console.error('Failed to apply recommendation:', err);
        }
      }

      // Update local record
      await prisma.googleAdsRecommendation.update({
        where: { id: recommendationId },
        data: { status: 'approved', appliedAt: new Date() },
      });

      // Update local campaign mock if it was a budget change (so dashboard reflects it)
      if (rec.type === 'budget' && rec.campaignId && rec.details) {
        try {
          const details = JSON.parse(rec.details);
          if (details.newBudgetUsd) {
            await prisma.googleAdsCampaign.update({
              where: { id: rec.campaignId },
              data: { dailyBudget: details.newBudgetUsd },
            });
          }
        } catch {}
      }

      return NextResponse.json({ success: true, applied: actuallyApplied, message: appliedMessage });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    console.error('Recommendation action error:', err);
    return NextResponse.json({ error: 'Failed to process action' }, { status: 500 });
  }
}
