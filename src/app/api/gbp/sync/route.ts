import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { isGbpConnected, listReviews, normalizeReview, fetchPerformanceMetrics } from '@/lib/google/gbp';

/**
 * Pull all GBP data: reviews + performance metrics.
 * Triggered manually or on a schedule.
 */
export async function GET() {
  if (!isGbpConnected()) {
    return NextResponse.json({
      error: 'Google Business Profile not connected',
      hint: 'Add GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN, GOOGLE_BUSINESS_ACCOUNT, and GOOGLE_BUSINESS_LOCATION to env vars',
    }, { status: 400 });
  }

  const result = { reviewsAdded: 0, reviewsUpdated: 0, metricsAdded: 0, errors: [] as string[] };

  // Pull reviews
  try {
    const reviews = await listReviews();
    if (reviews) {
      for (const r of reviews) {
        const normalized = normalizeReview(r);
        const existing = await prisma.gbpReview.findFirst({ where: { reviewerName: normalized.reviewerName, reviewDate: normalized.reviewDate } });
        if (existing) {
          await prisma.gbpReview.update({ where: { id: existing.id }, data: normalized });
          result.reviewsUpdated++;
        } else {
          await prisma.gbpReview.create({ data: normalized });
          result.reviewsAdded++;
        }
      }
    }
  } catch (err) {
    result.errors.push(`Reviews: ${err instanceof Error ? err.message : 'Unknown'}`);
  }

  // Pull performance metrics for today
  try {
    const metrics = await fetchPerformanceMetrics(1);
    if (metrics) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      await prisma.gbpMetricsSnapshot.upsert({
        where: { date: today },
        update: metrics,
        create: { date: today, ...metrics },
      });
      result.metricsAdded = 1;
    }
  } catch (err) {
    result.errors.push(`Metrics: ${err instanceof Error ? err.message : 'Unknown'}`);
  }

  return NextResponse.json(result);
}
