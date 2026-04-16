'use client';

import { useState } from 'react';
import { CheckCircle, X, Loader2 } from 'lucide-react';

interface Props {
  id: string;
  type: string;
  title: string;
  description: string;
  impact?: string | null;
}

export default function RecommendationCard({ id, type, title, description, impact }: Props) {
  const [status, setStatus] = useState<'pending' | 'approving' | 'approved' | 'dismissing' | 'dismissed' | 'error'>('pending');
  const [message, setMessage] = useState('');

  async function handle(action: 'approve' | 'dismiss') {
    setStatus(action === 'approve' ? 'approving' : 'dismissing');
    try {
      const res = await fetch('/api/ads/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recommendationId: id, action }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus(action === 'approve' ? 'approved' : 'dismissed');
        setMessage(data.message || '');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed');
      }
    } catch {
      setStatus('error');
      setMessage('Network error');
    }
  }

  if (status === 'approved' || status === 'dismissed') {
    return (
      <div className="p-4 bg-gray-50">
        <div className="flex items-center gap-2 text-xs">
          {status === 'approved' ? <CheckCircle className="w-3.5 h-3.5 text-green-500" /> : <X className="w-3.5 h-3.5 text-gray-400" />}
          <span className={status === 'approved' ? 'text-green-700 font-medium' : 'text-gray-500'}>
            {status === 'approved' ? 'Approved' : 'Dismissed'}
          </span>
          <span className="text-gray-400">— {title}</span>
        </div>
        {message && <p className="text-[10px] text-gray-500 mt-1">{message}</p>}
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className={`badge text-[10px] ${type === 'budget' ? 'badge-red' : type === 'keyword' || type === 'negative_keyword' ? 'badge-blue' : type === 'ad_copy' ? 'badge-purple' : type === 'seasonal' ? 'badge-orange' : 'badge-gray'}`}>
          {type.replace('_', ' ')}
        </span>
      </div>
      <p className="text-sm font-medium text-gray-900 mb-1">{title}</p>
      <p className="text-xs text-gray-600 mb-2">{description}</p>
      {impact && <p className="text-xs text-indigo-600 font-medium mb-3">{impact}</p>}
      <div className="flex items-center gap-2">
        <button onClick={() => handle('approve')} disabled={status !== 'pending'} className="btn-primary btn-xs">
          {status === 'approving' ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
          Approve
        </button>
        <button onClick={() => handle('dismiss')} disabled={status !== 'pending'} className="btn-ghost btn-xs text-gray-400">
          {status === 'dismissing' ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
          Dismiss
        </button>
        {status === 'error' && <span className="text-[10px] text-red-500">{message}</span>}
      </div>
    </div>
  );
}
