import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/google/callback — Google OAuth callback.
 * Exchanges the authorization code for access + refresh tokens.
 * Stores the refresh token so the app stays connected.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/settings?error=${error}`);
  }

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/settings?error=no_code`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/settings?error=missing_credentials`);
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';
  const redirectUri = `${siteUrl}/api/google/callback`;

  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
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

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text();
      console.error('Token exchange failed:', errBody);
      return NextResponse.redirect(`${siteUrl}/settings?error=token_exchange_failed`);
    }

    const tokens = await tokenRes.json();

    // In production, you'd store these securely (encrypted in DB or env vars).
    // For now, log them so the user can add to Vercel env vars.
    console.log('='.repeat(60));
    console.log('GOOGLE OAUTH TOKENS — ADD THESE TO VERCEL ENV VARS:');
    console.log('='.repeat(60));
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log(`GOOGLE_ACCESS_TOKEN=${tokens.access_token}`);
    console.log(`Token expires in: ${tokens.expires_in} seconds`);
    console.log('='.repeat(60));

    // Redirect to settings with success
    return NextResponse.redirect(`${siteUrl}/settings?connected=google&refresh_token=${tokens.refresh_token || ''}`);
  } catch (err) {
    console.error('OAuth callback error:', err);
    return NextResponse.redirect(`${siteUrl}/settings?error=callback_failed`);
  }
}
