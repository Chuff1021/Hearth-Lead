import Link from 'next/link';
import { Flame, Phone, Mail, MapPin } from 'lucide-react';

const LOCATION_LINKS = [
  { href: '/fireplaces-springfield-mo', label: 'Springfield, MO' },
  { href: '/fireplaces-nixa-mo', label: 'Nixa, MO' },
  { href: '/fireplaces-ozark-mo', label: 'Ozark, MO' },
  { href: '/fireplaces-republic-mo', label: 'Republic, MO' },
  { href: '/fireplaces-battlefield-mo', label: 'Battlefield, MO' },
  { href: '/fireplaces-rogersville-mo', label: 'Rogersville, MO' },
  { href: '/fireplaces-willard-mo', label: 'Willard, MO' },
  { href: '/fireplaces-strafford-mo', label: 'Strafford, MO' },
];

const RESOURCE_LINKS = [
  { href: '/cost-guide', label: 'Fireplace Cost Guide' },
  { href: '/compare/gas-vs-wood-vs-electric', label: 'Gas vs Wood vs Electric' },
  { href: '/compare/ventless-vs-direct-vent', label: 'Ventless vs Direct Vent' },
  { href: '/resources', label: 'New Home Checklist' },
  { href: '/blog', label: 'Blog & Guides' },
  { href: '/contact', label: 'Get a Free Quote' },
];

const BUILDER_LINKS = [
  { href: '/builders/schuber-mitchell-homes', label: 'Schuber Mitchell Homes' },
  { href: '/builders/cronkhite-homes', label: 'Cronkhite Homes' },
  { href: '/builders/john-marion-custom-homes', label: 'John Marion Custom' },
  { href: '/builders/wisebuilt-homes', label: 'WiseBuilt' },
  { href: '/builders/trendsetter-homes', label: 'Trendsetter Homes' },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container-marketing py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-hearth-600 rounded-lg flex items-center justify-center">
                <Flame className="w-4 h-4 text-white" />
              </div>
              <span className="font-display text-lg font-bold text-white">
                Hearth & Home
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-6">
              Southwest Missouri&apos;s trusted fireplace experts. Specializing in
              new construction fireplace installation for Greene and Christian County.
            </p>
            <div className="space-y-2 text-sm">
              <a href="tel:(417) 555-0199" className="flex items-center gap-2 hover:text-hearth-400 transition-colors">
                <Phone className="w-4 h-4" /> (417) 555-0199
              </a>
              <a href="mailto:info@hearthandhomemo.com" className="flex items-center gap-2 hover:text-hearth-400 transition-colors">
                <Mail className="w-4 h-4" /> info@hearthandhomemo.com
              </a>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Springfield, MO 65803
              </div>
            </div>
          </div>

          {/* Service Areas */}
          <div>
            <h3 className="text-white font-semibold mb-4">Service Areas</h3>
            <ul className="space-y-2 text-sm">
              {LOCATION_LINKS.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-hearth-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Builder Partners */}
          <div>
            <h3 className="text-white font-semibold mb-4">Builder Resources</h3>
            <ul className="space-y-2 text-sm">
              {BUILDER_LINKS.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-hearth-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              {RESOURCE_LINKS.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-hearth-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="container-marketing py-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} Hearth & Home Fireplace Co. All rights reserved.</p>
          <p>
            Serving Springfield, Nixa, Ozark, Republic & all of Southwest Missouri
          </p>
        </div>
      </div>
    </footer>
  );
}
