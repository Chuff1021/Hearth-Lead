import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Building2, ArrowRight, Phone, MapPin, DollarSign, ExternalLink } from 'lucide-react';
import LeadForm from '@/components/LeadForm';
import { BUILDERS, getBuilderBySlug, getAllBuilderSlugs } from '@/lib/data/builders';
import { breadcrumbSchema } from '@/lib/seo/structured-data';

interface BuilderPageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  return getAllBuilderSlugs().map(slug => ({ slug }));
}

export async function generateMetadata({ params }: BuilderPageProps): Promise<Metadata> {
  const builder = getBuilderBySlug(params.slug);
  if (!builder) return {};

  return {
    title: builder.metaTitle,
    description: builder.metaDescription,
    openGraph: {
      title: builder.metaTitle,
      description: builder.metaDescription,
      type: 'article',
    },
  };
}

export default function BuilderPage({ params }: BuilderPageProps) {
  const builder = getBuilderBySlug(params.slug);
  if (!builder) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema([
            { name: 'Home', url: siteUrl },
            { name: 'Builders', url: `${siteUrl}/builders/schuber-mitchell-homes` },
            { name: builder.name, url: `${siteUrl}/builders/${builder.slug}` },
          ])),
        }}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 to-hearth-950 text-white py-16 lg:py-20">
        <div className="container-marketing">
          <div className="flex items-center gap-2 text-hearth-300 text-sm mb-4">
            <Building2 className="w-4 h-4" /> Builder Fireplace Guide
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold leading-tight">
            Building with <span className="text-hearth-400">{builder.name}</span>?
            <br />
            <span className="text-2xl sm:text-3xl text-gray-300 font-normal">
              Here Are Your Fireplace Options.
            </span>
          </h1>
          <div className="flex flex-wrap items-center gap-4 mt-6 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" /> {builder.priceRange}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" /> {builder.cities.join(', ')}
            </span>
            {builder.website && (
              <a
                href={builder.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-hearth-300 hover:text-hearth-200"
              >
                <ExternalLink className="w-4 h-4" /> Website
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container-marketing">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 prose-hearth">
              {/* Builder intro */}
              <p className="text-lg">{builder.description}</p>

              {/* Fireplace notes callout */}
              <div className="bg-hearth-50 border border-hearth-200 rounded-lg p-6 my-8">
                <h3 className="text-hearth-800 mt-0 mb-2">Fireplace Policy</h3>
                <p className="text-hearth-700 mb-0">{builder.fireplaceNotes}</p>
              </div>

              {/* Main SEO content */}
              <div dangerouslySetInnerHTML={{
                __html: builder.seoContent
                  .replace(/^## /gm, '<h2>')
                  .replace(/^### /gm, '<h3>')
                  .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                  .replace(/^- (.+)/gm, '<li>$1</li>')
                  .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
                  .replace(/\| (.+) \|/g, '<tr><td>$1</td></tr>')
                  .split('\n\n')
                  .map(block => {
                    if (block.startsWith('<h2>') || block.startsWith('<h3>') ||
                        block.startsWith('<ul>') || block.startsWith('<tr>')) {
                      return block;
                    }
                    return `<p>${block}</p>`;
                  })
                  .join('\n')
              }} />

              {/* Cross-links to city pages */}
              <h2>Service Areas for {builder.name} Homebuyers</h2>
              <p>
                We provide fireplace installation in every community where {builder.name} builds:
              </p>
              <ul>
                {builder.cities.map(city => {
                  const slug = `fireplaces-${city.toLowerCase().replace(/\s+/g, '-')}-mo`;
                  return (
                    <li key={city}>
                      <Link href={`/${slug}`}>Fireplace installation in {city}, MO</Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <LeadForm
                page={`builders/${builder.slug}`}
                cta="sidebar"
                heading={`Get a Quote for Your ${builder.name} Home`}
                description={`Free fireplace consultation — we'll coordinate with ${builder.name}.`}
              />

              <div className="card p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Builder Quick Facts</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium text-gray-700">Price Range</p>
                    <p className="text-gray-600">{builder.priceRange}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Specialties</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {builder.specialties.map(s => (
                        <span key={s} className="badge-gray text-xs">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Active Areas</p>
                    <p className="text-gray-600">{builder.cities.join(', ')}</p>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Other Builders</h3>
                <div className="space-y-2">
                  {BUILDERS.filter(b => b.slug !== builder.slug).slice(0, 5).map(b => (
                    <Link
                      key={b.slug}
                      href={`/builders/${b.slug}`}
                      className="block text-sm text-hearth-600 hover:text-hearth-700"
                    >
                      {b.name} &rarr;
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-hearth-600 py-12">
        <div className="container-marketing text-center text-white">
          <h2 className="text-2xl font-display font-bold">
            Planning Your {builder.name} Fireplace?
          </h2>
          <p className="text-hearth-100 mt-2">
            Contact us before your options meeting. Free consultation, competitive pricing.
          </p>
          <div className="flex justify-center gap-4 mt-6">
            <Link href="/contact" className="bg-white text-hearth-700 hover:bg-hearth-50 px-6 py-3 rounded-lg font-semibold transition-colors">
              Schedule Consultation
            </Link>
            <a href="tel:(417) 555-0199" className="border-2 border-white/50 text-white hover:bg-white/10 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2">
              <Phone className="w-4 h-4" /> Call Now
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
