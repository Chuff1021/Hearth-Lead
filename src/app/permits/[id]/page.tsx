import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, MapPin, User, Hammer, DollarSign, Calendar, FileText, Phone,
  Mail, ExternalLink, Clock, Flame, Copy, Send, UserPlus, ChevronRight,
  Home, Ruler, Building2, Tag
} from 'lucide-react';
import prisma from '@/lib/db';
import { formatCurrency, formatDate, formatRelative, permitStatusBadge, urgencyBadge, daysAgo } from '@/lib/utils';

export default async function PermitDetailPage({ params }: { params: { id: string } }) {
  const permit = await prisma.permit.findUnique({
    where: { id: params.id },
    include: {
      builder: true,
      lead: { include: { outreach: { orderBy: { createdAt: 'desc' }, take: 5 } } },
    },
  }).catch(() => null);

  if (!permit) notFound();

  const filedDays = permit.dateFiled ? daysAgo(permit.dateFiled) : null;
  const isUrgent = permit.urgency === 'hot' || permit.urgency === 'warm';
  const hasContactInfo = permit.ownerName || permit.ownerPhone || permit.ownerEmail;

  // Get outreach template
  const template = await prisma.outreachTemplate.findFirst({ where: { type: 'homeowner_intro' } });
  const outreachMsg = template?.body
    ?.replace(/\{\{firstName\}\}/g, permit.ownerName?.split(' ')[0] || 'there')
    ?.replace(/\{\{address\}\}/g, permit.propertyAddress)
    ?.replace(/\{\{builderName\}\}/g, permit.contractorName || 'your builder')
    || '';

  // Google Maps link
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(permit.propertyAddress + ', ' + permit.city + ', MO')}`;

  // County assessor lookup
  const assessorUrl = permit.county === 'Greene'
    ? `https://beacon.schneidercorp.com/Application.aspx?AppID=1064&LayerID=25055&PageTypeID=2&PageID=10273`
    : `https://beacon.schneidercorp.com/Application.aspx?AppID=1020&LayerID=23292&PageTypeID=2&PageID=9597`;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link href="/permits" className="btn-ghost btn-sm mb-3 inline-flex">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Permits
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{permit.propertyAddress}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-sm text-gray-500">{permit.city}, {permit.county} County, MO {permit.zip || ''}</span>
              <span className={permitStatusBadge(permit.status)}>{permit.status.replace('_', ' ')}</span>
              <span className={urgencyBadge(permit.urgency)}>{permit.urgency}</span>
            </div>
          </div>
          <div className="text-center flex-shrink-0">
            <div className="text-3xl font-bold text-orange-600">{permit.leadScore}</div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wider">Lead Score</div>
          </div>
        </div>
      </div>

      {/* Urgency Banner */}
      {isUrgent && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <Flame className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">
              {permit.urgency === 'hot' ? 'Hot Lead — Contact Immediately' : 'Warm Lead — Contact Soon'}
            </p>
            <p className="text-xs text-red-600 mt-1">
              {permit.status === 'applied' || permit.status === 'in_review'
                ? 'This permit was just filed. The homeowner hasn\'t committed to a fireplace yet — reach out before framing starts.'
                : permit.status === 'approved'
                ? 'Permit approved. Construction is about to start. Contact before the framing phase to discuss fireplace options.'
                : 'Construction is underway. The window for a standard fireplace install is closing — act fast.'}
              {filedDays !== null && ` Filed ${filedDays} days ago.`}
            </p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Permit Details Card */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Permit Details</h2>
              <span className="text-xs text-gray-400">{permit.permitNumber}</span>
            </div>
            <div className="card-body">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400">Property Address</p>
                      <p className="text-sm font-medium text-gray-900">{permit.propertyAddress}</p>
                      <p className="text-xs text-gray-500">{permit.city}, {permit.county} Co., MO {permit.zip || ''}</p>
                      <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-orange-600 hover:text-orange-700 flex items-center gap-1 mt-1">
                        <ExternalLink className="w-3 h-3" /> View on Google Maps
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400">Permit Number</p>
                      <p className="text-sm font-medium text-gray-900">{permit.permitNumber}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Tag className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400">Type</p>
                      <p className="text-sm font-medium text-gray-900">{permit.type.replace('_', ' ')}{permit.subType ? ` — ${permit.subType.replace('_', ' ')}` : ''}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Tag className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400">Status</p>
                      <p className="text-sm font-medium text-gray-900">{permit.status.replace('_', ' ')}</p>
                    </div>
                  </div>

                  {permit.description && (
                    <div className="flex items-start gap-3">
                      <Home className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">Description</p>
                        <p className="text-sm text-gray-900">{permit.description}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {permit.dateFiled && (
                    <div className="flex items-start gap-3">
                      <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">Date Filed / Issued</p>
                        <p className="text-sm font-medium text-gray-900">{formatDate(permit.dateFiled)}</p>
                        {filedDays !== null && <p className="text-xs text-gray-500">{filedDays} days ago</p>}
                      </div>
                    </div>
                  )}

                  {permit.estimatedValue && (
                    <div className="flex items-start gap-3">
                      <DollarSign className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">Estimated Value</p>
                        <p className="text-sm font-medium text-gray-900">{formatCurrency(permit.estimatedValue)}</p>
                      </div>
                    </div>
                  )}

                  {permit.squareFootage && (
                    <div className="flex items-start gap-3">
                      <Ruler className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">Square Footage</p>
                        <p className="text-sm font-medium text-gray-900">{Math.round(permit.squareFootage).toLocaleString()} sqft</p>
                      </div>
                    </div>
                  )}

                  {permit.subdivision && (
                    <div className="flex items-start gap-3">
                      <Building2 className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">Subdivision</p>
                        <p className="text-sm font-medium text-gray-900">{permit.subdivision}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400">Data Source</p>
                      <p className="text-sm text-gray-600">{permit.source.replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* People Card */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">People</h2>
            </div>
            <div className="card-body">
              <div className="grid sm:grid-cols-2 gap-6">
                {/* Owner */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Owner / Applicant</h3>
                  {permit.ownerName ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{permit.ownerName}</span>
                      </div>
                      {permit.ownerMailingAddr && (
                        <p className="text-xs text-gray-500 ml-6">{permit.ownerMailingAddr}</p>
                      )}
                      {permit.ownerPhone && (
                        <a href={`tel:${permit.ownerPhone}`} className="flex items-center gap-2 ml-6 text-sm text-orange-600 hover:text-orange-700">
                          <Phone className="w-3.5 h-3.5" /> {permit.ownerPhone}
                        </a>
                      )}
                      {permit.ownerEmail && (
                        <a href={`mailto:${permit.ownerEmail}`} className="flex items-center gap-2 ml-6 text-sm text-orange-600 hover:text-orange-700">
                          <Mail className="w-3.5 h-3.5" /> {permit.ownerEmail}
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400 italic">
                      Not available from this source.
                      <a href={assessorUrl} target="_blank" rel="noopener noreferrer" className="block text-orange-600 hover:text-orange-700 mt-1 not-italic text-xs">
                        <ExternalLink className="w-3 h-3 inline mr-1" />
                        Look up on {permit.county} County Assessor
                      </a>
                    </div>
                  )}
                </div>

                {/* Contractor */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Builder / Contractor</h3>
                  {permit.contractorName ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Hammer className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{permit.contractorName}</span>
                      </div>
                      {permit.builder && (
                        <>
                          <span className={`ml-6 ${permit.builder.relationship === 'partner' ? 'badge-green' : permit.builder.relationship === 'contacted' ? 'badge-blue' : 'badge-gray'}`}>
                            {permit.builder.relationship}
                          </span>
                          {permit.builder.phone && (
                            <a href={`tel:${permit.builder.phone}`} className="flex items-center gap-2 ml-6 text-sm text-orange-600 hover:text-orange-700">
                              <Phone className="w-3.5 h-3.5" /> {permit.builder.phone}
                            </a>
                          )}
                          <Link href={`/builders`} className="text-xs text-orange-600 hover:text-orange-700 ml-6">
                            View builder details →
                          </Link>
                        </>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic">Not listed on this permit</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Outreach Template */}
          {outreachMsg && (
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Suggested Outreach Message</h2>
                <span className="text-xs text-gray-400">Auto-filled from permit data</span>
              </div>
              <div className="card-body">
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                  {outreachMsg}
                </div>
                <div className="flex items-center gap-2 mt-4">
                  {permit.ownerEmail && (
                    <a href={`mailto:${permit.ownerEmail}?subject=Fireplace options for your new home&body=${encodeURIComponent(outreachMsg)}`} className="btn-primary btn-sm">
                      <Mail className="w-3.5 h-3.5" /> Send Email
                    </a>
                  )}
                  {permit.ownerPhone && (
                    <a href={`tel:${permit.ownerPhone}`} className="btn-secondary btn-sm">
                      <Phone className="w-3.5 h-3.5" /> Call
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Outreach History */}
          {permit.lead && permit.lead.outreach.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Outreach History</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {permit.lead.outreach.map(log => (
                  <div key={log.id} className="p-4 flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${log.direction === 'outbound' ? 'bg-orange-100' : 'bg-blue-100'}`}>
                      {log.type === 'email' ? <Mail className="w-4 h-4 text-orange-600" /> :
                       log.type === 'phone' ? <Phone className="w-4 h-4 text-orange-600" /> :
                       <User className="w-4 h-4 text-orange-600" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{log.subject || log.type}</p>
                      <p className="text-xs text-gray-500">{log.direction} &middot; {log.outcome || 'pending'} &middot; {formatRelative(log.createdAt)}</p>
                      {log.notes && <p className="text-xs text-gray-400 mt-1">{log.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar — Quick Actions */}
        <div className="space-y-4">
          {/* Quick Actions Card */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Quick Actions</h2>
            </div>
            <div className="card-body space-y-2">
              {!permit.lead ? (
                <Link href={`/api/leads?createFromPermit=${permit.id}`} className="btn-primary w-full justify-start">
                  <UserPlus className="w-4 h-4" /> Create Lead from This Permit
                </Link>
              ) : (
                <Link href="/leads" className="btn-success w-full justify-start">
                  <User className="w-4 h-4" /> View Lead ({permit.lead.stage})
                </Link>
              )}
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary w-full justify-start">
                <MapPin className="w-4 h-4" /> View on Google Maps
              </a>
              <a href={assessorUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary w-full justify-start">
                <ExternalLink className="w-4 h-4" /> {permit.county} Co. Assessor Lookup
              </a>
              {permit.contractorName && (
                <a href={`https://www.google.com/search?q=${encodeURIComponent(permit.contractorName + ' Springfield MO')}`} target="_blank" rel="noopener noreferrer" className="btn-secondary w-full justify-start">
                  <Hammer className="w-4 h-4" /> Google This Builder
                </a>
              )}
              {permit.ownerName && (
                <a href={`https://www.google.com/search?q=${encodeURIComponent(permit.ownerName + ' ' + permit.city + ' MO')}`} target="_blank" rel="noopener noreferrer" className="btn-secondary w-full justify-start">
                  <User className="w-4 h-4" /> Google This Owner
                </a>
              )}
            </div>
          </div>

          {/* Timing Card */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Timing</h2>
            </div>
            <div className="card-body">
              <div className="space-y-3 text-sm">
                {permit.dateFiled && (
                  <div>
                    <p className="text-xs text-gray-400">Filed / Issued</p>
                    <p className="font-medium text-gray-900">{formatDate(permit.dateFiled)}</p>
                    <p className="text-xs text-gray-500">{filedDays} days ago</p>
                  </div>
                )}
                {permit.dateApproved && (
                  <div>
                    <p className="text-xs text-gray-400">Approved</p>
                    <p className="font-medium text-gray-900">{formatDate(permit.dateApproved)}</p>
                  </div>
                )}
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-400">Contact Window</p>
                  <p className={`font-semibold ${isUrgent ? 'text-red-600' : 'text-gray-700'}`}>
                    {permit.status === 'applied' || permit.status === 'in_review'
                      ? '🔥 Contact within 48 hours'
                      : permit.status === 'approved'
                      ? '⚡ Contact within 1 week'
                      : permit.status === 'under_inspection'
                      ? '⏰ Window closing — ASAP'
                      : '📋 Retrofit opportunity only'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Added to System</p>
                  <p className="text-gray-600">{formatDate(permit.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Lead Score Breakdown</h2>
            </div>
            <div className="card-body text-xs text-gray-600 space-y-1.5">
              <div className="flex justify-between"><span>Permit type (new residential)</span><span className="font-medium text-gray-900">+20</span></div>
              {permit.estimatedValue && <div className="flex justify-between"><span>Home value ({formatCurrency(permit.estimatedValue)})</span><span className="font-medium text-gray-900">+{permit.estimatedValue >= 500000 ? 20 : permit.estimatedValue >= 350000 ? 16 : permit.estimatedValue >= 250000 ? 12 : 6}</span></div>}
              {permit.squareFootage && <div className="flex justify-between"><span>Size ({Math.round(permit.squareFootage)} sqft)</span><span className="font-medium text-gray-900">+{permit.squareFootage >= 3000 ? 15 : permit.squareFootage >= 2200 ? 11 : permit.squareFootage >= 1600 ? 7 : 3}</span></div>}
              <div className="flex justify-between"><span>Permit stage ({permit.status.replace('_', ' ')})</span><span className="font-medium text-gray-900">+{permit.status === 'applied' ? 15 : permit.status === 'in_review' ? 13 : permit.status === 'approved' ? 10 : 5}</span></div>
              {permit.builder?.relationship === 'partner' && <div className="flex justify-between"><span>Partner builder</span><span className="font-medium text-green-600">+15</span></div>}
              <div className="pt-2 border-t border-gray-200 flex justify-between font-semibold text-sm">
                <span>Total Score</span>
                <span className="text-orange-600">{permit.leadScore}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
