import { Megaphone, DollarSign, MousePointer, Eye, Target, TrendingUp, TrendingDown, Pause, Play, AlertTriangle, CheckCircle, X, Zap, Calendar } from 'lucide-react';
import prisma from '@/lib/db';
import { formatCurrency } from '@/lib/utils';
import StatCard from '@/components/StatCard';

async function getAdsData() {
  try {
    const [campaigns, keywords, recommendations] = await Promise.all([
      prisma.googleAdsCampaign.findMany({ orderBy: { spendThisMonth: 'desc' } }),
      prisma.googleAdsKeyword.findMany({ orderBy: { clicks: 'desc' }, take: 30, include: { campaign: { select: { name: true } } } }),
      prisma.googleAdsRecommendation.findMany({ where: { status: 'pending' }, orderBy: { createdAt: 'desc' } }),
    ]);
    return { campaigns, keywords, recommendations };
  } catch { return { campaigns: [], keywords: [], recommendations: [] }; }
}

export default async function GoogleAdsPage() {
  const { campaigns, keywords, recommendations } = await getAdsData();

  const totalSpend = campaigns.reduce((s, c) => s + c.spendThisMonth, 0);
  const totalClicks = campaigns.reduce((s, c) => s + c.clicks, 0);
  const totalImpressions = campaigns.reduce((s, c) => s + c.impressions, 0);
  const totalConversions = campaigns.reduce((s, c) => s + c.conversions, 0);
  const overallCtr = totalImpressions > 0 ? (totalClicks / totalImpressions * 100) : 0;
  const overallCpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
  const costPerConv = totalConversions > 0 ? totalSpend / totalConversions : 0;

  const activeCampaigns = campaigns.filter(c => c.status === 'ENABLED');
  const pausedCampaigns = campaigns.filter(c => c.status === 'PAUSED');

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Google Ads</h1>
          <p className="page-subtitle">{activeCampaigns.length} active campaigns &middot; {totalConversions} conversions this month</p>
        </div>
      </div>

      {/* AI Recommendations Banner */}
      {recommendations.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-indigo-800">AI has {recommendations.length} recommendation{recommendations.length !== 1 ? 's' : ''} for your campaigns</p>
              <p className="text-xs text-indigo-600 mt-1">Review them below — each one can be applied with a single click.</p>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        <StatCard label="Spend This Month" value={formatCurrency(totalSpend)} icon={<DollarSign className="w-5 h-5" />} accent="red" />
        <StatCard label="Clicks" value={totalClicks.toLocaleString()} icon={<MousePointer className="w-5 h-5" />} accent="blue" />
        <StatCard label="Impressions" value={totalImpressions.toLocaleString()} icon={<Eye className="w-5 h-5" />} />
        <StatCard label="Conversions" value={totalConversions} icon={<Target className="w-5 h-5" />} accent="green" />
        <StatCard label="Cost/Conversion" value={formatCurrency(costPerConv)} icon={<DollarSign className="w-5 h-5" />} accent="purple" detail={`CTR: ${overallCtr.toFixed(1)}% · CPC: ${formatCurrency(overallCpc)}`} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Campaigns */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card overflow-hidden">
            <div className="card-header">
              <h2 className="card-title">Campaigns</h2>
              <span className="text-xs text-gray-400">{activeCampaigns.length} active, {pausedCampaigns.length} paused</span>
            </div>
            <div className="divide-y divide-gray-100">
              {campaigns.map(c => (
                <div key={c.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {c.status === 'ENABLED' ? (
                        <Play className="w-3.5 h-3.5 text-green-500 fill-green-500" />
                      ) : (
                        <Pause className="w-3.5 h-3.5 text-yellow-500" />
                      )}
                      <h3 className="text-sm font-semibold text-gray-900">{c.name}</h3>
                      <span className="badge-gray text-[10px]">{c.type.toLowerCase()}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{formatCurrency(c.spendThisMonth)}</span>
                  </div>

                  {/* Budget bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                      <span>Daily budget: {formatCurrency(c.dailyBudget)}/day</span>
                      <span>Today: {formatCurrency(c.spendToday)}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${c.spendToday >= c.dailyBudget * 0.9 ? 'bg-red-500' : 'bg-green-500'}`}
                        style={{ width: `${Math.min(100, (c.spendToday / c.dailyBudget) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Metrics row */}
                  <div className="grid grid-cols-5 gap-2 text-center">
                    <div>
                      <p className="text-xs text-gray-400">Impressions</p>
                      <p className="text-sm font-medium">{c.impressions.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Clicks</p>
                      <p className="text-sm font-medium">{c.clicks.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">CTR</p>
                      <p className="text-sm font-medium">{(c.ctr * 100).toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Conversions</p>
                      <p className="text-sm font-medium text-green-600">{c.conversions}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Cost/Conv</p>
                      <p className="text-sm font-medium">{c.conversions > 0 ? formatCurrency(c.spendThisMonth / c.conversions) : '—'}</p>
                    </div>
                  </div>
                </div>
              ))}
              {campaigns.length === 0 && (
                <div className="p-12 text-center text-gray-400">
                  <Megaphone className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">No campaign data yet</p>
                  <p className="text-xs mt-1">Connect Google Ads in Settings, or the mock data will load automatically.</p>
                </div>
              )}
            </div>
          </div>

          {/* Top Keywords */}
          <div className="card overflow-hidden">
            <div className="card-header">
              <h2 className="card-title">Top Keywords</h2>
              <span className="text-xs text-gray-400">by clicks</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="table-th">Keyword</th>
                    <th className="table-th text-center">Match</th>
                    <th className="table-th text-center">Clicks</th>
                    <th className="table-th text-center">Impr</th>
                    <th className="table-th text-center">CTR</th>
                    <th className="table-th text-center">CPC</th>
                    <th className="table-th text-center">Conv</th>
                    <th className="table-th text-center">QS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {keywords.map(kw => (
                    <tr key={kw.id} className="table-row">
                      <td className="table-td">
                        <p className="text-sm font-medium text-gray-900">{kw.keyword}</p>
                        <p className="text-[10px] text-gray-400">{kw.campaign.name}</p>
                      </td>
                      <td className="table-td text-center">
                        <span className="badge-gray text-[10px]">{kw.matchType.toLowerCase()}</span>
                      </td>
                      <td className="table-td text-center text-sm font-medium">{kw.clicks}</td>
                      <td className="table-td text-center text-sm text-gray-500">{kw.impressions.toLocaleString()}</td>
                      <td className="table-td text-center text-sm">{(kw.ctr * 100).toFixed(1)}%</td>
                      <td className="table-td text-center text-sm">{formatCurrency(kw.avgCpc)}</td>
                      <td className="table-td text-center text-sm font-medium text-green-600">{kw.conversions}</td>
                      <td className="table-td text-center">
                        {kw.qualityScore ? (
                          <span className={`text-sm font-bold ${kw.qualityScore >= 7 ? 'text-green-600' : kw.qualityScore >= 5 ? 'text-yellow-600' : 'text-red-500'}`}>
                            {kw.qualityScore}/10
                          </span>
                        ) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {keywords.length === 0 && (
                <div className="p-8 text-center text-gray-300 text-sm">No keyword data yet</div>
              )}
            </div>
          </div>
        </div>

        {/* AI Recommendations Sidebar */}
        <div className="space-y-4">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title flex items-center gap-2"><Zap className="w-4 h-4 text-indigo-600" /> AI Recommendations</h2>
            </div>
            <div className="divide-y divide-gray-50 max-h-[800px] overflow-y-auto">
              {recommendations.map(rec => (
                <div key={rec.id} className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`badge text-[10px] ${rec.type === 'budget' ? 'badge-red' : rec.type === 'keyword' || rec.type === 'negative_keyword' ? 'badge-blue' : rec.type === 'ad_copy' ? 'badge-purple' : rec.type === 'seasonal' ? 'badge-orange' : 'badge-gray'}`}>
                      {rec.type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">{rec.title}</p>
                  <p className="text-xs text-gray-600 mb-2">{rec.description}</p>
                  {rec.impact && (
                    <p className="text-xs text-indigo-600 font-medium mb-3">{rec.impact}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <button className="btn-primary btn-xs">
                      <CheckCircle className="w-3 h-3" /> Approve
                    </button>
                    <button className="btn-ghost btn-xs text-gray-400">
                      <X className="w-3 h-3" /> Dismiss
                    </button>
                  </div>
                </div>
              ))}
              {recommendations.length === 0 && (
                <div className="p-8 text-center text-gray-300">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-xs">No pending recommendations</p>
                </div>
              )}
            </div>
          </div>

          {/* Monthly Budget Tracker */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Monthly Budget</h2>
            </div>
            <div className="card-body">
              {campaigns.length > 0 ? (
                <>
                  <div className="text-center mb-4">
                    <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalSpend)}</p>
                    <p className="text-xs text-gray-400">spent this month</p>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Daily avg budget</span>
                      <span className="font-medium">{formatCurrency(campaigns.reduce((s, c) => s + c.dailyBudget, 0))}/day</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Cost per conversion</span>
                      <span className="font-medium">{totalConversions > 0 ? formatCurrency(costPerConv) : '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total conversions</span>
                      <span className="font-medium text-green-600">{totalConversions}</span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-center text-gray-300 text-sm py-4">No data yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
