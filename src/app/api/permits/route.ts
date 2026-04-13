import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get('city');
  const urgency = searchParams.get('urgency');
  const minScore = searchParams.get('minScore');
  const limit = parseInt(searchParams.get('limit') || '50');

  try {
    const permits = await prisma.permit.findMany({
      where: {
        ...(city && { city }),
        ...(urgency && { urgency }),
        ...(minScore && { leadScore: { gte: parseInt(minScore) } }),
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 200),
      include: { builder: { select: { name: true, relationship: true } }, lead: { select: { id: true, stage: true } } },
    });

    return NextResponse.json({ permits, total: permits.length });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
