/**
 * Google Business Profile API integration.
 *
 * Reviews API: https://developers.google.com/my-business/reference/rest/v4
 * Posts API: localPosts endpoint
 *
 * Note: GBP API requires approval from Google. Apply at:
 * https://support.google.com/business/workflow/16726127
 */
import { googleFetch, isGoogleConnected } from './client';

const ACCOUNT = process.env.GOOGLE_BUSINESS_ACCOUNT; // e.g., "accounts/12345"
const LOCATION = process.env.GOOGLE_BUSINESS_LOCATION; // e.g., "locations/67890"

export function isGbpConnected(): boolean {
  return isGoogleConnected() && !!ACCOUNT && !!LOCATION;
}

// ─── REVIEWS ────────────────────────────────────────────

interface GbpReview {
  reviewId: string;
  reviewer: { displayName: string };
  starRating: 'STAR_RATING_UNSPECIFIED' | 'ONE' | 'TWO' | 'THREE' | 'FOUR' | 'FIVE';
  comment?: string;
  createTime: string;
  reviewReply?: { comment: string; updateTime: string };
}

const RATING_MAP: Record<string, number> = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };

/**
 * List all reviews for the location.
 */
export async function listReviews(): Promise<GbpReview[] | null> {
  if (!isGbpConnected()) return null;
  const url = `https://mybusiness.googleapis.com/v4/${ACCOUNT}/${LOCATION}/reviews`;
  const res = await googleFetch(url);
  if (!res?.ok) return null;
  const data = await res.json();
  return data.reviews || [];
}

/**
 * Reply to a specific review.
 */
export async function replyToReview(reviewId: string, replyText: string): Promise<boolean> {
  if (!isGbpConnected()) return false;
  const url = `https://mybusiness.googleapis.com/v4/${ACCOUNT}/${LOCATION}/reviews/${reviewId}/reply`;
  const res = await googleFetch(url, {
    method: 'PUT',
    body: JSON.stringify({ comment: replyText }),
  });
  return !!res?.ok;
}

/**
 * Convert GBP review format to our database format.
 */
export function normalizeReview(r: GbpReview) {
  return {
    reviewId: r.reviewId,
    reviewerName: r.reviewer.displayName,
    rating: RATING_MAP[r.starRating] || 0,
    text: r.comment || null,
    reviewDate: new Date(r.createTime),
    responseText: r.reviewReply?.comment || null,
    responseDate: r.reviewReply?.updateTime ? new Date(r.reviewReply.updateTime) : null,
    status: r.reviewReply ? 'responded' : 'needs_response',
  };
}

// ─── POSTS (LOCAL POSTS) ────────────────────────────────

interface GbpPostInput {
  summary: string; // The post text
  callToAction?: { actionType: 'LEARN_MORE' | 'CALL' | 'BOOK' | 'ORDER' | 'SHOP' | 'SIGN_UP'; url?: string };
  topicType?: 'STANDARD' | 'EVENT' | 'OFFER' | 'ALERT' | 'PRODUCT';
  media?: Array<{ mediaFormat: 'PHOTO' | 'VIDEO'; sourceUrl: string }>;
}

/**
 * Publish a Google Business post.
 */
export async function publishPost(post: GbpPostInput): Promise<{ id: string } | null> {
  if (!isGbpConnected()) return null;
  const url = `https://mybusiness.googleapis.com/v4/${ACCOUNT}/${LOCATION}/localPosts`;

  const body: Record<string, unknown> = {
    languageCode: 'en-US',
    summary: post.summary,
    topicType: post.topicType || 'STANDARD',
  };

  if (post.callToAction) {
    body.callToAction = {
      actionType: post.callToAction.actionType,
      ...(post.callToAction.url ? { url: post.callToAction.url } : {}),
    };
  }

  if (post.media && post.media.length > 0) {
    body.media = post.media;
  }

  const res = await googleFetch(url, { method: 'POST', body: JSON.stringify(body) });
  if (!res?.ok) {
    console.error('GBP post publish failed:', await res?.text());
    return null;
  }
  const data = await res.json();
  return { id: data.name };
}

/**
 * List recent local posts.
 */
export async function listPosts(): Promise<unknown[] | null> {
  if (!isGbpConnected()) return null;
  const url = `https://mybusiness.googleapis.com/v4/${ACCOUNT}/${LOCATION}/localPosts`;
  const res = await googleFetch(url);
  if (!res?.ok) return null;
  const data = await res.json();
  return data.localPosts || [];
}

// ─── PERFORMANCE METRICS ────────────────────────────────

/**
 * Fetch GBP performance metrics for the last N days.
 * Uses the new Performance API v1.
 */
export async function fetchPerformanceMetrics(daysBack = 30): Promise<{
  views: number; searches: number; calls: number; directions: number; websiteClicks: number;
} | null> {
  if (!isGbpConnected() || !LOCATION) return null;

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);

  const startStr = `${startDate.getFullYear()}-${startDate.getMonth() + 1}-${startDate.getDate()}`;
  const endStr = `${endDate.getFullYear()}-${endDate.getMonth() + 1}-${endDate.getDate()}`;

  const metrics = ['BUSINESS_IMPRESSIONS_DESKTOP_MAPS', 'BUSINESS_IMPRESSIONS_DESKTOP_SEARCH', 'BUSINESS_IMPRESSIONS_MOBILE_MAPS', 'BUSINESS_IMPRESSIONS_MOBILE_SEARCH', 'CALL_CLICKS', 'BUSINESS_DIRECTION_REQUESTS', 'WEBSITE_CLICKS'];
  const params = new URLSearchParams();
  for (const m of metrics) params.append('dailyMetrics', m);
  params.set('dailyRange.start_date.year', String(startDate.getFullYear()));
  params.set('dailyRange.start_date.month', String(startDate.getMonth() + 1));
  params.set('dailyRange.start_date.day', String(startDate.getDate()));
  params.set('dailyRange.end_date.year', String(endDate.getFullYear()));
  params.set('dailyRange.end_date.month', String(endDate.getMonth() + 1));
  params.set('dailyRange.end_date.day', String(endDate.getDate()));

  const url = `https://businessprofileperformance.googleapis.com/v1/${LOCATION}:fetchMultiDailyMetricsTimeSeries?${params}`;
  const res = await googleFetch(url);
  if (!res?.ok) return null;

  const data = await res.json();
  const totals = { views: 0, searches: 0, calls: 0, directions: 0, websiteClicks: 0 };

  for (const series of data.multiDailyMetricTimeSeries || []) {
    for (const dailyMetric of series.dailyMetricTimeSeries || []) {
      const total = (dailyMetric.timeSeries?.datedValues || []).reduce((s: number, dv: { value?: string }) => s + parseInt(dv.value || '0'), 0);
      const metricName = dailyMetric.dailyMetric;
      if (metricName?.includes('IMPRESSION') && metricName?.includes('MAPS')) totals.views += total;
      else if (metricName?.includes('IMPRESSION') && metricName?.includes('SEARCH')) totals.searches += total;
      else if (metricName === 'CALL_CLICKS') totals.calls += total;
      else if (metricName === 'BUSINESS_DIRECTION_REQUESTS') totals.directions += total;
      else if (metricName === 'WEBSITE_CLICKS') totals.websiteClicks += total;
    }
  }

  return totals;
}
