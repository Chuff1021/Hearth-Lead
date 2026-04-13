import { Send, Copy } from 'lucide-react';
import prisma from '@/lib/db';
import { generateOutreachMessage } from '@/lib/scoring/lead-score';

async function getOutreachQueue() {
  try {
    // Get hot leads that haven't been contacted
    const newLeads = await prisma.lead.findMany({
      where: { status: 'new', score: { gte: 50 } },
      orderBy: { score: 'desc' },
      take: 10,
      include: {
        permits: { take: 1 },
        builder: { select: { name: true } },
      },
    });

    // Get recent outreach logs
    const recentOutreach = await prisma.outreachLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        lead: { select: { firstName: true, lastName: true } },
        builder: { select: { name: true } },
      },
    });

    return { newLeads, recentOutreach };
  } catch {
    return { newLeads: [], recentOutreach: [] };
  }
}

export default async function OutreachPage() {
  const { newLeads, recentOutreach } = await getOutreachQueue();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Outreach Queue</h1>
          <p className="text-sm text-gray-500 mt-1">
            {newLeads.length} leads ready for outreach
          </p>
        </div>
      </div>

      {/* Outreach Queue */}
      <div className="space-y-4 mb-12">
        {newLeads.map(lead => {
          const message = generateOutreachMessage('homeowner', {
            name: lead.firstName || undefined,
            address: lead.address || undefined,
            builderName: lead.builder?.name,
            subdivision: lead.subdivision || undefined,
          });

          return (
            <div key={lead.id} className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {lead.firstName} {lead.lastName || ''}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {lead.address || 'Address unknown'} &middot; {lead.city || 'City unknown'}
                  </p>
                  {lead.builder && (
                    <p className="text-xs text-blue-600 mt-1">Builder: {lead.builder.name}</p>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-hearth-600">{lead.score}</span>
                  <p className="text-xs text-gray-400">lead score</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Suggested Outreach Message
                  </h4>
                  <button className="text-xs text-hearth-600 hover:text-hearth-700 flex items-center gap-1">
                    <Copy className="w-3 h-3" /> Copy
                  </button>
                </div>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                  {message}
                </pre>
              </div>

              <div className="flex gap-2 mt-4">
                {lead.email && (
                  <a
                    href={`mailto:${lead.email}?subject=Fireplace Options for Your New Home&body=${encodeURIComponent(message)}`}
                    className="btn-primary text-xs"
                  >
                    <Send className="w-3 h-3 mr-1" /> Email
                  </a>
                )}
                {lead.phone && (
                  <a href={`tel:${lead.phone}`} className="btn-secondary text-xs">
                    Call {lead.phone}
                  </a>
                )}
              </div>
            </div>
          );
        })}

        {newLeads.length === 0 && (
          <div className="card p-12 text-center text-gray-400">
            <Send className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p>No leads in the outreach queue.</p>
            <p className="text-xs mt-1">Hot leads (score 50+) with status &quot;new&quot; will appear here.</p>
          </div>
        )}
      </div>

      {/* Recent Outreach Log */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Outreach History</h2>
      <div className="card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Outcome</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {recentOutreach.map(log => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">
                  {log.lead ? `${log.lead.firstName} ${log.lead.lastName || ''}` : log.builder?.name || 'Unknown'}
                </td>
                <td className="px-4 py-3 text-xs"><span className="badge-gray">{log.type}</span></td>
                <td className="px-4 py-3 text-sm text-gray-600">{log.subject || '—'}</td>
                <td className="px-4 py-3 text-xs"><span className="badge-blue">{log.outcome || 'pending'}</span></td>
                <td className="px-4 py-3 text-xs text-gray-400">{log.createdAt.toLocaleDateString()}</td>
              </tr>
            ))}
            {recentOutreach.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">
                  No outreach logged yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
