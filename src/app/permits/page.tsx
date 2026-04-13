import Link from 'next/link';
import { FileText, Filter, RefreshCw, MapPin, User, Hammer, DollarSign, Calendar, Map as MapIcon, List, ChevronRight } from 'lucide-react';
import prisma from '@/lib/db';
import { formatCurrency, formatDate, formatRelative, permitStatusBadge, urgencyBadge, urgencyBorder, stageBadge } from '@/lib/utils';
import PermitMapWrapper from './PermitMapWrapper';

async function getPermits(params: Record<string, string | undefined>) {
  try {
    const where: Record<string, unknown> = {};
    if (params.city) where.city = params.city;
    if (params.urgency) where.urgency = params.urgency;
    if (params.builder) where.contractorName = { contains: params.builder };

    const [permits, cities, counts] = await Promise.all([
      prisma.permit.findMany({ where, orderBy: { createdAt: 'desc' }, take: 200, include: { builder: { select: { name: true, relationship: true } }, lead: { select: { id: true, stage: true } } } }),
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
  const view = searchParams.view || 'list';

  // Permits with coordinates for the map
  const mapPermits = permits.filter(p => p.lat && p.lng).map(p => ({
    id: p.id, lat: p.lat!, lng: p.lng!, address: p.propertyAddress, city: p.city,
    permitNumber: p.permitNumber, leadScore: p.leadScore, urgency: p.urgency,
    ownerName: p.ownerName, contractorName: p.contractorName,
    estimatedValue: p.estimatedValue, status: p.status,
  }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Building Permits</h1>
          <p className="page-subtitle">{permits.length} residential permits &middot; Greene & Christian County</p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <Link href={`/permits?${new URLSearchParams({ ...searchParams, view: 'list' }).toString()}`}
              className={`p-2 ${view === 'list' ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
              <List className="w-4 h-4" />
            </Link>
            <Link href={`/permits?${new URLSearchParams({ ...searchParams, view: 'map' }).toString()}`}
              className={`p-2 ${view === 'map' ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
              <MapIcon className="w-4 h-4" />
            </Link>
          </div>
          <Link href="/api/scrape" className="btn-primary btn-sm">
            <RefreshCw className="w-3.5 h-3.5" /> Sync Permits
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-3 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <Link href={`/permits?view=${view}`} className={`btn-xs rounded-full ${!searchParams.city && !searchParams.urgency ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>All</Link>
          {cities.map(c => (
            <Link key={c.city} href={`/permits?city=${c.city}&view=${view}`} className={`btn-xs rounded-full ${searchParams.city === c.city ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {c.city} <span className="text-[10px] opacity-70 ml-0.5">{c._count}</span>
            </Link>
          ))}
          <span className="border-l border-gray-300 h-4 mx-1" />
          {(['hot', 'warm', 'normal'] as const).map(u => (
            <Link key={u} href={`/permits?urgency=${u}&view=${view}`} className={`btn-xs rounded-full ${searchParams.urgency === u ? 'bg-orange-600 text-white' : u === 'hot' ? 'bg-red-50 text-red-700 hover:bg-red-100' : u === 'warm' ? 'bg-orange-50 text-orange-700 hover:bg-orange-100' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}>
              {u} <span className="text-[10px] opacity-70 ml-0.5">{urgencyCounts[u] || 0}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Map View */}
      {view === 'map' && (
        <div className="mb-6">
          {mapPermits.length > 0 ? (
            <PermitMapWrapper permits={mapPermits} />
          ) : (
            <div className="card p-12 text-center text-gray-400">
              <MapIcon className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No geocoded permits yet</p>
              <p className="text-xs mt-1">Run &quot;Sync Permits&quot; to geocode permit addresses, or re-seed with <code className="bg-gray-100 px-1 rounded">npm run db:seed</code></p>
            </div>
          )}
        </div>
      )}

      {/* List View */}
      <div className="space-y-2">
        {permits.map(p => (
          <Link key={p.id} href={`/permits/${p.id}`} className={`card p-4 block hover:shadow-md transition-shadow cursor-pointer ${urgencyBorder(p.urgency)}`}>
            <div className="flex items-start gap-4">
              {/* Date column */}
              <div className="w-16 flex-shrink-0 text-center">
                {p.dateFiled ? (
                  <>
                    <p className="text-lg font-bold text-gray-900">{new Date(p.dateFiled).toLocaleDateString('en-US', { month: 'short' })}</p>
                    <p className="text-2xl font-bold text-gray-700 leading-tight">{new Date(p.dateFiled).getDate()}</p>
                    <p className="text-xs text-gray-400">{new Date(p.dateFiled).getFullYear()}</p>
                  </>
                ) : (
                  <p className="text-xs text-gray-300 mt-2">No date</p>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="text-sm font-semibold text-gray-900">{p.propertyAddress}</h3>
                  <span className={permitStatusBadge(p.status)}>{p.status.replace('_', ' ')}</span>
                  <span className={urgencyBadge(p.urgency)}>{p.urgency}</span>
                  {p.builder?.relationship === 'partner' && <span className="badge-green">Partner</span>}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{p.permitNumber}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{p.city}, {p.county} Co.</span>
                  {p.contractorName && <span className="flex items-center gap-1"><Hammer className="w-3 h-3" />{p.contractorName}</span>}
                  {p.ownerName && <span className="flex items-center gap-1"><User className="w-3 h-3" />{p.ownerName}</span>}
                  {p.estimatedValue && <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{formatCurrency(p.estimatedValue)}</span>}
                  {p.squareFootage && <span>{Math.round(p.squareFootage)} sqft</span>}
                  {p.subdivision && <span className="text-orange-600">{p.subdivision}</span>}
                </div>
                {p.description && <p className="text-xs text-gray-400 mt-1 truncate">{p.description}</p>}
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-center">
                  <p className="text-xl font-bold text-orange-600">{p.leadScore}</p>
                  <p className="text-[10px] text-gray-400">score</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </div>
            </div>
          </Link>
        ))}
        {permits.length === 0 && (
          <div className="card p-12 text-center text-gray-400">
            <FileText className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No permits found</p>
            <p className="text-xs mt-1">Run <code className="bg-gray-100 px-1 rounded">npm run db:seed</code> to load sample data.</p>
          </div>
        )}
      </div>
    </div>
  );
}
