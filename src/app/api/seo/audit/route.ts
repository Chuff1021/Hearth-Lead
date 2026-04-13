import { NextRequest, NextResponse } from 'next/server';
import { auditPage, auditWebsite } from '@/lib/ai/seo-analyzer';
import prisma from '@/lib/db';

/**
 * POST /api/seo/audit — Run an SEO audit on a URL or the full website.
 * Body: { url: string, fullSite?: boolean }
 */
export async function POST(req: NextRequest) {
  try {
    const { url, fullSite } = await req.json();
    if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 });

    if (fullSite) {
      const results = await auditWebsite(url, 15);

      // Save results to database
      for (const result of results) {
        await prisma.seoPage.upsert({
          where: { url: result.url },
          update: {
            title: result.title,
            metaDescription: result.metaDescription,
            h1: result.h1,
            wordCount: result.wordCount,
            loadTimeMs: result.loadTimeMs,
            internalLinks: result.internalLinks,
            externalLinks: result.externalLinks,
            healthScore: result.score,
            hasAltTags: result.imagesWithoutAlt === 0,
            issues: JSON.stringify(result.issues.map(i => i.title)),
            lastAudited: new Date(),
          },
          create: {
            url: result.url,
            title: result.title,
            metaDescription: result.metaDescription,
            h1: result.h1,
            wordCount: result.wordCount,
            loadTimeMs: result.loadTimeMs,
            internalLinks: result.internalLinks,
            externalLinks: result.externalLinks,
            healthScore: result.score,
            hasAltTags: result.imagesWithoutAlt === 0,
            issues: JSON.stringify(result.issues.map(i => i.title)),
            lastAudited: new Date(),
          },
        });

        // Auto-create SEO tasks from critical/warning issues
        for (const issue of result.issues.filter(i => i.severity !== 'info')) {
          const existing = await prisma.seoTask.findFirst({
            where: { title: issue.title, page: result.url, status: { in: ['todo', 'in_progress'] } },
          });
          if (!existing) {
            await prisma.seoTask.create({
              data: {
                title: issue.title,
                description: issue.description,
                priority: issue.severity === 'critical' ? 'critical' : 'high',
                category: 'technical',
                page: result.url,
                impact: issue.impact,
              },
            });
          }
        }
      }

      return NextResponse.json({ pages: results.length, results });
    } else {
      const result = await auditPage(url);
      return NextResponse.json(result);
    }
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Audit failed' }, { status: 500 });
  }
}
