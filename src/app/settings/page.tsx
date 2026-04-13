import { Settings, Key, Bell, FileText, Database, Globe } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Configure API connections, templates, and notification preferences.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* API Connections */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title flex items-center gap-2"><Key className="w-4 h-4" /> API Connections</h2>
          </div>
          <div className="card-body space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Google Search Console</p>
                  <p className="text-xs text-gray-400">Track keyword rankings and search performance</p>
                </div>
              </div>
              <span className="badge-yellow">Not connected</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Google Analytics</p>
                  <p className="text-xs text-gray-400">Website traffic and user behavior</p>
                </div>
              </div>
              <span className="badge-yellow">Not connected</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium">Google Business Profile</p>
                  <p className="text-xs text-gray-400">Reviews, posts, and local search metrics</p>
                </div>
              </div>
              <span className="badge-yellow">Not connected</span>
            </div>
            <p className="text-xs text-gray-400">
              Add your Google API credentials in the <code className="bg-gray-100 px-1 rounded">.env</code> file.
              The app works without these connections — you can manually enter keyword data, reviews, and posts.
            </p>
          </div>
        </div>

        {/* Permit Scraping */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title flex items-center gap-2"><Database className="w-4 h-4" /> Permit Data Sources</h2>
          </div>
          <div className="card-body space-y-3">
            {[
              { name: 'City of Springfield (eCity)', url: 'ecity.springfieldmo.gov', status: 'active' },
              { name: 'City of Ozark (SmartGov)', url: 'ozarkmissouri.com', status: 'active' },
              { name: 'City of Nixa (myNixa)', url: 'nixa.com', status: 'active' },
              { name: 'Greene County', url: 'greenecountymo.gov', status: 'manual' },
              { name: 'Christian County', url: 'christiancountymo.gov', status: 'manual' },
              { name: 'FRED API (trends)', url: 'fred.stlouisfed.org', status: 'active' },
            ].map(source => (
              <div key={source.name} className="flex items-center justify-between p-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">{source.name}</p>
                  <p className="text-[11px] text-gray-400">{source.url}</p>
                </div>
                <span className={source.status === 'active' ? 'badge-green' : 'badge-yellow'}>{source.status}</span>
              </div>
            ))}
            <p className="text-xs text-gray-400 mt-2">
              &quot;Active&quot; sources are scraped automatically. &quot;Manual&quot; sources require in-person permit lookups —
              the county offices don&apos;t have online portals.
            </p>
          </div>
        </div>

        {/* Notifications */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title flex items-center gap-2"><Bell className="w-4 h-4" /> Notifications</h2>
          </div>
          <div className="card-body space-y-3">
            {[
              { label: 'New high-score permit found', description: 'When a permit scores 70+ or is from a partner builder', default: true },
              { label: 'Follow-up overdue', description: 'When a scheduled follow-up passes without being completed', default: true },
              { label: 'New Google review', description: 'When a new review appears on your Google Business Profile', default: true },
              { label: 'Weekly digest', description: 'Summary of new permits, leads, and key metrics every Monday', default: true },
              { label: 'SEO ranking change', description: 'When a tracked keyword moves more than 5 positions', default: false },
            ].map(notif => (
              <label key={notif.label} className="flex items-start gap-3 p-2 cursor-pointer hover:bg-gray-50 rounded-lg">
                <input type="checkbox" defaultChecked={notif.default} className="mt-1 h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{notif.label}</p>
                  <p className="text-xs text-gray-400">{notif.description}</p>
                </div>
              </label>
            ))}
            <p className="text-xs text-gray-400 mt-2">
              Email notifications require SMTP configuration in the .env file.
            </p>
          </div>
        </div>

        {/* Outreach Templates */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title flex items-center gap-2"><FileText className="w-4 h-4" /> Outreach Templates</h2>
          </div>
          <div className="card-body space-y-3">
            {[
              { name: 'Homeowner Intro', type: 'email', desc: 'First outreach to new permit homeowner' },
              { name: 'Builder Partnership Pitch', type: 'email', desc: 'Initial pitch to new builder' },
              { name: 'Follow-Up (No Response)', type: 'email', desc: 'Second touch after no reply' },
              { name: 'Quote Follow-Up', type: 'email', desc: 'Check in after sending a quote' },
              { name: 'Thank You / Review Request', type: 'email', desc: 'After completing an install' },
            ].map(tmpl => (
              <div key={tmpl.name} className="flex items-center justify-between p-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">{tmpl.name}</p>
                  <p className="text-[11px] text-gray-400">{tmpl.desc}</p>
                </div>
                <span className="badge-gray">{tmpl.type}</span>
              </div>
            ))}
            <p className="text-xs text-gray-400 mt-2">
              Templates auto-fill with lead data (name, address, builder, etc.). Edit them in the database via Prisma Studio (<code className="bg-gray-100 px-1 rounded">npm run db:studio</code>).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
