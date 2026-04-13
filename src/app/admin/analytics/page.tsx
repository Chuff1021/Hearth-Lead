'use client';

import { BarChart3, TrendingUp, Globe, MousePointer } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AnalyticsData {
  permitsByMonth: { month: string; count: number }[];
  leadsByStatus: { status: string; count: number }[];
  leadsBySource: { source: string; count: number }[];
  topPages: { page: string; views: number }[];
  capturesByForm: { formType: string; count: number }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-hearth-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Permit trends, lead sources, and page performance</p>
      </div>

      {/* Permits by Month */}
      <div className="card p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-hearth-600" />
          New Residential Permits by Month
        </h2>
        <div className="flex items-end gap-2 h-48">
          {(data?.permitsByMonth || []).map((item, i) => {
            const maxCount = Math.max(...(data?.permitsByMonth || []).map(p => p.count), 1);
            const height = (item.count / maxCount) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-gray-500">{item.count}</span>
                <div
                  className="w-full bg-hearth-500 rounded-t-sm min-h-[4px]"
                  style={{ height: `${height}%` }}
                />
                <span className="text-[10px] text-gray-400">{item.month}</span>
              </div>
            );
          })}
          {(!data?.permitsByMonth || data.permitsByMonth.length === 0) && (
            <div className="w-full text-center text-gray-400 text-sm py-12">
              No permit data available. Run the seed script to populate.
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Leads by Status */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Leads by Status
          </h2>
          <div className="space-y-3">
            {(data?.leadsByStatus || []).map(item => {
              const maxCount = Math.max(...(data?.leadsByStatus || []).map(l => l.count), 1);
              const width = (item.count / maxCount) * 100;
              return (
                <div key={item.status} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-20">{item.status}</span>
                  <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8">{item.count}</span>
                </div>
              );
            })}
            {(!data?.leadsByStatus || data.leadsByStatus.length === 0) && (
              <p className="text-gray-400 text-sm">No lead data available.</p>
            )}
          </div>
        </div>

        {/* Lead Sources */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-green-600" />
            Leads by Source
          </h2>
          <div className="space-y-3">
            {(data?.leadsBySource || []).map(item => {
              const maxCount = Math.max(...(data?.leadsBySource || []).map(l => l.count), 1);
              const width = (item.count / maxCount) * 100;
              return (
                <div key={item.source} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-20">{item.source}</span>
                  <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8">{item.count}</span>
                </div>
              );
            })}
            {(!data?.leadsBySource || data.leadsBySource.length === 0) && (
              <p className="text-gray-400 text-sm">No lead data available.</p>
            )}
          </div>
        </div>
      </div>

      {/* Top Pages */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MousePointer className="w-5 h-5 text-purple-600" />
          Form Submissions by Type
        </h2>
        <div className="space-y-3">
          {(data?.capturesByForm || []).map(item => (
            <div key={item.formType} className="flex items-center gap-3">
              <span className="text-sm text-gray-600 w-32">{item.formType}</span>
              <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded"
                  style={{ width: `${(item.count / Math.max(...(data?.capturesByForm || []).map(c => c.count), 1)) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-900 w-8">{item.count}</span>
            </div>
          ))}
          {(!data?.capturesByForm || data.capturesByForm.length === 0) && (
            <p className="text-gray-400 text-sm">No form submissions yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
