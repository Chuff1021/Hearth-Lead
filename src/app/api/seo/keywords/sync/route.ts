import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { isSearchConsoleConnected, getTopKeywords } from '@/lib/google/search-console';

/**
 * Pull keyword rankings from Google Search Console and update local DB.
 */
export async function GET() {
  if (!isSearchConsoleConnected()) {
    return NextResponse.json({
      error: 'Google Search Console not connected',
      hint: 'Add GOOGLE_SEARCH_CONSOLE_SITE to env vars and complete OAuth',
    }, { status: 400 });
  }

  const result = { added: 0, updated: 0 };

  try {
    const keywords = await getTopKeywords(28, 100);
    if (!keywords) return NextResponse.json({ error: 'Failed to fetch keywords' }, { status: 500 });

    for (const kw of keywords) {
      const existing = await prisma.seoKeyword.findUnique({ where: { keyword: kw.keyword } });
      const data = {
        currentRank: Math.round(kw.position),
        previousRank: existing?.currentRank || null,
        impressions: kw.impressions,
        clicks: kw.clicks,
        clickRate: kw.ctr,
        lastChecked: new Date(),
      };

      if (existing) {
        await prisma.seoKeyword.update({ where: { id: existing.id }, data });
        result.updated++;
      } else {
        await prisma.seoKeyword.create({
          data: { keyword: kw.keyword, isTracking: true, ...data },
        });
        result.added++;
      }
    }

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown' }, { status: 500 });
  }
}
