import { Search, TrendingUp, TrendingDown, CheckCircle, AlertTriangle, ExternalLink, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import prisma from '@/lib/db';
import { seoTaskPriorityBadge } from '@/lib/utils';
import StatCard from '@/components/StatCard';

async function getSeoData() {
  try {
    const [keywords, tasks, pages] = await Promise.all([
      prisma.seoKeyword.findMany({ where: { isTracking: true }, orderBy: [{ currentRank: 'asc' }] }),
      prisma.seoTask.findMany({ where: { status: { in: ['todo', 'in_progress'] } }, orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }] }),
      prisma.seoPage.findMany({ orderBy: { healthScore: 'asc' } }),
    ]);
    return { keywords, tasks, pages };
  } catch { return { keywords: [], tasks: [], pages: [] }; }
}

function RankChange({ current, previous }: { current: number | null; previous: number | null }) {
  if (!current || !previous) return <Minus className="w-3 h-3 text-gray-300" />;
  const diff = previous - current; // positive = improvement
  if (diff > 0) return <span className="flex items-center gap-0.5 text-green-600 text-xs font-medium"><ArrowUp className="w-3 h-3" />+{diff}</span>;
  if (diff < 0) return <span className="flex items-center gap-0.5 text-red-500 text-xs font-medium"><ArrowDown className="w-3 h-3" />{diff}</span>;
  return <Minus className="w-3 h-3 text-gray-300" />;
}

export default async function SeoPage() {
  const { keywords, tasks, pages } = await getSeoData();

  const ranking = keywords.filter(k => k.currentRank && k.currentRank <= 100);
  const topTen = ranking.filter(k => k.currentRank && k.currentRank <= 10);
  const improving = ranking.filter(k => k.previousRank && k.currentRank && k.currentRank < k.previousRank);
  const todoTasks = tasks.filter(t => t.status === 'todo');
  const criticalTasks = tasks.filter(t => t.priority === 'critical');
  const unhealthyPages = pages.filter(p => (p.healthScore || 0) < 60);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">SEO Dashboard</h1>
          <p className="page-subtitle">Track your search rankings and fix issues that hurt your visibility.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Keywords Tracked" value={keywords.length} icon={<Search className="w-5 h-5" />} />
        <StatCard label="Top 10 Rankings" value={topTen.length} icon={<TrendingUp className="w-5 h-5" />} accent="green" detail={`${improving.length} improving`} />
        <StatCard label="Open SEO Tasks" value={todoTasks.length} icon={<AlertTriangle className="w-5 h-5" />} accent="red" detail={`${criticalTasks.length} critical`} />
        <StatCard label="Page Health Issues" value={unhealthyPages.length} icon={<ExternalLink className="w-5 h-5" />} accent="blue" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Keyword Rankings */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="card-header">
            <h2 className="card-title">Keyword Rankings</h2>
            <span className="text-xs text-gray-400">{ranking.length} keywords ranking</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-th">Keyword</th>
                  <th className="table-th text-center">Rank</th>
                  <th className="table-th text-center">Change</th>
                  <th className="table-th text-center">Volume</th>
                  <th className="table-th">Target Page</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {keywords.map(kw => (
                  <tr key={kw.id} className="table-row">
                    <td className="table-td">
                      <p className="text-sm font-medium text-gray-900">{kw.keyword}</p>
                      {kw.category && <span className="badge-gray text-[10px]">{kw.category}</span>}
                    </td>
                    <td className="table-td text-center">
                      {kw.currentRank ? (
                        <span className={`text-sm font-bold ${kw.currentRank <= 3 ? 'text-green-600' : kw.currentRank <= 10 ? 'text-blue-600' : kw.currentRank <= 20 ? 'text-yellow-600' : 'text-gray-400'}`}>
                          #{kw.currentRank}
                        </span>
                      ) : <span className="text-xs text-gray-300">Not ranking</span>}
                    </td>
                    <td className="table-td text-center"><RankChange current={kw.currentRank} previous={kw.previousRank} /></td>
                    <td className="table-td text-center text-xs text-gray-500">{kw.monthlyVolume?.toLocaleString() || '—'}/mo</td>
                    <td className="table-td text-xs text-gray-400 truncate max-w-[200px]">{kw.targetPage || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SEO Tasks */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">SEO To-Do List</h2>
            <span className="text-xs text-gray-400">{todoTasks.length} remaining</span>
          </div>
          <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
            {tasks.map(task => (
              <div key={task.id} className="p-4">
                <div className="flex items-start gap-2 mb-1">
                  <span className={seoTaskPriorityBadge(task.priority)}>{task.priority}</span>
                  <p className="text-sm font-medium text-gray-900">{task.title}</p>
                </div>
                {task.description && <p className="text-xs text-gray-500 mt-1">{task.description}</p>}
                {task.impact && <p className="text-xs text-orange-600 mt-1 font-medium">{task.impact}</p>}
                {task.page && <p className="text-[10px] text-gray-400 mt-1">Page: {task.page}</p>}
              </div>
            ))}
            {tasks.length === 0 && <div className="p-8 text-center text-gray-300 text-sm">No open tasks. Nice work!</div>}
          </div>
        </div>
      </div>

      {/* Page Health */}
      {pages.length > 0 && (
        <div className="card mt-6 overflow-hidden">
          <div className="card-header">
            <h2 className="card-title">Page Health</h2>
            <span className="text-xs text-gray-400">{unhealthyPages.length} pages need attention</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-th">Page</th>
                  <th className="table-th text-center">Health</th>
                  <th className="table-th">Title</th>
                  <th className="table-th text-center">Words</th>
                  <th className="table-th text-center">Speed</th>
                  <th className="table-th">Issues</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pages.map(page => {
                  const issues = page.issues ? JSON.parse(page.issues) : [];
                  return (
                    <tr key={page.id} className="table-row">
                      <td className="table-td text-xs text-gray-600 max-w-[200px] truncate">{page.url}</td>
                      <td className="table-td text-center">
                        <span className={`text-sm font-bold ${(page.healthScore || 0) >= 80 ? 'text-green-600' : (page.healthScore || 0) >= 60 ? 'text-yellow-600' : 'text-red-500'}`}>
                          {page.healthScore || 0}
                        </span>
                      </td>
                      <td className="table-td text-xs text-gray-500 max-w-[200px] truncate">{page.title || <span className="text-red-500 font-medium">Missing!</span>}</td>
                      <td className="table-td text-center text-xs">{page.wordCount || '—'}</td>
                      <td className="table-td text-center text-xs">
                        {page.loadTimeMs ? (
                          <span className={page.loadTimeMs > 3000 ? 'text-red-500 font-medium' : page.loadTimeMs > 2000 ? 'text-yellow-600' : 'text-green-600'}>
                            {(page.loadTimeMs / 1000).toFixed(1)}s
                          </span>
                        ) : '—'}
                      </td>
                      <td className="table-td">
                        {issues.length > 0 ? (
                          <span className="badge-red">{issues.length} issue{issues.length !== 1 ? 's' : ''}</span>
                        ) : <CheckCircle className="w-4 h-4 text-green-500" />}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
