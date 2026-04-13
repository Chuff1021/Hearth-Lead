import Link from 'next/link';
import { FileText, Users, Building2, Flame, TrendingUp, Clock, Phone, ArrowRight, Search, Star, DollarSign, AlertTriangle } from 'lucide-react';
import StatCard from '@/components/StatCard';
import AlertBanner, { type Alert } from '@/components/AlertBanner';
import prisma from '@/lib/db';
import { formatRelative, formatCurrency, urgencyBadge, stageBadge } from '@/lib/utils';

async function getData() {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [totalPermits, recentPermits, todayPermits, totalLeads, hotLeads, overdueFollowUps, pipelineLeads, wonLeads, totalRevenue, latestPermits, latestLeads, unreviewedReviews, lastGbpPost, totalBuilders] = await Promise.all([
      prisma.permit.count(),
      prisma.permit.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.permit.count({ where: { createdAt: { gte: today } } }),
      prisma.lead.count(),
      prisma.lead.count({ where: { urgency: 'hot', stage: { in: ['new', 'contacted'] } } }),
      prisma.lead.count({ where: { nextFollowUp: { lt: now }, stage: { in: ['new', 'contacted', 'quoted'] } } }),
      prisma.lead.groupBy({ by: ['stage'], _count: true }),
      prisma.lead.count({ where: { stage: 'sold' } }),
      prisma.lead.aggregate({ _sum: { soldAmount: true }, where: { stage: 'sold' } }),
      prisma.permit.findMany({ orderBy: { createdAt: 'desc' }, take: 5, include: { builder: { select: { name: true, relationship: true } } } }),
      prisma.lead.findMany({ orderBy: { createdAt: 'desc' }, take: 5, include: { builder: { select: { name: true } } } }),
      prisma.gbpReview.count({ where: { status: 'needs_response' } }),
      prisma.gbpPost.findFirst({ where: { status: 'published' }, orderBy: { publishedAt: 'desc' } }),
      prisma.builder.count(),
    ]);

    const daysSinceGbpPost = lastGbpPost?.publishedAt ? Math.floor((now.getTime() - lastGbpPost.publishedAt.getTime()) / 86400000) : 30;
    const pipelineMap = Object.fromEntries(pipelineLeads.map(p => [p.stage, p._count]));

    return {
      stats: { totalPermits, recentPermits, todayPermits, totalLeads, hotLeads, overdueFollowUps, wonLeads, totalRevenue: totalRevenue._sum.soldAmount || 0, totalBuilders, unreviewedReviews, daysSinceGbpPost },
      pipeline: pipelineMap,
      latestPermits,
      latestLeads,
    };
  } catch {
    return {
      stats: { totalPermits: 0, recentPermits: 0, todayPermits: 0, totalLeads: 0, hotLeads: 0, overdueFollowUps: 0, wonLeads: 0, totalRevenue: 0, totalBuilders: 0, unreviewedReviews: 0, daysSinceGbpPost: 30 },
      pipeline: {},
      latestPermits: [],
      latestLeads: [],
    };
  }
}

export default async function DashboardPage() {
  const { stats, pipeline, latestPermits, latestLeads } = await getData();

  const alerts: Alert[] = [];
  if (stats.hotLeads > 0) alerts.push({ id: 'hot', type: 'urgent', iconName: 'flame', message: `${stats.hotLeads} hot lead${stats.hotLeads > 1 ? 's' : ''} need immediate contact — the framing window is closing.`, action: { label: 'View leads', href: '/leads' } });
  if (stats.overdueFollowUps > 0) alerts.push({ id: 'overdue', type: 'warning', iconName: 'clock', message: `${stats.overdueFollowUps} follow-up${stats.overdueFollowUps > 1 ? 's' : ''} overdue. Don't let these go cold.`, action: { label: 'View', href: '/leads' } });
  if (stats.unreviewedReviews > 0) alerts.push({ id: 'reviews', type: 'info', iconName: 'star', message: `${stats.unreviewedReviews} Google review${stats.unreviewedReviews > 1 ? 's' : ''} need a response.`, action: { label: 'Respond', href: '/google-business' } });
  if (stats.daysSinceGbpPost > 7) alerts.push({ id: 'gbp', type: 'warning', iconName: 'file', message: `You haven't posted on Google Business in ${stats.daysSinceGbpPost} days. Regular posts help your ranking.`, action: { label: 'Post now', href: '/google-business' } });
  if (stats.todayPermits > 0) alerts.push({ id: 'permits', type: 'success', iconName: 'file', message: `${stats.todayPermits} new building permit${stats.todayPermits > 1 ? 's' : ''} found today.`, action: { label: 'Review', href: '/permits' } });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, Aaron. Here&apos;s what&apos;s happening.</p>
        </div>
        <Link href="/api/scrape" className="btn-primary">
          <Search className="w-4 h-4" /> Sync Permits
        </Link>
      </div>

      <AlertBanner alerts={alerts} />

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="New Permits (30 days)" value={stats.recentPermits} icon={<FileText className="w-5 h-5" />} detail={`${stats.todayPermits} new today`} />
        <StatCard label="Active Leads" value={stats.totalLeads - (pipeline.sold || 0) - (pipeline.lost || 0)} icon={<Users className="w-5 h-5" />} detail={`${stats.hotLeads} hot`} accent="red" />
        <StatCard label="Deals Won" value={stats.wonLeads} icon={<DollarSign className="w-5 h-5" />} detail={formatCurrency(stats.totalRevenue) + ' total revenue'} accent="green" />
        <StatCard label="Builders Tracked" value={stats.totalBuilders} icon={<Building2 className="w-5 h-5" />} accent="purple" />
      </div>

      {/* Pipeline Overview */}
      <div className="card mb-6">
        <div className="card-header">
          <h2 className="card-title">Lead Pipeline</h2>
          <Link href="/leads" className="text-xs text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-5 divide-x divide-gray-100">
          {(['new', 'contacted', 'quoted', 'sold', 'lost'] as const).map(stage => (
            <div key={stage} className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{pipeline[stage] || 0}</p>
              <p className="text-xs text-gray-500 capitalize mt-1">{stage}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Latest Permits */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Latest Permits</h2>
            <Link href="/permits" className="text-xs text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {latestPermits.map(p => (
              <div key={p.id} className={`px-4 py-3 flex items-center gap-3 ${p.urgency === 'hot' ? 'urgency-hot' : p.urgency === 'warm' ? 'urgency-warm' : ''}`}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{p.propertyAddress}</p>
                  <p className="text-xs text-gray-500">{p.city} &middot; {p.contractorName || 'Unknown builder'} &middot; {formatRelative(p.createdAt)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-sm font-bold text-orange-600">{p.leadScore}</span>
                  <p className="text-[10px] text-gray-400">score</p>
                </div>
              </div>
            ))}
            {latestPermits.length === 0 && (
              <div className="p-8 text-center text-gray-400 text-sm">No permits yet. Click &quot;Sync Permits&quot; or run the seed script.</div>
            )}
          </div>
        </div>

        {/* Latest Leads */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Latest Leads</h2>
            <Link href="/leads" className="text-xs text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {latestLeads.map(l => (
              <div key={l.id} className="px-4 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{l.firstName} {l.lastName || ''}</p>
                  <p className="text-xs text-gray-500">{l.city || '—'} &middot; {l.source} &middot; {formatRelative(l.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={urgencyBadge(l.urgency)}>{l.urgency}</span>
                  <span className={stageBadge(l.stage)}>{l.stage}</span>
                </div>
              </div>
            ))}
            {latestLeads.length === 0 && (
              <div className="p-8 text-center text-gray-400 text-sm">No leads yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
