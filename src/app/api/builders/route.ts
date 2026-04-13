import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const builders = await prisma.builder.findMany({
      orderBy: { totalPermits: 'desc' },
      include: { _count: { select: { leads: true, permits: true } } },
    });
    return NextResponse.json({ builders });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, relationship, notes, contactName, phone, email } = await req.json();
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const data: Record<string, unknown> = {};
    if (relationship) data.relationship = relationship;
    if (notes !== undefined) data.notes = notes;
    if (contactName) data.contactName = contactName;
    if (phone) data.phone = phone;
    if (email) data.email = email;
    if (relationship === 'partner') data.partnerSince = new Date();

    const builder = await prisma.builder.update({ where: { id }, data });
    return NextResponse.json({ builder });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
