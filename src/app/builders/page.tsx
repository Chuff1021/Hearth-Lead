import { Building2, ExternalLink, Phone, Mail, TrendingUp, Flame } from 'lucide-react';
import prisma from '@/lib/db';
import { formatCurrency, relationshipBadge } from '@/lib/utils';

async function getBuilders() {
  try {
    return await prisma.builder.findMany({
      orderBy: [{ relationship: 'asc' }, { totalPermits: 'desc' }],
      include: { _count: { select: { leads: true, permits: true } } },
    });
  } catch { return []; }
}

export default async function BuildersPage() {
  const builders = await getBuilders();
  const partners = builders.filter(b => b.relationship === 'partner');
  const prospects = builders.filter(b => b.relationship !== 'partner');

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Builder Relationships</h1>
          <p className="page-subtitle">{builders.length} builders tracked &middot; {partners.length} active partners</p>
        </div>
      </div>

      {/* Partner Builders */}
      {partners.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" /> Partner Builders
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {partners.map(b => (
              <div key={b.id} className="card p-5 border-green-200 bg-green-50/30">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{b.name}</h3>
                    {b.contactName && <p className="text-xs text-gray-500">{b.contactName}</p>}
                  </div>
                  <span className="badge-green">Partner</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center mb-3">
                  <div><p className="text-lg font-bold text-gray-900">{b.totalPermits}</p><p className="text-[10px] text-gray-400">Permits</p></div>
                  <div><p className="text-lg font-bold text-gray-900">{b._count.leads}</p><p className="text-[10px] text-gray-400">Leads</p></div>
                  <div><p className="text-lg font-bold text-gray-900">{b.totalSales}</p><p className="text-[10px] text-gray-400">Sales</p></div>
                </div>
                {b.fireplaceRate !== null && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-500">Fireplace rate</span>
                      <span className="font-medium">{Math.round((b.fireplaceRate || 0) * 100)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: `${(b.fireplaceRate || 0) * 100}%` }} />
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs">
                  {b.phone && <a href={`tel:${b.phone}`} className="btn-ghost btn-xs"><Phone className="w-3 h-3" />{b.phone}</a>}
                  {b.email && <a href={`mailto:${b.email}`} className="btn-ghost btn-xs"><Mail className="w-3 h-3" />Email</a>}
                </div>
                {b.totalRevenue > 0 && <p className="text-xs text-green-600 font-medium mt-2">{formatCurrency(b.totalRevenue)} total revenue</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Builders Table */}
      <div className="card overflow-hidden">
        <div className="card-header">
          <h2 className="card-title">All Builders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-th">Builder</th>
                <th className="table-th">Status</th>
                <th className="table-th">Permits</th>
                <th className="table-th">Leads</th>
                <th className="table-th">FP Rate</th>
                <th className="table-th">Sales</th>
                <th className="table-th">Revenue</th>
                <th className="table-th">Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {builders.map(b => (
                <tr key={b.id} className="table-row">
                  <td className="table-td">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-3.5 h-3.5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{b.name}</p>
                        {b.city && <p className="text-[11px] text-gray-400">{b.city}, MO</p>}
                      </div>
                    </div>
                  </td>
                  <td className="table-td"><span className={relationshipBadge(b.relationship)}>{b.relationship}</span></td>
                  <td className="table-td text-sm font-medium">{b.totalPermits} <span className="text-gray-400 text-xs">({b.activePermits} active)</span></td>
                  <td className="table-td text-sm">{b._count.leads}</td>
                  <td className="table-td">
                    {b.fireplaceRate !== null ? (
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-orange-500 rounded-full" style={{ width: `${(b.fireplaceRate || 0) * 100}%` }} />
                        </div>
                        <span className="text-xs text-gray-500">{Math.round((b.fireplaceRate || 0) * 100)}%</span>
                      </div>
                    ) : <span className="text-xs text-gray-300">—</span>}
                  </td>
                  <td className="table-td text-sm font-medium">{b.totalSales}</td>
                  <td className="table-td text-sm text-green-600 font-medium">{b.totalRevenue > 0 ? formatCurrency(b.totalRevenue) : '—'}</td>
                  <td className="table-td">
                    <div className="flex items-center gap-1">
                      {b.phone && <a href={`tel:${b.phone}`} className="p-1 text-gray-400 hover:text-orange-600"><Phone className="w-3.5 h-3.5" /></a>}
                      {b.website && <a href={b.website} target="_blank" rel="noopener noreferrer" className="p-1 text-gray-400 hover:text-orange-600"><ExternalLink className="w-3.5 h-3.5" /></a>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
