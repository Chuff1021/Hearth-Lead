import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');
  const county = searchParams.get('county');
  const type = searchParams.get('type');
  const minScore = searchParams.get('minScore');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    const where = {
      ...(city && { city }),
      ...(county && { county }),
      ...(type && { type }),
      ...(minScore && { leadScore: { gte: parseInt(minScore) } }),
    };

    const [permits, total] = await Promise.all([
      prisma.permit.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: Math.min(limit, 100),
        skip: offset,
      }),
      prisma.permit.count({ where }),
    ]);

    return NextResponse.json({
      permits,
      total,
      limit,
      offset,
      hasMore: offset + permits.length < total,
    });
  } catch (error) {
    console.error('Permits API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
