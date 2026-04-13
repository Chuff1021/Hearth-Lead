import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const [permitsThisMonth, permitsLastMonth, leadsThisMonth, leadsLastMonth, salesThisMonth, salesLastMonth, revenueThisMonth, revenueLastMonth, topBuildersRaw, topCitiesPermits, topCitiesLeads, sourceBreakdown, allPermits] = await Promise.all([
      prisma.permit.count({ where: { createdAt: { gte: thisMonthStart } } }),
      prisma.permit.count({ where: { createdAt: { gte: lastMonthStart, lt: lastMonthEnd } } }),
      prisma.lead.count({ where: { createdAt: { gte: thisMonthStart } } }),
      prisma.lead.count({ where: { createdAt: { gte: lastMonthStart, lt: lastMonthEnd } } }),
      prisma.lead.count({ where: { stage: 'sold', soldDate: { gte: thisMonthStart } } }),
      prisma.lead.count({ where: { stage: 'sold', soldDate: { gte: lastMonthStart, lt: lastMonthEnd } } }),
      prisma.lead.aggregate({ _sum: { soldAmount: true }, where: { stage: 'sold', soldDate: { gte: thisMonthStart } } }),
      prisma.lead.aggregate({ _sum: { soldAmount: true }, where: { stage: 'sold', soldDate: { gte: lastMonthStart, lt: lastMonthEnd } } }),
      prisma.builder.findMany({ orderBy: { totalRevenue: 'desc' }, take: 8 }),
      prisma.permit.groupBy({ by: ['city'], _count: true, orderBy: { _count: { city: 'desc' } }, take: 8 }),
      prisma.lead.groupBy({ by: ['city'], _count: true, orderBy: { _count: { city: 'desc' } }, take: 8 }),
      prisma.lead.groupBy({ by: ['source'], _count: true }),
      prisma.permit.findMany({ select: { dateFiled: true }, where: { dateFiled: { gte: new Date(now.getFullYear() - 1, now.getMonth(), 1) } }, orderBy: { dateFiled: 'asc' } }),
    ]);

    // Monthly permits chart
    const monthlyMap: Record<string, number> = {};
    for (const p of allPermits) {
      if (p.dateFiled) {
        const key = `${p.dateFiled.getMonth() + 1}/${String(p.dateFiled.getFullYear()).slice(2)}`;
        monthlyMap[key] = (monthlyMap[key] || 0) + 1;
      }
    }

    // Combine city data
    const cityLeadMap = Object.fromEntries(topCitiesLeads.map(c => [c.city, c._count]));
    const topCities = topCitiesPermits.map(c => ({ city: c.city || 'Unknown', permits: c._count, leads: cityLeadMap[c.city || ''] || 0 }));

    // Avg contact time
    const contactedLeads = await prisma.lead.findMany({ where: { firstContactAt: { not: null }, source: 'permit' }, select: { createdAt: true, firstContactAt: true }, take: 50 });
    const avgContactDays = contactedLeads.length > 0 ? Math.round(contactedLeads.reduce((s, l) => s + ((l.firstContactAt!.getTime() - l.createdAt.getTime()) / 86400000), 0) / contactedLeads.length) : 0;

    const totalPermitsEver = await prisma.permit.count();
    const totalSold = await prisma.lead.count({ where: { stage: 'sold' } });
    const conversionRate = totalPermitsEver > 0 ? Math.round((totalSold / totalPermitsEver) * 100) : 0;

    return NextResponse.json({
      permitsThisMonth,
      permitsLastMonth,
      leadsThisMonth,
      leadsLastMonth,
      salesThisMonth,
      salesLastMonth,
      revenueThisMonth: revenueThisMonth._sum.soldAmount || 0,
      revenueLastMonth: revenueLastMonth._sum.soldAmount || 0,
      conversionRate,
      avgContactTime: avgContactDays,
      topBuilders: topBuildersRaw.map(b => ({ name: b.name, permits: b.totalPermits, sales: b.totalSales, revenue: b.totalRevenue })),
      topCities,
      pipelineBySource: sourceBreakdown.filter(s => s.source).map(s => ({ source: s.source || 'unknown', count: s._count })),
      monthlyPermits: Object.entries(monthlyMap).map(([month, count]) => ({ month, count })),
    });
  } catch (e) {
    console.error('Reports error:', e);
    return NextResponse.json({
      permitsThisMonth: 0, permitsLastMonth: 0, leadsThisMonth: 0, leadsLastMonth: 0,
      salesThisMonth: 0, salesLastMonth: 0, revenueThisMonth: 0, revenueLastMonth: 0,
      conversionRate: 0, avgContactTime: 0, topBuilders: [], topCities: [],
      pipelineBySource: [], monthlyPermits: [],
    });
  }
}
