import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    // Permits by month (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const permits = await prisma.permit.findMany({
      where: { dateFiled: { gte: twelveMonthsAgo } },
      select: { dateFiled: true },
      orderBy: { dateFiled: 'asc' },
    });

    const permitsByMonth: Record<string, number> = {};
    for (const p of permits) {
      if (p.dateFiled) {
        const key = `${p.dateFiled.getFullYear()}-${String(p.dateFiled.getMonth() + 1).padStart(2, '0')}`;
        permitsByMonth[key] = (permitsByMonth[key] || 0) + 1;
      }
    }

    // Leads by status
    const leadsByStatus = await prisma.lead.groupBy({
      by: ['status'],
      _count: true,
    });

    // Leads by source
    const leadsBySource = await prisma.lead.groupBy({
      by: ['source'],
      _count: true,
    });

    // Form submissions by type
    const capturesByForm = await prisma.leadCapture.groupBy({
      by: ['formType'],
      _count: true,
    });

    return NextResponse.json({
      permitsByMonth: Object.entries(permitsByMonth).map(([month, count]) => ({
        month: month.split('-')[1] + '/' + month.split('-')[0].slice(2),
        count,
      })),
      leadsByStatus: leadsByStatus.map(l => ({
        status: l.status,
        count: l._count,
      })),
      leadsBySource: leadsBySource
        .filter(l => l.source)
        .map(l => ({
          source: l.source || 'unknown',
          count: l._count,
        })),
      capturesByForm: capturesByForm.map(c => ({
        formType: c.formType,
        count: c._count,
      })),
      topPages: [],
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({
      permitsByMonth: [],
      leadsByStatus: [],
      leadsBySource: [],
      capturesByForm: [],
      topPages: [],
    });
  }
}
