'use client';

import { BarChart3, Users, DollarSign, TrendingUp, FileText, Building2, Clock, Target } from 'lucide-react';
import StatCard from '@/components/StatCard';
import { useEffect, useState } from 'react';

interface ReportData {
  permitsThisMonth: number;
  permitsLastMonth: number;
  leadsThisMonth: number;
  leadsLastMonth: number;
  salesThisMonth: number;
  salesLastMonth: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  conversionRate: number;
  avgContactTime: number;
  topBuilders: { name: string; permits: number; sales: number; revenue: number }[];
  topCities: { city: string; permits: number; leads: number }[];
  pipelineBySource: { source: string; count: number }[];
  monthlyPermits: { month: string; count: number }[];
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reports')
      .then(r => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-orange-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!data) return <div className="text-center py-20 text-gray-400">Failed to load reports.</div>;

  const permitChange = data.permitsLastMonth > 0 ? Math.round(((data.permitsThisMonth - data.permitsLastMonth) / data.permitsLastMonth) * 100) : 0;
  const leadChange = data.leadsLastMonth > 0 ? Math.round(((data.leadsThisMonth - data.leadsLastMonth) / data.leadsLastMonth) * 100) : 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="page-subtitle">How the business is performing. Key numbers that matter.</p>
        </div>
      </div>

      {/* Top Line Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Permits This Month" value={data.permitsThisMonth} change={permitChange} icon={<FileText className="w-5 h-5" />} />
        <StatCard label="New Leads" value={data.leadsThisMonth} change={leadChange} icon={<Users className="w-5 h-5" />} accent="blue" />
        <StatCard label="Deals Closed" value={data.salesThisMonth} icon={<Target className="w-5 h-5" />} accent="green" />
        <StatCard label="Revenue" value={`$${Math.round(data.revenueThisMonth / 1000)}K`} icon={<DollarSign className="w-5 h-5" />} accent="green" />
      </div>

      {/* Conversion Funnel */}
      <div className="card mb-6">
        <div className="card-header">
          <h2 className="card-title">Conversion Funnel</h2>
        </div>
        <div className="card-body">
          <div className="flex items-center gap-2">
            <div className="flex-1 text-center">
              <p className="text-3xl font-bold text-gray-900">{data.permitsThisMonth}</p>
              <p className="text-xs text-gray-500 mt-1">Permits Found</p>
            </div>
            <div className="text-gray-300">→</div>
            <div className="flex-1 text-center">
              <p className="text-3xl font-bold text-blue-600">{data.leadsThisMonth}</p>
              <p className="text-xs text-gray-500 mt-1">Contacted</p>
            </div>
            <div className="text-gray-300">→</div>
            <div className="flex-1 text-center">
              <p className="text-3xl font-bold text-orange-600">{Math.round(data.leadsThisMonth * 0.4)}</p>
              <p className="text-xs text-gray-500 mt-1">Quoted</p>
            </div>
            <div className="text-gray-300">→</div>
            <div className="flex-1 text-center">
              <p className="text-3xl font-bold text-green-600">{data.salesThisMonth}</p>
              <p className="text-xs text-gray-500 mt-1">Sold</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-900">Conversion Rate</p>
              <p className="text-2xl font-bold text-orange-600">{data.conversionRate}%</p>
              <p className="text-xs text-gray-400">Permits → Sold</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-900">Avg. Contact Time</p>
              <p className="text-2xl font-bold text-orange-600">{data.avgContactTime} days</p>
              <p className="text-xs text-gray-400">Permit filed → first contact</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Builders */}
        <div className="card overflow-hidden">
          <div className="card-header">
            <h2 className="card-title flex items-center gap-2"><Building2 className="w-4 h-4" /> Top Builders by Revenue</h2>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-th">Builder</th>
                <th className="table-th text-center">Permits</th>
                <th className="table-th text-center">Sales</th>
                <th className="table-th text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.topBuilders.map((b, i) => (
                <tr key={i} className="table-row">
                  <td className="table-td text-sm font-medium">{b.name}</td>
                  <td className="table-td text-center text-sm">{b.permits}</td>
                  <td className="table-td text-center text-sm">{b.sales}</td>
                  <td className="table-td text-right text-sm text-green-600 font-medium">${b.revenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Hottest Areas */}
        <div className="card overflow-hidden">
          <div className="card-header">
            <h2 className="card-title flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Hottest Areas</h2>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-th">City</th>
                <th className="table-th text-center">Permits</th>
                <th className="table-th text-center">Leads</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.topCities.map((c, i) => (
                <tr key={i} className="table-row">
                  <td className="table-td text-sm font-medium">{c.city}</td>
                  <td className="table-td text-center text-sm">{c.permits}</td>
                  <td className="table-td text-center text-sm">{c.leads}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Lead Sources */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Lead Sources</h2>
          </div>
          <div className="card-body space-y-3">
            {data.pipelineBySource.map(s => {
              const max = Math.max(...data.pipelineBySource.map(x => x.count), 1);
              return (
                <div key={s.source} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-24 capitalize">{s.source}</span>
                  <div className="flex-1 h-5 bg-gray-100 rounded overflow-hidden">
                    <div className="h-full bg-orange-500 rounded" style={{ width: `${(s.count / max) * 100}%` }} />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8 text-right">{s.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Permits Trend */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Monthly Permits Trend</h2>
          </div>
          <div className="card-body">
            <div className="flex items-end gap-1.5 h-40">
              {data.monthlyPermits.map((m, i) => {
                const max = Math.max(...data.monthlyPermits.map(x => x.count), 1);
                const height = (m.count / max) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-gray-400">{m.count}</span>
                    <div className="w-full bg-orange-500 rounded-t min-h-[2px]" style={{ height: `${height}%` }} />
                    <span className="text-[9px] text-gray-400">{m.month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
