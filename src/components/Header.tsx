'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Flame, Menu, X, Phone, ChevronDown } from 'lucide-react';

const NAV_ITEMS = [
  {
    label: 'Locations',
    children: [
      { href: '/fireplaces-springfield-mo', label: 'Springfield' },
      { href: '/fireplaces-nixa-mo', label: 'Nixa' },
      { href: '/fireplaces-ozark-mo', label: 'Ozark' },
      { href: '/fireplaces-republic-mo', label: 'Republic' },
      { href: '/fireplaces-battlefield-mo', label: 'Battlefield' },
      { href: '/fireplaces-rogersville-mo', label: 'Rogersville' },
      { href: '/fireplaces-willard-mo', label: 'Willard' },
      { href: '/fireplaces-strafford-mo', label: 'Strafford' },
    ],
  },
  {
    label: 'Builders',
    children: [
      { href: '/builders/schuber-mitchell-homes', label: 'Schuber Mitchell' },
      { href: '/builders/cronkhite-homes', label: 'Cronkhite Homes' },
      { href: '/builders/john-marion-custom-homes', label: 'John Marion' },
      { href: '/builders/wisebuilt-homes', label: 'WiseBuilt' },
      { href: '/builders/built-by-brett', label: 'Built By Brett' },
      { href: '/builders/trendsetter-homes', label: 'Trendsetter' },
      { href: '/builders/alair-homes-springfield', label: 'Alair Homes' },
    ],
  },
  { label: 'Cost Guide', href: '/cost-guide' },
  { label: 'Blog', href: '/blog' },
  { label: 'Resources', href: '/resources' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-hearth-900 text-hearth-100 text-sm py-1.5">
        <div className="container-marketing flex justify-between items-center">
          <span>Serving Greene & Christian County, Missouri</span>
          <a
            href={`tel:${process.env.NEXT_PUBLIC_PHONE || '(417) 555-0199'}`}
            className="flex items-center gap-1 hover:text-white transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            {process.env.NEXT_PUBLIC_PHONE || '(417) 555-0199'}
          </a>
        </div>
      </div>

      {/* Main nav */}
      <nav className="container-marketing">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-hearth-600 rounded-lg flex items-center justify-center group-hover:bg-hearth-700 transition-colors">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-lg font-bold text-gray-900 leading-tight">
                Hearth & Home
              </span>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider leading-none">
                Fireplace Experts
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) =>
              item.children ? (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setOpenDropdown(item.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button className="btn-ghost flex items-center gap-1">
                    {item.label}
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  {openDropdown === item.label && (
                    <div className="absolute top-full left-0 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-2 mt-0.5">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-hearth-50 hover:text-hearth-700 transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link key={item.label} href={item.href!} className="btn-ghost">
                  {item.label}
                </Link>
              )
            )}
          </div>

          {/* CTA + mobile toggle */}
          <div className="flex items-center gap-3">
            <Link href="/contact" className="btn-primary hidden sm:inline-flex text-sm">
              Free Consultation
            </Link>
            <button
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4 space-y-2">
            {NAV_ITEMS.map((item) =>
              item.children ? (
                <div key={item.label}>
                  <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {item.label}
                  </p>
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="block px-6 py-2 text-sm text-gray-700 hover:bg-hearth-50"
                      onClick={() => setMobileOpen(false)}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  key={item.label}
                  href={item.href!}
                  className="block px-3 py-2 text-sm text-gray-700 hover:bg-hearth-50"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              )
            )}
            <div className="px-3 pt-2">
              <Link
                href="/contact"
                className="btn-primary w-full text-sm"
                onClick={() => setMobileOpen(false)}
              >
                Free Consultation
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
