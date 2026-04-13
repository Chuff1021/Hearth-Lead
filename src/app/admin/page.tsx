import Link from 'next/link';
import { FileText, Users, Building2, Flame, TrendingUp, ArrowRight, RefreshCw } from 'lucide-react';
import PermitStats from '@/components/PermitStats';
import prisma from '@/lib/db';

async function getDashboardData() {
  try {
    const [
      totalPermits,
      recentPermits,
      totalLeads,
      hotLeads,
      totalBuilders,
      recentCaptures,
    ] = await Promise.all([
      prisma.permit.count(),
      prisma.permit.count({
        where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      }),
      prisma.lead.count(),
      prisma.lead.count({ where: { score: { gte: 75 } } }),
      prisma.builder.count(),
      prisma.leadCapture.count({
        where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      }),
    ]);

    const avgValue = await prisma.permit.aggregate({
      _avg: { estimatedValue: true },
      where: { type: 'new_residential' },
    });

    const latestPermits = await prisma.permit.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const latestLeads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return {
      stats: {
        totalPermits,
        newThisMonth: recentPermits,
        avgValue: avgValue._avg.estimatedValue || 0,
        hotLeads,
      },
      totalLeads,
      totalBuilders,
      recentCaptures,
      latestPermits,
      latestLeads,
    };
  } catch {
    return {
      stats: { totalPermits: 0, newThisMonth: 0, avgValue: 0, hotLeads: 0 },
      totalLeads: 0,
      totalBuilders: 0,
      recentCaptures: 0,
      latestPermits: [],
      latestLeads: [],
    };
  }
}

export default async function AdminDashboard() {
  const data = await getDashboardData();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Hearth Lead Engine overview</p>
        </div>
        <Link
          href="/api/scrape"
          className="btn-primary text-sm"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Sync Permits
        </Link>
      </div>

      {/* Stats */}
      <PermitStats stats={data.stats} />

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Leads</p>
              <p className="text-2xl font-bold text-gray-900">{data.totalLeads}</p>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Builders Tracked</p>
              <p className="text-2xl font-bold text-gray-900">{data.totalBuilders}</p>
            </div>
            <Building2 className="w-8 h-8 text-purple-400" />
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Website Leads (7 days)</p>
              <p className="text-2xl font-bold text-gray-900">{data.recentCaptures}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* Latest Activity */}
      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        {/* Recent Permits */}
        <div className="card">
          <div className="flex items-center justify-between p-5 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Latest Permits</h2>
            <Link href="/admin/permits" className="text-sm text-hearth-600 hover:text-hearth-700 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {data.latestPermits.length > 0 ? (
              data.latestPermits.map(permit => (
                <div key={permit.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{permit.propertyAddress}</p>
                      <p className="text-xs text-gray-500">{permit.permitNumber} &middot; {permit.city}</p>
                    </div>
                    <span className="text-sm font-bold text-hearth-600">{permit.leadScore}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-400 text-sm">
                <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                No permits yet. Run the seed script or sync permits.
              </div>
            )}
          </div>
        </div>

        {/* Recent Leads */}
        <div className="card">
          <div className="flex items-center justify-between p-5 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Latest Leads</h2>
            <Link href="/admin/leads" className="text-sm text-hearth-600 hover:text-hearth-700 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {data.latestLeads.length > 0 ? (
              data.latestLeads.map(lead => (
                <div key={lead.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {lead.firstName} {lead.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {lead.city || 'Unknown'} &middot; {lead.type} &middot; {lead.status}
                      </p>
                    </div>
                    <span className={`badge ${lead.status === 'new' ? 'badge-blue' : lead.status === 'won' ? 'badge-green' : 'badge-yellow'}`}>
                      {lead.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-400 text-sm">
                <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                No leads yet. They&apos;ll appear as permits come in and forms are submitted.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
