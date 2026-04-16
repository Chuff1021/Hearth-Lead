/**
 * Google Ads API integration.
 *
 * The Google Ads API requires:
 * - GOOGLE_ADS_DEVELOPER_TOKEN (apply at ads.google.com manager account)
 * - GOOGLE_ADS_CUSTOMER_ID (your 10-digit ID, no dashes)
 * - OAuth refresh token (same as GBP)
 *
 * This module uses the REST API directly (not the SDK) to keep the bundle small.
 */
import { getAccessToken, isGoogleConnected } from './client';

const DEVELOPER_TOKEN = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
const CUSTOMER_ID = process.env.GOOGLE_ADS_CUSTOMER_ID;
const ADS_API_VERSION = 'v18';

export function isGoogleAdsConnected(): boolean {
  return isGoogleConnected() && !!DEVELOPER_TOKEN && !!CUSTOMER_ID;
}

async function adsRequest(path: string, body: unknown): Promise<unknown | null> {
  if (!isGoogleAdsConnected()) return null;
  const token = await getAccessToken();
  if (!token) return null;

  const url = `https://googleads.googleapis.com/${ADS_API_VERSION}/customers/${CUSTOMER_ID}${path}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'developer-token': DEVELOPER_TOKEN!,
      'login-customer-id': CUSTOMER_ID!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    console.error(`Google Ads API ${res.status}:`, await res.text());
    return null;
  }
  return res.json();
}

// ─── CAMPAIGN ACTIONS ────────────────────────────────────

export async function pauseCampaign(campaignResourceName: string): Promise<boolean> {
  const result = await adsRequest('/campaigns:mutate', {
    operations: [{
      update: { resourceName: campaignResourceName, status: 'PAUSED' },
      updateMask: 'status',
    }],
  });
  return !!result;
}

export async function enableCampaign(campaignResourceName: string): Promise<boolean> {
  const result = await adsRequest('/campaigns:mutate', {
    operations: [{
      update: { resourceName: campaignResourceName, status: 'ENABLED' },
      updateMask: 'status',
    }],
  });
  return !!result;
}

/**
 * Update a campaign's daily budget.
 * Note: Budget is on a separate CampaignBudget resource — needs the budget resource name.
 */
export async function updateBudget(budgetResourceName: string, dailyAmountUsd: number): Promise<boolean> {
  // Google Ads expects amount in micros (1 USD = 1,000,000 micros)
  const amountMicros = Math.round(dailyAmountUsd * 1_000_000);
  const result = await adsRequest('/campaignBudgets:mutate', {
    operations: [{
      update: { resourceName: budgetResourceName, amountMicros: amountMicros.toString() },
      updateMask: 'amount_micros',
    }],
  });
  return !!result;
}

// ─── KEYWORD ACTIONS ─────────────────────────────────────

export async function addKeywords(adGroupResourceName: string, keywords: Array<{ text: string; matchType: 'EXACT' | 'PHRASE' | 'BROAD' }>): Promise<boolean> {
  const operations = keywords.map(kw => ({
    create: {
      adGroup: adGroupResourceName,
      status: 'ENABLED',
      keyword: { text: kw.text, matchType: kw.matchType },
    },
  }));

  const result = await adsRequest('/adGroupCriteria:mutate', { operations });
  return !!result;
}

export async function addNegativeKeywords(campaignResourceName: string, keywords: string[]): Promise<boolean> {
  const operations = keywords.map(text => ({
    create: {
      campaign: campaignResourceName,
      negative: true,
      keyword: { text, matchType: 'BROAD' },
    },
  }));

  const result = await adsRequest('/campaignCriteria:mutate', { operations });
  return !!result;
}

export async function pauseKeyword(criterionResourceName: string): Promise<boolean> {
  const result = await adsRequest('/adGroupCriteria:mutate', {
    operations: [{
      update: { resourceName: criterionResourceName, status: 'PAUSED' },
      updateMask: 'status',
    }],
  });
  return !!result;
}

// ─── REPORTING (PULL DATA) ───────────────────────────────

/**
 * Fetch campaign performance using the Google Ads Query Language (GAQL).
 */
export async function fetchCampaignPerformance(): Promise<unknown[] | null> {
  const query = `
    SELECT
      campaign.id, campaign.name, campaign.status, campaign.advertising_channel_type,
      campaign_budget.amount_micros,
      metrics.impressions, metrics.clicks, metrics.ctr, metrics.average_cpc,
      metrics.cost_micros, metrics.conversions, metrics.cost_per_conversion
    FROM campaign
    WHERE segments.date DURING LAST_30_DAYS
  `;

  const result = await adsRequest('/googleAds:search', { query: query.trim() }) as { results?: unknown[] } | null;
  return result?.results || null;
}

export async function fetchKeywordPerformance(): Promise<unknown[] | null> {
  const query = `
    SELECT
      ad_group_criterion.criterion_id, ad_group_criterion.keyword.text,
      ad_group_criterion.keyword.match_type, ad_group_criterion.quality_info.quality_score,
      campaign.name, ad_group.name,
      metrics.impressions, metrics.clicks, metrics.ctr, metrics.average_cpc,
      metrics.conversions, metrics.cost_per_conversion
    FROM keyword_view
    WHERE segments.date DURING LAST_30_DAYS
    ORDER BY metrics.clicks DESC
    LIMIT 100
  `;

  const result = await adsRequest('/googleAds:search', { query: query.trim() }) as { results?: unknown[] } | null;
  return result?.results || null;
}
