'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Flame, LayoutDashboard, FileText, Users, Building2,
  Search, Star, PenTool, BarChart3, Settings, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useState } from 'react';

const NAV = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/permits', icon: FileText, label: 'Permits' },
  { href: '/leads', icon: Users, label: 'Leads' },
  { href: '/builders', icon: Building2, label: 'Builders' },
  { type: 'divider' as const },
  { href: '/seo', icon: Search, label: 'SEO' },
  { href: '/google-business', icon: Star, label: 'Google Business' },
  { href: '/content', icon: PenTool, label: 'Content' },
  { type: 'divider' as const },
  { href: '/reports', icon: BarChart3, label: 'Reports' },
  { href: '/settings', icon: Settings, label: 'Settings' },
] as const;

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={cn(
        'hidden lg:flex flex-col bg-gray-900 text-white transition-all duration-200 flex-shrink-0',
        collapsed ? 'w-16' : 'w-56'
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center gap-2.5 px-4 border-b border-gray-800 flex-shrink-0">
          <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Flame className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-bold text-sm truncate leading-tight">Aaron&apos;s Fireplace</p>
              <p className="text-[10px] text-gray-400 leading-tight">Lead Engine</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {NAV.map((item, i) => {
            if ('type' in item && item.type === 'divider') {
              return <div key={i} className="my-2 mx-3 border-t border-gray-800" />;
            }
            if (!('href' in item)) return null;
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={cn(
                  'flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg text-sm transition-colors',
                  isActive
                    ? 'bg-orange-600/20 text-orange-400'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                )}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="h-10 flex items-center justify-center border-t border-gray-800 text-gray-500 hover:text-gray-300 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </aside>

      {/* Mobile bottom nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-inset-bottom">
        <div className="flex items-center justify-around py-1">
          {NAV.filter(item => 'href' in item).slice(0, 5).map(item => {
            if (!('href' in item)) return null;
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-3 py-2 text-[10px] font-medium',
                  isActive ? 'text-orange-600' : 'text-gray-400'
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
