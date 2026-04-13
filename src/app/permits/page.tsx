import Link from 'next/link';
import { FileText, Filter, RefreshCw, MapPin, User, Hammer, DollarSign, Calendar, Clock, ArrowUpRight } from 'lucide-react';
import prisma from '@/lib/db';
import { formatCurrency, formatDate, formatRelative, permitStatusBadge, urgencyBadge, urgencyBorder, stageBadge } from '@/lib/utils';

async function getPermits(params: Record<string, string | undefined>) {
  try {
    const where: Record<string, unknown> = {};
    if (params.city) where.city = params.city;
    if (params.urgency) where.urgency = params.urgency;
    if (params.builder) where.contractorName = { contains: params.builder };
    if (params.type) where.type = params.type;

    const [permits, cities, counts] = await Promise.all([
      prisma.permit.findMany({ where, orderBy: { createdAt: 'desc' }, take: 100, include: { builder: { select: { name: true, relationship: true } }, lead: { select: { id: true, stage: true } } } }),
      prisma.permit.groupBy({ by: ['city'], _count: true, orderBy: { _count: { city: 'desc' } } }),
      prisma.permit.groupBy({ by: ['urgency'], _count: true }),
    ]);

    return { permits, cities, urgencyCounts: Object.fromEntries(counts.map(c => [c.urgency, c._count])) };
  } catch {
    return { permits: [], cities: [], urgencyCounts: {} };
  }
}

export default async function PermitsPage({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const { permits, cities, urgencyCounts } = await getPermits(searchParams);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Building Permits</h1>
          <p className="page-subtitle">{permits.length} permits &middot; Greene & Christian County new residential construction</p>
        </div>
        <Link href="/api/scrape" className="btn-primary btn-sm">
          <RefreshCw className="w-3.5 h-3.5" /> Sync Now
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-3 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />

          {/* City filter */}
          <Link href="/permits" className={`btn-xs rounded-full ${!searchParams.city ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>All</Link>
          {cities.map(c => (
            <Link key={c.city} href={`/permits?city=${c.city}`} className={`btn-xs rounded-full ${searchParams.city === c.city ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {c.city} <span className="text-[10px] opacity-70 ml-0.5">{c._count}</span>
            </Link>
          ))}

          <span className="border-l border-gray-300 h-4 mx-1" />

          {/* Urgency filter */}
          {(['hot', 'warm', 'normal'] as const).map(u => (
            <Link key={u} href={`/permits?urgency=${u}`} className={`btn-xs rounded-full ${searchParams.urgency === u ? 'bg-orange-600 text-white' : u === 'hot' ? 'bg-red-50 text-red-700 hover:bg-red-100' : u === 'warm' ? 'bg-orange-50 text-orange-700 hover:bg-orange-100' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}>
              {u} <span className="text-[10px] opacity-70 ml-0.5">{urgencyCounts[u] || 0}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Permit list */}
      <div className="space-y-2">
        {permits.map(p => (
          <div key={p.id} className={`card p-4 ${urgencyBorder(p.urgency)}`}>
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-gray-900">{p.propertyAddress}</h3>
                  <span className={permitStatusBadge(p.status)}>{p.status.replace('_', ' ')}</span>
                  <span className={urgencyBadge(p.urgency)}>{p.urgency}</span>
                  {p.builder?.relationship === 'partner' && <span className="badge-green">Partner builder</span>}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{p.permitNumber}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{p.city}, {p.county} Co.</span>
                  {p.contractorName && <span className="flex items-center gap-1"><Hammer className="w-3 h-3" />{p.contractorName}</span>}
                  {p.ownerName && <span className="flex items-center gap-1"><User className="w-3 h-3" />{p.ownerName}</span>}
                  {p.estimatedValue && <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{formatCurrency(p.estimatedValue)}</span>}
                  {p.squareFootage && <span>{Math.round(p.squareFootage)} sqft</span>}
                  {p.dateFiled && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(p.dateFiled)}</span>}
                  {p.subdivision && <span className="text-orange-600">{p.subdivision}</span>}
                </div>

                {p.description && <p className="text-xs text-gray-400 mt-1 truncate">{p.description}</p>}
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-center">
                  <p className="text-xl font-bold text-orange-600">{p.leadScore}</p>
                  <p className="text-[10px] text-gray-400">score</p>
                </div>
                <div className="flex flex-col gap-1">
                  {p.lead ? (
                    <span className={`btn-xs ${stageBadge(p.lead.stage)}`}>{p.lead.stage}</span>
                  ) : (
                    <Link href={`/api/leads?createFromPermit=${p.id}`} className="btn-primary btn-xs">
                      Create Lead
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {permits.length === 0 && (
          <div className="card p-12 text-center text-gray-400">
            <FileText className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No permits found</p>
            <p className="text-xs mt-1">Run the seed script or sync permits to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
