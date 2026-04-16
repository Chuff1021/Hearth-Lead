/**
 * Google API client — handles OAuth token refresh and authenticated requests.
 *
 * Used by all Google API integrations: GBP, Search Console, Analytics, Ads.
 *
 * Required env vars:
 *   GOOGLE_CLIENT_ID — from Google Cloud Console OAuth credentials
 *   GOOGLE_CLIENT_SECRET — from Google Cloud Console OAuth credentials
 *   GOOGLE_REFRESH_TOKEN — obtained after running OAuth flow once
 *
 * Optional env vars:
 *   GOOGLE_BUSINESS_ACCOUNT — your GBP account ID (e.g., "accounts/12345")
 *   GOOGLE_BUSINESS_LOCATION — your GBP location ID (e.g., "locations/67890")
 *   GOOGLE_SEARCH_CONSOLE_SITE — your verified site URL
 *   GOOGLE_ANALYTICS_PROPERTY — your GA4 property ID (numeric)
 *   GOOGLE_ADS_DEVELOPER_TOKEN — from Google Ads Manager account
 *   GOOGLE_ADS_CUSTOMER_ID — your 10-digit Google Ads customer ID
 */

let cachedAccessToken: { token: string; expiresAt: number } | null = null;

export function isGoogleConnected(): boolean {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN);
}

/**
 * Get a valid access token, refreshing if needed.
 */
export async function getAccessToken(): Promise<string | null> {
  if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now() + 60000) {
    return cachedAccessToken.token;
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) return null;

  try {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!res.ok) {
      console.error('Token refresh failed:', await res.text());
      return null;
    }

    const data = await res.json();
    cachedAccessToken = {
      token: data.access_token,
      expiresAt: Date.now() + (data.expires_in * 1000),
    };
    return data.access_token;
  } catch (err) {
    console.error('Token refresh error:', err);
    return null;
  }
}

/**
 * Make an authenticated request to a Google API.
 */
export async function googleFetch(url: string, options: RequestInit = {}): Promise<Response | null> {
  const token = await getAccessToken();
  if (!token) return null;

  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${token}`);
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(url, { ...options, headers });
}
