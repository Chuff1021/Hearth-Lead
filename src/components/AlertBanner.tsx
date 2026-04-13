'use client';

import { cn } from '@/lib/utils';
import { AlertTriangle, X, Clock, Flame, Star, FileText } from 'lucide-react';
import { useState } from 'react';

export interface Alert {
  id: string;
  type: 'urgent' | 'warning' | 'info' | 'success';
  iconName?: 'flame' | 'clock' | 'star' | 'file';
  message: string;
  action?: { label: string; href: string };
}

const typeStyles = {
  urgent: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  success: 'bg-green-50 border-green-200 text-green-800',
};

export default function AlertBanner({ alerts }: { alerts: Alert[] }) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visible = alerts.filter(a => !dismissed.has(a.id));
  if (visible.length === 0) return null;

  return (
    <div className="space-y-2 mb-6">
      {visible.map(alert => (
        <div key={alert.id} className={cn('flex items-center gap-3 px-4 py-3 rounded-lg border text-sm', typeStyles[alert.type])}>
          {alert.iconName === 'flame' ? <Flame className="w-4 h-4 flex-shrink-0" /> : alert.iconName === 'clock' ? <Clock className="w-4 h-4 flex-shrink-0" /> : alert.iconName === 'star' ? <Star className="w-4 h-4 flex-shrink-0" /> : alert.iconName === 'file' ? <FileText className="w-4 h-4 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
          <span className="flex-1">{alert.message}</span>
          {alert.action && (
            <a href={alert.action.href} className="font-medium underline hover:no-underline whitespace-nowrap">
              {alert.action.label}
            </a>
          )}
          <button onClick={() => setDismissed(prev => new Set(prev).add(alert.id))} className="p-0.5 hover:opacity-70">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

// Pre-built alert generators
export function buildDashboardAlerts(data: {
  hotLeads: number;
  overdueFollowUps: number;
  unreviewedReviews: number;
  daysSinceGbpPost: number;
  newPermitsToday: number;
}): Alert[] {
  const alerts: Alert[] = [];

  if (data.hotLeads > 0) {
    alerts.push({
      id: 'hot-leads',
      type: 'urgent',
      iconName: 'flame',
      message: `${data.hotLeads} hot lead${data.hotLeads > 1 ? 's' : ''} need${data.hotLeads === 1 ? 's' : ''} immediate contact — the framing window is closing.`,
      action: { label: 'View leads', href: '/leads?urgency=hot' },
    });
  }

  if (data.overdueFollowUps > 0) {
    alerts.push({
      id: 'overdue',
      type: 'warning',
      iconName: 'clock',
      message: `${data.overdueFollowUps} follow-up${data.overdueFollowUps > 1 ? 's' : ''} overdue. Don't let these leads go cold.`,
      action: { label: 'View follow-ups', href: '/leads?filter=overdue' },
    });
  }

  if (data.unreviewedReviews > 0) {
    alerts.push({
      id: 'reviews',
      type: 'info',
      iconName: 'star',
      message: `${data.unreviewedReviews} new review${data.unreviewedReviews > 1 ? 's' : ''} need a response on Google Business.`,
      action: { label: 'Respond now', href: '/google-business' },
    });
  }

  if (data.daysSinceGbpPost > 7) {
    alerts.push({
      id: 'gbp-post',
      type: 'warning',
      iconName: 'file',
      message: `You haven't posted on Google Business in ${data.daysSinceGbpPost} days. Regular posts help your local ranking.`,
      action: { label: 'Create post', href: '/google-business' },
    });
  }

  if (data.newPermitsToday > 0) {
    alerts.push({
      id: 'new-permits',
      type: 'success',
      iconName: 'file',
      message: `${data.newPermitsToday} new building permit${data.newPermitsToday > 1 ? 's' : ''} found today.`,
      action: { label: 'Review permits', href: '/permits' },
    });
  }

  return alerts;
}
