import { Users, Phone, Mail, MapPin, Calendar, Flame, DollarSign, Clock } from 'lucide-react';
import prisma from '@/lib/db';
import { formatDate, formatRelative, formatCurrency, urgencyBadge, stageBadge, daysAgo } from '@/lib/utils';

const STAGES = ['new', 'contacted', 'quoted', 'sold', 'lost'] as const;
const STAGE_COLORS: Record<string, string> = {
  new: 'border-blue-400', contacted: 'border-yellow-400', quoted: 'border-orange-400', sold: 'border-green-500', lost: 'border-gray-300',
};

async function getLeads() {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: [{ urgency: 'asc' }, { score: 'desc' }, { createdAt: 'desc' }],
      include: { builder: { select: { name: true, relationship: true } }, _count: { select: { outreach: true, permits: true } } },
    });
    return leads;
  } catch {
    return [];
  }
}

export default async function LeadsPage() {
  const leads = await getLeads();
  const grouped = Object.fromEntries(STAGES.map(s => [s, leads.filter(l => l.stage === s)]));

  const totalActive = leads.filter(l => !['sold', 'lost'].includes(l.stage)).length;
  const totalValue = leads.filter(l => l.stage === 'quoted').reduce((s, l) => s + (l.homeValue || 0), 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Lead Pipeline</h1>
          <p className="page-subtitle">{totalActive} active leads &middot; {formatCurrency(totalValue)} in quoted pipeline</p>
        </div>
      </div>

      {/* Kanban */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map(stage => (
          <div key={stage} className="kanban-column">
            <div className="kanban-header">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full border-2 ${STAGE_COLORS[stage]}`} />
                <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">{stage}</h2>
              </div>
              <span className="text-xs font-medium text-gray-400">{grouped[stage]?.length || 0}</span>
            </div>
            <div className="space-y-2 flex-1">
              {(grouped[stage] || []).map(lead => {
                const overdue = lead.nextFollowUp && new Date(lead.nextFollowUp) < new Date();
                return (
                  <div key={lead.id} className={`kanban-card ${lead.urgency === 'hot' ? 'urgency-hot' : lead.urgency === 'warm' ? 'urgency-warm' : ''} ${overdue ? 'ring-2 ring-red-300' : ''}`}>
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{lead.firstName} {lead.lastName || ''}</p>
                        {lead.address && <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{lead.address}</p>}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={urgencyBadge(lead.urgency)}>{lead.urgency}</span>
                        <span className="text-sm font-bold text-orange-600">{lead.score}</span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-1 text-xs text-gray-500 mb-3">
                      {lead.builder && (
                        <p className="flex items-center gap-1">
                          <span className="text-gray-400">Builder:</span>
                          <span className={lead.builder.relationship === 'partner' ? 'text-green-600 font-medium' : ''}>{lead.builder.name}</span>
                        </p>
                      )}
                      {lead.productInterest && <p><span className="text-gray-400">Interest:</span> {lead.productInterest}</p>}
                      {lead.timeline && <p><span className="text-gray-400">Stage:</span> {lead.timeline}</p>}
                      <p className="flex items-center gap-1"><span className="text-gray-400">Source:</span> {lead.source}</p>
                    </div>

                    {/* Contact info */}
                    <div className="flex items-center gap-2 mb-2">
                      {lead.phone && (
                        <a href={`tel:${lead.phone}`} className="btn-ghost btn-xs text-gray-500 hover:text-orange-600">
                          <Phone className="w-3 h-3" />{lead.phone}
                        </a>
                      )}
                      {lead.email && (
                        <a href={`mailto:${lead.email}`} className="btn-ghost btn-xs text-gray-500 hover:text-orange-600">
                          <Mail className="w-3 h-3" />Email
                        </a>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[10px]">
                      <span className="text-gray-400">{lead._count.outreach} outreach &middot; {formatRelative(lead.createdAt)}</span>
                      {lead.nextFollowUp && (
                        <span className={`flex items-center gap-0.5 ${overdue ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>
                          <Clock className="w-3 h-3" />
                          {overdue ? 'OVERDUE' : formatDate(lead.nextFollowUp)}
                        </span>
                      )}
                    </div>

                    {/* Sold amount */}
                    {lead.stage === 'sold' && lead.soldAmount && (
                      <div className="mt-2 pt-2 border-t border-green-100 flex items-center gap-1 text-green-700 text-xs font-semibold">
                        <DollarSign className="w-3 h-3" />{formatCurrency(lead.soldAmount)}
                      </div>
                    )}

                    {/* Lost reason */}
                    {lead.stage === 'lost' && lead.lostReason && (
                      <p className="mt-2 pt-2 border-t border-gray-100 text-[10px] text-gray-400 italic">{lead.lostReason}</p>
                    )}
                  </div>
                );
              })}

              {(!grouped[stage] || grouped[stage].length === 0) && (
                <div className="text-center py-8 text-gray-300">
                  <Users className="w-6 h-6 mx-auto mb-1" />
                  <p className="text-xs">No leads</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
