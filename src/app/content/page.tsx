import { PenTool, Calendar, Clock, TrendingUp, CheckCircle, AlertCircle, Lightbulb } from 'lucide-react';
import prisma from '@/lib/db';
import { formatDate } from '@/lib/utils';
import StatCard from '@/components/StatCard';

async function getContentData() {
  try {
    const items = await prisma.contentItem.findMany({ orderBy: [{ status: 'asc' }, { dueDate: 'asc' }] });
    return items;
  } catch { return []; }
}

const STATUS_COLS = ['idea', 'planned', 'drafting', 'review', 'published'] as const;
const STATUS_COLORS: Record<string, string> = { idea: 'border-gray-300', planned: 'border-blue-400', drafting: 'border-yellow-400', review: 'border-orange-400', published: 'border-green-500' };
const STATUS_ICONS: Record<string, React.ReactNode> = { idea: <Lightbulb className="w-3 h-3" />, planned: <Calendar className="w-3 h-3" />, drafting: <PenTool className="w-3 h-3" />, review: <AlertCircle className="w-3 h-3" />, published: <CheckCircle className="w-3 h-3" /> };

export default async function ContentPage() {
  const items = await getContentData();
  const grouped = Object.fromEntries(STATUS_COLS.map(s => [s, items.filter(i => i.status === s)]));

  const currentMonth = new Date().getMonth();
  const isFireplaceSeason = currentMonth >= 6 && currentMonth <= 10; // July-November

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Content Calendar</h1>
          <p className="page-subtitle">Plan and track blog posts, social content, and marketing campaigns.</p>
        </div>
      </div>

      {isFireplaceSeason && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <TrendingUp className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-orange-800">Peak season is approaching!</p>
            <p className="text-xs text-orange-600 mt-1">Fireplace searches spike August through November. Publish content now so it ranks by the time people are searching. Focus on &quot;fireplace installation cost&quot;, &quot;gas vs wood fireplace&quot;, and &quot;best fireplace for new home&quot; topics.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Content" value={items.length} icon={<PenTool className="w-5 h-5" />} />
        <StatCard label="Published" value={grouped.published?.length || 0} icon={<CheckCircle className="w-5 h-5" />} accent="green" />
        <StatCard label="In Progress" value={(grouped.drafting?.length || 0) + (grouped.review?.length || 0)} icon={<Clock className="w-5 h-5" />} accent="orange" />
        <StatCard label="Ideas Backlog" value={grouped.idea?.length || 0} icon={<Lightbulb className="w-5 h-5" />} accent="blue" />
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STATUS_COLS.map(status => (
          <div key={status} className="kanban-column">
            <div className="kanban-header">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full border-2 ${STATUS_COLORS[status]}`} />
                <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">{status}</h2>
              </div>
              <span className="text-xs font-medium text-gray-400">{grouped[status]?.length || 0}</span>
            </div>
            <div className="space-y-2 flex-1">
              {(grouped[status] || []).map(item => (
                <div key={item.id} className="kanban-card">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="badge-gray text-[10px]">{item.type.replace('_', ' ')}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">{item.title}</p>
                  {item.targetKeyword && (
                    <p className="text-xs text-orange-600 mb-1">Target: &quot;{item.targetKeyword}&quot;{item.searchVolume ? ` (${item.searchVolume}/mo)` : ''}</p>
                  )}
                  {item.outline && <p className="text-xs text-gray-500 line-clamp-2 mb-2">{item.outline}</p>}
                  <div className="flex items-center justify-between text-[10px] text-gray-400 pt-2 border-t border-gray-100">
                    {item.dueDate ? <span className="flex items-center gap-0.5"><Calendar className="w-3 h-3" /> Due {formatDate(item.dueDate)}</span> : <span />}
                    {item.status === 'published' && item.pageViews !== null && (
                      <span>{item.pageViews} views &middot; {item.leadsGenerated || 0} leads</span>
                    )}
                  </div>
                </div>
              ))}
              {(!grouped[status] || grouped[status].length === 0) && (
                <div className="text-center py-6 text-gray-300 text-xs">Empty</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
