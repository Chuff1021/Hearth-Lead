import { Building2, ExternalLink } from 'lucide-react';
import prisma from '@/lib/db';

async function getBuilders() {
  try {
    return await prisma.builder.findMany({
      orderBy: { totalPermits: 'desc' },
      include: { _count: { select: { leads: true } } },
    });
  } catch {
    return [];
  }
}

const RELATIONSHIP_COLORS: Record<string, string> = {
  unknown: 'badge-gray',
  contacted: 'badge-blue',
  pitched: 'badge-yellow',
  partner: 'badge-green',
  declined: 'badge-red',
};

export default async function BuildersPage() {
  const builders = await getBuilders();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Builder Relationships</h1>
          <p className="text-sm text-gray-500 mt-1">
            {builders.length} builders tracked
          </p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Builder</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Permits</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Leads</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fireplace Rate</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {builders.map(builder => (
              <tr key={builder.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{builder.name}</p>
                      {builder.city && (
                        <p className="text-xs text-gray-500">{builder.city}, MO</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <span className="font-semibold">{builder.totalPermits}</span>
                  {builder.activePermits > 0 && (
                    <span className="text-xs text-gray-400 ml-1">({builder.activePermits} active)</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{builder._count.leads}</td>
                <td className="px-6 py-4 text-sm">
                  {builder.fireplaceRate !== null ? (
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-hearth-500 rounded-full"
                          style={{ width: `${(builder.fireplaceRate || 0) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {Math.round((builder.fireplaceRate || 0) * 100)}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">Unknown</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={RELATIONSHIP_COLORS[builder.relationship] || 'badge-gray'}>
                    {builder.relationship}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  {builder.phone && (
                    <a href={`tel:${builder.phone}`} className="text-hearth-600 hover:text-hearth-700 text-xs block">
                      {builder.phone}
                    </a>
                  )}
                  {builder.website && (
                    <a href={builder.website} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 flex items-center gap-1 text-xs mt-1">
                      <ExternalLink className="w-3 h-3" /> Website
                    </a>
                  )}
                </td>
              </tr>
            ))}
            {builders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                  <Building2 className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  No builders yet. Run the seed script to populate.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
