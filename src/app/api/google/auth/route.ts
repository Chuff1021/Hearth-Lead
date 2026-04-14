import { NextResponse } from 'next/server';

/**
 * GET /api/google/auth — Start Google OAuth flow.
 * Redirects the user to Google's consent screen.
 */
export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: 'GOOGLE_CLIENT_ID not set. Add it to your Vercel environment variables first.' },
      { status: 400 }
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';
  const redirectUri = `${siteUrl}/api/google/callback`;

  const scopes = [
    'https://www.googleapis.com/auth/business.manage',       // Google Business Profile
    'https://www.googleapis.com/auth/webmasters.readonly',   // Search Console
    'https://www.googleapis.com/auth/analytics.readonly',    // GA4
    'https://www.googleapis.com/auth/adwords',               // Google Ads
  ].join(' ');

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopes,
    access_type: 'offline',
    prompt: 'consent',
    state: 'hearth-lead-engine',
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  return NextResponse.redirect(authUrl);
}
