'use client';

import { formatCurrency, formatDate, getPermitStatusBadge, getLeadScoreBadge } from '@/lib/utils';
import { MapPin, User, Hammer, Calendar, DollarSign } from 'lucide-react';

interface Permit {
  id: string;
  permitNumber: string;
  source: string;
  type: string;
  status: string;
  propertyAddress: string;
  city: string;
  county: string;
  ownerName?: string | null;
  contractorName?: string | null;
  subdivision?: string | null;
  estimatedValue?: number | null;
  squareFootage?: number | null;
  dateFiled?: string | null;
  leadScore: number;
}

interface PermitTableProps {
  permits: Permit[];
  showActions?: boolean;
  onCreateLead?: (permitId: string) => void;
}

export default function PermitTable({ permits, showActions = false, onCreateLead }: PermitTableProps) {
  if (permits.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Hammer className="w-10 h-10 mx-auto mb-3 text-gray-300" />
        <p>No permits found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Permit / Address
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Details
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Score
            </th>
            {showActions && (
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {permits.map((permit) => (
            <tr key={permit.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-hearth-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-hearth-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {permit.propertyAddress}
                    </p>
                    <p className="text-xs text-gray-500">
                      {permit.permitNumber} &middot; {permit.city}, {permit.county} Co.
                    </p>
                    {permit.subdivision && (
                      <p className="text-xs text-hearth-600 mt-0.5">{permit.subdivision}</p>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="space-y-1 text-xs text-gray-600">
                  {permit.ownerName && (
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" /> {permit.ownerName}
                    </div>
                  )}
                  {permit.contractorName && (
                    <div className="flex items-center gap-1">
                      <Hammer className="w-3 h-3" /> {permit.contractorName}
                    </div>
                  )}
                  {permit.estimatedValue && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" /> {formatCurrency(permit.estimatedValue)}
                    </div>
                  )}
                  {permit.dateFiled && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {formatDate(permit.dateFiled)}
                    </div>
                  )}
                </div>
              </td>
              <td className="px-4 py-4">
                <span className={getPermitStatusBadge(permit.status)}>
                  {permit.status.replace('_', ' ')}
                </span>
                <p className="text-xs text-gray-400 mt-1">
                  {permit.type.replace('_', ' ')}
                </p>
              </td>
              <td className="px-4 py-4">
                <span className={`text-lg font-bold ${getLeadScoreBadge(permit.leadScore).includes('green') ? 'text-green-600' : getLeadScoreBadge(permit.leadScore).includes('yellow') ? 'text-yellow-600' : 'text-gray-400'}`}>
                  {permit.leadScore}
                </span>
              </td>
              {showActions && (
                <td className="px-4 py-4 text-right">
                  <button
                    onClick={() => onCreateLead?.(permit.id)}
                    className="text-xs text-hearth-600 hover:text-hearth-700 font-medium"
                  >
                    Create Lead
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
