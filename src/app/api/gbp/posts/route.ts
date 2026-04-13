import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { generateGbpPost } from '@/lib/ai/review-responder';

/**
 * GET /api/gbp/posts — List posts
 * POST /api/gbp/posts — Create or AI-generate a post
 */
export async function GET() {
  try {
    const posts = await prisma.gbpPost.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ posts });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.action === 'generate') {
      const type = body.type || 'seasonal';
      const generated = generateGbpPost(type);
      return NextResponse.json(generated);
    }

    // Create/save a post
    const post = await prisma.gbpPost.create({
      data: {
        title: body.title,
        body: body.body,
        type: body.type || 'update',
        status: body.status || 'draft',
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
        ctaType: body.ctaType,
        ctaUrl: body.ctaUrl,
      },
    });

    return NextResponse.json({ post });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
