import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, ArrowRight, Phone, CheckCircle, Home, BookOpen } from 'lucide-react';
import LeadForm from '@/components/LeadForm';
import FAQ from '@/components/FAQ';
import { CITIES, getCityBySlug, getAllCitySlugs } from '@/lib/data/cities';
import { BUILDERS } from '@/lib/data/builders';
import { serviceSchema, faqSchema, breadcrumbSchema } from '@/lib/seo/structured-data';

interface CityPageProps {
  params: { city: string };
}

export async function generateStaticParams() {
  return getAllCitySlugs().map(slug => ({ city: slug }));
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const city = getCityBySlug(params.city);
  if (!city) return {};

  return {
    title: city.metaTitle,
    description: city.metaDescription,
    openGraph: {
      title: city.metaTitle,
      description: city.metaDescription,
      type: 'website',
    },
  };
}

export default function CityPage({ params }: CityPageProps) {
  const city = getCityBySlug(params.city);
  if (!city) notFound();

  const localBuilders = BUILDERS.filter(b =>
    b.cities.some(c => c.toLowerCase() === city.name.toLowerCase())
  );

  const faqs = [
    {
      question: `How much does a fireplace cost in ${city.name}, MO?`,
      answer: `For new construction in ${city.name}, a gas fireplace installation typically costs ${city.avgFireplaceCost}. This includes the unit, venting, gas line, and basic surround. Retrofitting after construction adds $3,000–$5,000 to these costs.`,
    },
    {
      question: `What building permits do I need for a fireplace in ${city.name}?`,
      answer: `${city.buildingCodeNotes} Your builder typically handles the permit process. If you're working with an independent fireplace installer, we handle all permit requirements as part of our service.`,
    },
    {
      question: `What's the most popular fireplace type in ${city.name}?`,
      answer: `The most popular styles in ${city.name} are: ${city.popularStyles.join(', ')}. Gas fireplaces are the most common choice for new construction due to convenience and efficiency.`,
    },
    {
      question: `When should I decide on a fireplace during construction?`,
      answer: `Ideally, choose your fireplace before framing begins. The fireplace chase, gas line, and venting must be integrated during the framing phase. Once drywall is up, adding a fireplace requires demolition and costs significantly more.`,
    },
    {
      question: `Do you work with builders in ${city.name}?`,
      answer: `Yes! We work with all major builders in ${city.name} including ${localBuilders.map(b => b.name).join(', ') || 'local builders'}. We coordinate directly with your builder's construction schedule for seamless installation.`,
    },
  ];

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(serviceSchema({
            name: `Fireplace Installation in ${city.name}, MO`,
            description: city.metaDescription,
            url: `${siteUrl}/${city.slug}`,
            priceRange: city.avgFireplaceCost,
          })),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema([
            { name: 'Home', url: siteUrl },
            { name: `${city.name}, MO`, url: `${siteUrl}/${city.slug}` },
          ])),
        }}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 to-hearth-950 text-white py-16 lg:py-24">
        <div className="container-marketing">
          <div className="flex items-center gap-2 text-hearth-300 text-sm mb-4">
            <MapPin className="w-4 h-4" /> {city.county} County, Missouri
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-bold leading-tight">
            Fireplace Installation in{' '}
            <span className="text-hearth-400">{city.name}, MO</span>
          </h1>
          <p className="text-lg text-gray-300 mt-6 max-w-2xl">
            {city.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Link href="/contact" className="btn-primary text-lg">
              Get Free Quote <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <a href="tel:(417) 555-0199" className="btn-secondary border-white/30 text-white hover:bg-white/10">
              <Phone className="w-5 h-5 mr-2" /> (417) 555-0199
            </a>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container-marketing">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Content */}
            <div className="lg:col-span-2 prose-hearth">
              <h2>Fireplaces for New Homes in {city.name}</h2>
              <div dangerouslySetInnerHTML={{
                __html: city.fireplaceContent.split('\n\n').map(p => `<p>${p}</p>`).join('')
              }} />

              <h2>Popular Fireplace Styles in {city.name}</h2>
              <ul>
                {city.popularStyles.map(style => (
                  <li key={style}>{style}</li>
                ))}
              </ul>

              <h2>New Construction Pricing</h2>
              <p>
                Average fireplace installation cost for new construction in {city.name}: <strong>{city.avgFireplaceCost}</strong>.
                This includes the fireplace unit, venting, gas line rough-in, and a standard surround.
              </p>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6 my-8">
                <h3 className="text-green-800 mt-0">Save Money: Install During Construction</h3>
                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="font-semibold text-green-700 mb-1">During Construction</p>
                    <p className="text-2xl font-bold text-green-800">{city.avgFireplaceCost}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-red-700 mb-1">Retrofit After</p>
                    <p className="text-2xl font-bold text-red-800">$5,500–$12,000</p>
                  </div>
                </div>
              </div>

              <h2>Building Codes in {city.name}</h2>
              <p>{city.buildingCodeNotes}</p>

              {city.nearbySubdivisions.length > 0 && (
                <>
                  <h2>Active Subdivisions in {city.name}</h2>
                  <p>New homes are being built in these {city.name} communities:</p>
                  <ul>
                    {city.nearbySubdivisions.map(sub => (
                      <li key={sub}>{sub}</li>
                    ))}
                  </ul>
                </>
              )}

              {localBuilders.length > 0 && (
                <>
                  <h2>Builders Active in {city.name}</h2>
                  <p>We work with these builders in the {city.name} area:</p>
                  <ul>
                    {localBuilders.map(builder => (
                      <li key={builder.slug}>
                        <Link href={`/builders/${builder.slug}`}>{builder.name}</Link> — {builder.priceRange}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <LeadForm
                page={city.slug}
                cta="sidebar"
                heading={`Get a Quote for ${city.name}`}
                description={`Free fireplace consultation for your new home in ${city.name}, MO.`}
              />

              <div className="card p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Quick Facts</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <Home className="w-4 h-4 text-hearth-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Average Cost</p>
                      <p className="text-gray-600">{city.avgFireplaceCost}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-hearth-600 mt-0.5" />
                    <div>
                      <p className="font-medium">County</p>
                      <p className="text-gray-600">{city.county} County</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <BookOpen className="w-4 h-4 text-hearth-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Building Codes</p>
                      <p className="text-gray-600">{city.buildingCodeNotes.split('.')[0]}.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Related Guides</h3>
                <div className="space-y-2">
                  <Link href="/cost-guide" className="block text-sm text-hearth-600 hover:text-hearth-700">
                    Fireplace Cost Guide &rarr;
                  </Link>
                  <Link href="/compare/gas-vs-wood-vs-electric" className="block text-sm text-hearth-600 hover:text-hearth-700">
                    Gas vs Wood vs Electric &rarr;
                  </Link>
                  <Link href="/resources" className="block text-sm text-hearth-600 hover:text-hearth-700">
                    New Home Checklist &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gray-50 py-16">
        <div className="container-marketing max-w-3xl">
          <FAQ items={faqs} title={`Fireplace FAQs for ${city.name}, MO`} />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-hearth-600 py-12">
        <div className="container-marketing text-center text-white">
          <h2 className="text-2xl font-display font-bold">
            Ready to Plan Your Fireplace in {city.name}?
          </h2>
          <p className="text-hearth-100 mt-2">Free consultation, no obligation.</p>
          <div className="flex justify-center gap-4 mt-6">
            <Link href="/contact" className="bg-white text-hearth-700 hover:bg-hearth-50 px-6 py-3 rounded-lg font-semibold transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
