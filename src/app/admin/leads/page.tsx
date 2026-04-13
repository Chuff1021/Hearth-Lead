import { Users } from 'lucide-react';
import prisma from '@/lib/db';
import { formatDate, getStatusBadge } from '@/lib/utils';

const STATUS_COLUMNS = ['new', 'contacted', 'quoted', 'won', 'lost'] as const;

async function getLeads() {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
      include: { builder: { select: { name: true } } },
    });
    return leads;
  } catch {
    return [];
  }
}

export default async function LeadsPage() {
  const leads = await getLeads();

  const grouped = STATUS_COLUMNS.reduce((acc, status) => {
    acc[status] = leads.filter(l => l.status === status);
    return acc;
  }, {} as Record<string, typeof leads>);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lead Pipeline</h1>
          <p className="text-sm text-gray-500 mt-1">
            {leads.length} total leads &middot; {grouped.new.length} new
          </p>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STATUS_COLUMNS.map(status => (
          <div key={status} className="min-w-[280px] flex-1">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                {status}
              </h2>
              <span className="badge-gray text-xs">{grouped[status].length}</span>
            </div>
            <div className="space-y-3">
              {grouped[status].map(lead => (
                <div key={lead.id} className="card p-4">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-medium text-gray-900">
                      {lead.firstName} {lead.lastName || ''}
                    </p>
                    <span className="text-xs font-bold text-hearth-600">{lead.score}</span>
                  </div>
                  {lead.address && (
                    <p className="text-xs text-gray-500 mb-1">{lead.address}</p>
                  )}
                  {lead.city && (
                    <p className="text-xs text-gray-500 mb-1">{lead.city}, MO</p>
                  )}
                  {lead.builder && (
                    <p className="text-xs text-blue-600 mb-1">{lead.builder.name}</p>
                  )}
                  {lead.email && (
                    <p className="text-xs text-gray-400">{lead.email}</p>
                  )}
                  {lead.phone && (
                    <p className="text-xs text-gray-400">{lead.phone}</p>
                  )}
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                    <span className={getStatusBadge(lead.status)}>{lead.status}</span>
                    <span className="text-[10px] text-gray-400">
                      {formatDate(lead.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
              {grouped[status].length === 0 && (
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
