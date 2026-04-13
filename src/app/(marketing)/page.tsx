import Link from 'next/link';
import { Flame, Shield, Clock, DollarSign, ArrowRight, Phone, CheckCircle, MapPin, Star } from 'lucide-react';
import LeadForm from '@/components/LeadForm';
import CityCard from '@/components/CityCard';
import BuilderCard from '@/components/BuilderCard';
import { PublicPermitStats } from '@/components/PermitStats';
import { CITIES } from '@/lib/data/cities';
import { BUILDERS } from '@/lib/data/builders';

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-hearth-950 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        <div className="container-marketing relative py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-hearth-600/20 border border-hearth-500/30 rounded-full px-4 py-1.5 text-sm text-hearth-300 mb-6">
                <Flame className="w-4 h-4" />
                Serving Greene & Christian County
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold leading-tight">
                Building a New Home?{' '}
                <span className="text-hearth-400">Plan Your Fireplace Now.</span>
              </h1>
              <p className="text-lg text-gray-300 mt-6 max-w-xl">
                Install your fireplace during construction and save <strong className="text-white">$3,000–$5,000</strong> compared
                to retrofitting later. We work with every major builder in Southwest Missouri.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Link href="/contact" className="btn-primary text-lg px-8 py-4">
                  Free Consultation
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <a
                  href="tel:(417) 555-0199"
                  className="btn-secondary border-white/30 text-white hover:bg-white/10 text-lg px-8 py-4"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  (417) 555-0199
                </a>
              </div>
              <div className="flex items-center gap-6 mt-8 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-400" /> Free estimates
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-400" /> Licensed & insured
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-400" /> All fuel types
                </span>
              </div>
            </div>

            <div className="hidden lg:block">
              <LeadForm
                page="home"
                cta="hero"
                className="max-w-md ml-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="bg-hearth-50 border-b border-hearth-100 py-6">
        <div className="container-marketing">
          <div className="flex flex-wrap justify-center gap-8 items-center text-sm text-gray-600">
            <span className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" /> 5-Star Rated
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-hearth-600" /> 10+ Years Experience
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-hearth-600" /> Locally Owned
            </span>
            <span className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-hearth-600" /> 500+ Fireplaces Installed
            </span>
          </div>
        </div>
      </section>

      {/* Why Install During Construction */}
      <section className="py-20">
        <div className="container-marketing">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900">
              Why Install Your Fireplace During Construction?
            </h2>
            <p className="text-lg text-gray-600 mt-4">
              The framing stage is your window. Once drywall goes up, adding a fireplace
              costs thousands more in demolition and rework.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card p-8 text-center">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <DollarSign className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Save $3,000–$5,000</h3>
              <p className="text-gray-600">
                No demolition, no rework. The fireplace chase, gas line, and venting
                are built into the framing schedule at no extra labor cost.
              </p>
            </div>
            <div className="card p-8 text-center">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Clock className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Perfect Timing</h3>
              <p className="text-gray-600">
                We coordinate directly with your builder. The fireplace is installed
                during the right construction phase for a flawless result.
              </p>
            </div>
            <div className="card p-8 text-center">
              <div className="w-14 h-14 bg-hearth-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Shield className="w-7 h-7 text-hearth-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">More Options</h3>
              <p className="text-gray-600">
                During construction, you can install any fireplace type — gas, wood-burning,
                multi-sided, outdoor. After? Your options shrink dramatically.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Local Market Data */}
      <section className="bg-gray-50 py-20">
        <div className="container-marketing">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900">
              New Construction Is Booming in SW Missouri
            </h2>
            <p className="text-lg text-gray-600 mt-4">
              Greene and Christian County are among the fastest-growing areas in Missouri.
              Hundreds of new homes are being built every year.
            </p>
          </div>
          <PublicPermitStats
            totalPermitsThisYear={847}
            monthlyAverage={71}
            yearOverYearChange={8.3}
          />
        </div>
      </section>

      {/* Service Areas */}
      <section className="py-20">
        <div className="container-marketing">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900">
              Fireplace Installation Across SW Missouri
            </h2>
            <p className="text-lg text-gray-600 mt-4">
              We serve every city in Greene and Christian County. Click your area for
              local pricing, popular styles, and building code information.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CITIES.slice(0, 6).map(city => (
              <CityCard
                key={city.slug}
                slug={city.slug}
                name={city.name}
                county={city.county}
                description={city.description}
                avgCost={city.avgFireplaceCost}
                popularStyles={city.popularStyles}
              />
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/fireplaces-willard-mo" className="text-hearth-600 hover:text-hearth-700 text-sm font-medium">
              View all service areas &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Builder Partners */}
      <section className="bg-gray-50 py-20">
        <div className="container-marketing">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900">
              Working With a Builder? We Know Them.
            </h2>
            <p className="text-lg text-gray-600 mt-4">
              We&apos;ve worked with every major builder in the area. Select your builder
              below for specific fireplace recommendations and timing advice.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {BUILDERS.slice(0, 4).map(builder => (
              <BuilderCard
                key={builder.slug}
                slug={builder.slug}
                name={builder.name}
                priceRange={builder.priceRange}
                cities={builder.cities}
                specialties={builder.specialties}
                description={builder.description}
              />
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/builders/wisebuilt-homes" className="text-hearth-600 hover:text-hearth-700 text-sm font-medium">
              View all builders &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Cost Comparison CTA */}
      <section className="py-20">
        <div className="container-marketing">
          <div className="bg-gradient-to-br from-hearth-600 to-hearth-800 rounded-2xl p-8 sm:p-12 text-white text-center">
            <h2 className="text-3xl sm:text-4xl font-display font-bold">
              New Construction vs. Retrofit: The Numbers
            </h2>
            <p className="text-hearth-100 text-lg mt-4 max-w-2xl mx-auto">
              The average fireplace installation during new construction costs $2,500–$6,500.
              The same fireplace installed after construction? $5,500–$12,000.
            </p>
            <div className="grid sm:grid-cols-2 gap-6 max-w-lg mx-auto mt-8">
              <div className="bg-white/10 rounded-xl p-6">
                <p className="text-3xl font-bold">$2,500–$6,500</p>
                <p className="text-hearth-200 text-sm mt-1">During Construction</p>
              </div>
              <div className="bg-white/10 rounded-xl p-6">
                <p className="text-3xl font-bold">$5,500–$12,000</p>
                <p className="text-hearth-200 text-sm mt-1">Retrofit After</p>
              </div>
            </div>
            <div className="mt-8">
              <Link href="/cost-guide" className="bg-white text-hearth-700 hover:bg-hearth-50 px-8 py-4 rounded-lg font-semibold inline-flex items-center gap-2 transition-colors">
                View Full Cost Guide <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Lead Form (shown below hero on mobile) */}
      <section className="lg:hidden py-12 bg-gray-50">
        <div className="container-marketing">
          <LeadForm page="home" cta="mobile-bottom" />
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-gray-900 py-16">
        <div className="container-marketing text-center">
          <h2 className="text-3xl font-display font-bold text-white mb-4">
            Don&apos;t Wait Until Drywall
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto mb-8">
            Contact us today for a free consultation. We&apos;ll review your floor plan and
            recommend the perfect fireplace before it&apos;s too late.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="btn-primary text-lg px-8 py-4">
              Schedule Consultation
            </Link>
            <a href="tel:(417) 555-0199" className="btn-secondary border-white/30 text-white hover:bg-white/10 text-lg px-8 py-4">
              <Phone className="w-5 h-5 mr-2" />
              Call Now
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
