/**
 * Google OAuth2 + API integration framework.
 *
 * This handles auth for:
 * - Google Business Profile API (reviews, posts, metrics)
 * - Google Search Console API (keyword rankings)
 *
 * Setup:
 * 1. Create a Google Cloud project
 * 2. Enable these APIs: My Business v4.9, Business Information, Business Profile Performance, Search Console
 * 3. Create OAuth2 credentials (Web application)
 * 4. Add redirect URI: http://localhost:3000/api/google/callback
 * 5. Set env vars: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
 * 6. For GBP: Apply for access at https://support.google.com/business/workflow/16726127
 */

export interface GoogleTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

const SCOPES = [
  'https://www.googleapis.com/auth/business.manage',       // GBP
  'https://www.googleapis.com/auth/webmasters.readonly',   // Search Console
].join(' ');

export function getGoogleAuthUrl(): string | null {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) return null;

  const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/google/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: SCOPES,
    access_type: 'offline',
    prompt: 'consent',
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export async function exchangeCodeForTokens(code: string): Promise<GoogleTokens | null> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/google/callback`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
}

export async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.access_token;
}

export function isGoogleConnected(): boolean {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_REFRESH_TOKEN);
}
