import { FileText, Filter, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import PermitTable from '@/components/PermitTable';
import prisma from '@/lib/db';

async function getPermits(searchParams: Record<string, string | undefined>) {
  const city = searchParams.city;
  const type = searchParams.type;
  const minScore = searchParams.minScore ? parseInt(searchParams.minScore) : undefined;

  try {
    const permits = await prisma.permit.findMany({
      where: {
        ...(city && { city }),
        ...(type && { type }),
        ...(minScore && { leadScore: { gte: minScore } }),
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const cities = await prisma.permit.groupBy({
      by: ['city'],
      _count: true,
      orderBy: { _count: { city: 'desc' } },
    });

    return { permits, cities };
  } catch {
    return { permits: [], cities: [] };
  }
}

export default async function PermitsPage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const { permits, cities } = await getPermits(searchParams);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Building Permits</h1>
          <p className="text-sm text-gray-500 mt-1">
            {permits.length} permits found &middot; New residential construction in Greene & Christian County
          </p>
        </div>
        <Link href="/api/scrape" className="btn-primary text-sm">
          <RefreshCw className="w-4 h-4 mr-2" /> Sync Now
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Filters</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/permits"
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              !searchParams.city ? 'bg-hearth-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Cities
          </Link>
          {cities.map(c => (
            <Link
              key={c.city}
              href={`/admin/permits?city=${c.city}`}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                searchParams.city === c.city ? 'bg-hearth-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {c.city} ({c._count})
            </Link>
          ))}
          <span className="border-l border-gray-300 mx-2" />
          <Link
            href="/admin/permits?minScore=75"
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              searchParams.minScore === '75' ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100'
            }`}
          >
            Hot Leads (75+)
          </Link>
          <Link
            href="/admin/permits?minScore=50"
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              searchParams.minScore === '50' ? 'bg-yellow-600 text-white' : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
            }`}
          >
            Warm (50+)
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <PermitTable
          permits={permits.map(p => ({
            ...p,
            dateFiled: p.dateFiled?.toISOString() || null,
          }))}
          showActions
        />
      </div>
    </div>
  );
}
