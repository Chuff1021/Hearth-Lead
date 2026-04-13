import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { scorePermitLead } from '@/lib/scoring/lead-score';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const stage = searchParams.get('stage');
  const urgency = searchParams.get('urgency');

  try {
    const leads = await prisma.lead.findMany({
      where: { ...(stage && { stage }), ...(urgency && { urgency }) },
      orderBy: [{ score: 'desc' }, { createdAt: 'desc' }],
      take: 100,
      include: { builder: { select: { name: true } } },
    });
    return NextResponse.json({ leads });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, stage, notes, nextFollowUp, soldAmount, lostReason } = body;
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const data: Record<string, unknown> = {};
    if (stage) data.stage = stage;
    if (notes !== undefined) data.notes = notes;
    if (nextFollowUp) data.nextFollowUp = new Date(nextFollowUp);
    if (soldAmount !== undefined) { data.soldAmount = soldAmount; data.soldDate = new Date(); }
    if (lostReason) data.lostReason = lostReason;
    if (stage === 'contacted' && !body.skipFirstContact) data.firstContactAt = new Date();

    const lead = await prisma.lead.update({ where: { id }, data });
    return NextResponse.json({ lead });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
