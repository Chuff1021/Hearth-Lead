import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const type = searchParams.get('type');
  const limit = parseInt(searchParams.get('limit') || '50');

  try {
    const leads = await prisma.lead.findMany({
      where: {
        ...(status && { status }),
        ...(type && { type }),
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 100),
      include: {
        builder: { select: { name: true, slug: true } },
        _count: { select: { permits: true, outreachLogs: true } },
      },
    });

    return NextResponse.json({ leads });
  } catch (error) {
    console.error('Leads API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Lead ID required' }, { status: 400 });
    }

    const lead = await prisma.lead.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(notes && { notes }),
      },
    });

    return NextResponse.json({ lead });
  } catch (error) {
    console.error('Lead update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
