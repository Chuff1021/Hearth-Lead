import type { Metadata } from 'next';
import { localBusinessSchema } from '@/lib/seo/structured-data';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'Fireplace Installation Springfield MO | New Construction Fireplaces | Hearth & Home',
    template: '%s | Hearth & Home Fireplace Co.',
  },
  description:
    'Expert fireplace installation for new homes in Southwest Missouri. Serving Springfield, Nixa, Ozark, Republic & Greene/Christian County. Gas, wood-burning & electric. Save $3,000+ by installing during construction.',
  keywords: [
    'fireplace installation Springfield MO',
    'new construction fireplace',
    'gas fireplace Springfield Missouri',
    'fireplace for new home',
    'Greene County fireplace',
    'Christian County fireplace',
    'fireplace installer near me',
    'new home fireplace cost',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Hearth & Home Fireplace Co.',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema()) }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
