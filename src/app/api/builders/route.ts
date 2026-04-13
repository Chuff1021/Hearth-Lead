import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const builders = await prisma.builder.findMany({
      orderBy: { totalPermits: 'desc' },
      include: {
        _count: { select: { leads: true, subdivisions: true } },
      },
    });

    return NextResponse.json({ builders });
  } catch (error) {
    console.error('Builders API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, relationship, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Builder ID required' }, { status: 400 });
    }

    const builder = await prisma.builder.update({
      where: { id },
      data: {
        ...(relationship && { relationship }),
        ...(notes !== undefined && { notes }),
      },
    });

    return NextResponse.json({ builder });
  } catch (error) {
    console.error('Builder update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
