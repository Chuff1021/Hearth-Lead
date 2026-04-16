'use client';

import { Settings, Key, Bell, FileText, Database, Globe, CheckCircle, XCircle, ExternalLink, Shield, Megaphone, BarChart3, Search } from 'lucide-react';
import { useState } from 'react';

interface ConnectionStatus {
  name: string;
  icon: React.ReactNode;
  description: string;
  connected: boolean;
  setupSteps: string[];
  envVars: string[];
  docsUrl: string;
}

const CONNECTIONS: ConnectionStatus[] = [
  {
    name: 'Google Business Profile',
    icon: <Globe className="w-5 h-5 text-blue-600" />,
    description: 'Reviews, posts, performance metrics, photos',
    connected: false,
    setupSteps: [
      'Go to console.cloud.google.com and create a project (or use an existing one)',
      'Enable "My Business Business Information API" and "My Business Account Management API"',
      'Apply for GBP API access at support.google.com/business/workflow/16726127',
      'Create OAuth 2.0 credentials (Web application type)',
      'Add redirect URI: YOUR_SITE/api/google/callback',
      'Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in Vercel env vars',
      'Click "Connect" below to start the OAuth flow',
    ],
    envVars: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
    docsUrl: 'https://developers.google.com/my-business/content/basic-setup',
  },
  {
    name: 'Google Ads',
    icon: <Megaphone className="w-5 h-5 text-green-600" />,
    description: 'Campaign management, keyword optimization, AI recommendations',
    connected: false,
    setupSteps: [
      'Create a Google Ads Manager account at ads.google.com/home/tools/manager-accounts',
      'Apply for API Developer Token in the Manager account settings (API Center)',
      'Note: Basic access (for your own account) is usually auto-approved',
      'Use the same Google Cloud project and OAuth credentials as GBP',
      'Set GOOGLE_ADS_DEVELOPER_TOKEN and GOOGLE_ADS_CUSTOMER_ID in Vercel env vars',
      'The Customer ID is the 10-digit number from your Google Ads account (xxx-xxx-xxxx)',
    ],
    envVars: ['GOOGLE_ADS_DEVELOPER_TOKEN', 'GOOGLE_ADS_CUSTOMER_ID'],
    docsUrl: 'https://developers.google.com/google-ads/api/docs/first-call/overview',
  },
  {
    name: 'Google Search Console',
    icon: <Search className="w-5 h-5 text-orange-600" />,
    description: 'Keyword rankings, search impressions, page indexing',
    connected: false,
    setupSteps: [
      'Verify your website in Google Search Console (search.google.com/search-console)',
      'Use the same Google Cloud project — enable "Search Console API"',
      'Uses the same OAuth credentials as GBP',
      'Set GOOGLE_SEARCH_CONSOLE_SITE to your website URL (e.g., https://yoursite.com)',
    ],
    envVars: ['GOOGLE_SEARCH_CONSOLE_SITE'],
    docsUrl: 'https://developers.google.com/webmaster-tools/v1/how-tos/search_analytics',
  },
  {
    name: 'Google Analytics (GA4)',
    icon: <BarChart3 className="w-5 h-5 text-purple-600" />,
    description: 'Website traffic, user behavior, conversion tracking',
    connected: false,
    setupSteps: [
      'Use the same Google Cloud project — enable "Google Analytics Data API"',
      'Find your GA4 Property ID in Analytics > Admin > Property Settings',
      'Set GOOGLE_ANALYTICS_PROPERTY to the property ID (e.g., 123456789)',
    ],
    envVars: ['GOOGLE_ANALYTICS_PROPERTY'],
    docsUrl: 'https://developers.google.com/analytics/devguides/reporting/data/v1',
  },
  {
    name: 'AI Engine (NVIDIA)',
    icon: <Shield className="w-5 h-5 text-indigo-600" />,
    description: 'AI-powered review responses, ad copy, SEO content, competitive strategy, recommendations',
    connected: false,
    setupSteps: [
      'Go to build.nvidia.com and sign in (free)',
      'Click "Get API Key" in the top right',
      'Set NVIDIA_API_KEY in Vercel env vars',
      'Optional: Set NVIDIA_MODEL to override the default (meta/llama-3.3-70b-instruct)',
      'Recommended models: meta/llama-3.3-70b-instruct (fast + smart), nvidia/llama-3.3-nemotron-super-49b-v1 (reasoning), deepseek-ai/deepseek-r1 (deep analysis)',
      'Without this key, the app falls back to built-in templates (still works, just not as personalized)',
    ],
    envVars: ['NVIDIA_API_KEY', 'NVIDIA_MODEL (optional)'],
    docsUrl: 'https://build.nvidia.com',
  },
];

export default function SettingsPage() {
  const [expandedConn, setExpandedConn] = useState<string | null>(null);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Connect your Google accounts and configure the AI engine.</p>
        </div>
      </div>

      {/* Connection Status Overview */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        {CONNECTIONS.map(conn => (
          <div key={conn.name} className={`card p-4 ${conn.connected ? 'border-green-200 bg-green-50/30' : 'border-yellow-200 bg-yellow-50/30'}`}>
            <div className="flex items-center gap-3">
              {conn.icon}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{conn.name}</p>
                <p className="text-[10px] text-gray-500">{conn.description}</p>
              </div>
              {conn.connected ? (
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Connection Setup */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">API Connections</h2>
      <div className="space-y-3 mb-8">
        {CONNECTIONS.map(conn => (
          <div key={conn.name} className="card overflow-hidden">
            <button
              onClick={() => setExpandedConn(expandedConn === conn.name ? null : conn.name)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {conn.icon}
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900">{conn.name}</p>
                  <p className="text-xs text-gray-500">{conn.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={conn.connected ? 'badge-green' : 'badge-yellow'}>
                  {conn.connected ? 'Connected' : 'Not connected'}
                </span>
              </div>
            </button>

            {expandedConn === conn.name && (
              <div className="border-t border-gray-100 p-4 bg-gray-50/50">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Setup Steps</h4>
                <ol className="space-y-2 mb-4">
                  {conn.setupSteps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="w-5 h-5 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                      {step}
                    </li>
                  ))}
                </ol>

                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Required Environment Variables</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  {conn.envVars.map(v => (
                    <code key={v} className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs">{v}</code>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  {!conn.connected && conn.name !== 'AI Engine (Claude)' && (
                    <a href="/api/google/auth" className="btn-primary btn-sm">
                      Connect Google Account
                    </a>
                  )}
                  <a href={conn.docsUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost btn-sm text-orange-600">
                    <ExternalLink className="w-3.5 h-3.5" /> API Docs
                  </a>
                </div>
                <p className="text-xs text-gray-400 mt-3">
                  Set env vars in Vercel Dashboard → Project → Settings → Environment Variables.
                  The app works with mock data until these are connected.
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Permit Scraping */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title flex items-center gap-2"><Database className="w-4 h-4" /> Permit Data Sources</h2>
          </div>
          <div className="card-body space-y-3">
            {[
              { name: 'City of Springfield (Permit Report)', status: 'active', permits: 281 },
              { name: 'HBA Excel (Springfield + Greene Co)', status: 'active', permits: 188 },
              { name: 'City of Ozark (SmartGov)', status: 'active', permits: 10 },
              { name: 'City of Nixa (BS&A Online)', status: 'needs_work', permits: 0 },
              { name: 'Christian County PDFs', status: 'needs_work', permits: 0 },
              { name: 'SBJ On the Record', status: 'needs_work', permits: 0 },
            ].map(source => (
              <div key={source.name} className="flex items-center justify-between p-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">{source.name}</p>
                  {source.permits > 0 && <p className="text-[10px] text-gray-400">{source.permits} permits loaded</p>}
                </div>
                <span className={source.status === 'active' ? 'badge-green' : 'badge-yellow'}>{source.status === 'active' ? 'Active' : 'In progress'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title flex items-center gap-2"><Bell className="w-4 h-4" /> Notifications</h2>
          </div>
          <div className="card-body space-y-3">
            {[
              { label: 'New high-score permit found', desc: 'When a permit scores 70+ or is from a partner builder', on: true },
              { label: 'Follow-up overdue', desc: 'When a scheduled follow-up is past due', on: true },
              { label: 'New Google review', desc: 'When a new review comes in', on: true },
              { label: 'Google Ads budget alert', desc: 'When daily spend hits budget limit early', on: true },
              { label: 'Weekly AI digest', desc: 'Monday morning summary of everything', on: true },
              { label: 'SEO ranking change', desc: 'When a keyword moves 5+ positions', on: false },
            ].map(notif => (
              <label key={notif.label} className="flex items-start gap-3 p-2 cursor-pointer hover:bg-gray-50 rounded-lg">
                <input type="checkbox" defaultChecked={notif.on} className="mt-1 h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{notif.label}</p>
                  <p className="text-xs text-gray-400">{notif.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
