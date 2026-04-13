'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Flame, Home, FileText, Users, Building2, Send, BarChart3, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: Home },
  { href: '/admin/permits', label: 'Permits', icon: FileText },
  { href: '/admin/leads', label: 'Leads', icon: Users },
  { href: '/admin/builders', label: 'Builders', icon: Building2 },
  { href: '/admin/outreach', label: 'Outreach', icon: Send },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex-shrink-0 hidden lg:flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-hearth-600 rounded-lg flex items-center justify-center">
              <Flame className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm">Hearth Lead Engine</p>
              <p className="text-[10px] text-gray-400">Admin Dashboard</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4">
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-6 py-3 text-sm transition-colors',
                  isActive
                    ? 'bg-hearth-600/20 text-hearth-400 border-r-2 border-hearth-500'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <Link href="/" className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors">
            <ArrowLeft className="w-3 h-3" /> Back to marketing site
          </Link>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-gray-900 text-white z-50 border-b border-gray-800">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-hearth-500" />
            <span className="font-bold text-sm">Admin</span>
          </div>
        </div>
        <div className="flex overflow-x-auto px-2 pb-2 gap-1">
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-1 px-3 py-1.5 rounded-full text-xs whitespace-nowrap',
                  isActive ? 'bg-hearth-600 text-white' : 'text-gray-400 hover:text-white'
                )}
              >
                <item.icon className="w-3 h-3" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 lg:pt-0 pt-24 overflow-auto">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
