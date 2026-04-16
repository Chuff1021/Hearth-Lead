/**
 * Google Search Console API integration.
 * Pulls keyword rankings, impressions, clicks for the website.
 */
import { googleFetch, isGoogleConnected } from './client';

const SITE_URL = process.env.GOOGLE_SEARCH_CONSOLE_SITE;

export function isSearchConsoleConnected(): boolean {
  return isGoogleConnected() && !!SITE_URL;
}

interface SearchAnalyticsRow {
  keys: string[];        // dimensions: query, page, etc.
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

/**
 * Pull search analytics data for the last N days.
 * Default dimensions: query (keyword) + page.
 */
export async function fetchSearchAnalytics(options: {
  daysBack?: number;
  dimensions?: ('query' | 'page' | 'country' | 'device' | 'date')[];
  rowLimit?: number;
} = {}): Promise<SearchAnalyticsRow[] | null> {
  if (!isSearchConsoleConnected()) return null;

  const { daysBack = 28, dimensions = ['query'], rowLimit = 100 } = options;
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);

  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_URL!)}/searchAnalytics/query`;
  const res = await googleFetch(url, {
    method: 'POST',
    body: JSON.stringify({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      dimensions,
      rowLimit,
    }),
  });

  if (!res?.ok) return null;
  const data = await res.json();
  return data.rows || [];
}

/**
 * Get the top performing keywords for the site.
 */
export async function getTopKeywords(daysBack = 28, limit = 50): Promise<Array<{
  keyword: string; clicks: number; impressions: number; ctr: number; position: number;
}> | null> {
  const rows = await fetchSearchAnalytics({ daysBack, dimensions: ['query'], rowLimit: limit });
  if (!rows) return null;

  return rows.map(r => ({
    keyword: r.keys[0],
    clicks: r.clicks,
    impressions: r.impressions,
    ctr: r.ctr,
    position: Math.round(r.position * 10) / 10,
  }));
}

/**
 * Get position for a specific keyword.
 */
export async function getKeywordPosition(keyword: string): Promise<number | null> {
  const rows = await fetchSearchAnalytics({
    daysBack: 7,
    dimensions: ['query'],
    rowLimit: 1000,
  });
  if (!rows) return null;
  const match = rows.find(r => r.keys[0].toLowerCase() === keyword.toLowerCase());
  return match ? Math.round(match.position * 10) / 10 : null;
}
