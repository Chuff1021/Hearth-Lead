import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle, XCircle, Phone } from 'lucide-react';
import LeadForm from '@/components/LeadForm';
import { getComparisonBySlug, getAllComparisonSlugs, COMPARISONS } from '@/lib/data/comparisons';

interface ComparePageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  return getAllComparisonSlugs().map(slug => ({ slug }));
}

export async function generateMetadata({ params }: ComparePageProps): Promise<Metadata> {
  const comparison = getComparisonBySlug(params.slug);
  if (!comparison) return {};

  return {
    title: comparison.metaTitle,
    description: comparison.metaDescription,
  };
}

function OptionCard({ option }: { option: { name: string; pros: string[]; cons: string[]; bestFor: string; cost: string } }) {
  return (
    <div className="card p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">{option.name}</h3>

      <div className="mb-4">
        <p className="text-sm font-semibold text-green-700 mb-2">Advantages</p>
        <ul className="space-y-1.5">
          {option.pros.map(pro => (
            <li key={pro} className="flex items-start gap-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
              {pro}
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-4">
        <p className="text-sm font-semibold text-red-700 mb-2">Disadvantages</p>
        <ul className="space-y-1.5">
          {option.cons.map(con => (
            <li key={con} className="flex items-start gap-2 text-sm text-gray-600">
              <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              {con}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mt-4">
        <p className="text-sm font-semibold text-gray-700">Best For</p>
        <p className="text-sm text-gray-600 mt-1">{option.bestFor}</p>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-500">Typical Cost</p>
        <p className="text-lg font-bold text-hearth-600">{option.cost}</p>
      </div>
    </div>
  );
}

export default function ComparePage({ params }: ComparePageProps) {
  const comparison = getComparisonBySlug(params.slug);
  if (!comparison) notFound();

  const options = [comparison.optionA, comparison.optionB];
  if (comparison.optionC) options.push(comparison.optionC);

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 to-hearth-950 text-white py-16 lg:py-20">
        <div className="container-marketing max-w-4xl">
          <p className="text-hearth-300 text-sm mb-4">Comparison Guide</p>
          <h1 className="text-3xl sm:text-4xl font-display font-bold">{comparison.title}</h1>
          <p className="text-lg text-gray-300 mt-6">{comparison.intro}</p>
        </div>
      </section>

      {/* Comparison Cards */}
      <section className="py-16">
        <div className="container-marketing">
          <div className={`grid md:grid-cols-${options.length} gap-6`}>
            {options.map(option => (
              <OptionCard key={option.name} option={option} />
            ))}
          </div>
        </div>
      </section>

      {/* Verdict + Local Angle */}
      <section className="bg-gray-50 py-16">
        <div className="container-marketing">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-hearth-50 border border-hearth-200 rounded-xl p-8 mb-8">
                <h2 className="text-2xl font-bold text-hearth-800 mb-4">Our Verdict</h2>
                <p className="text-hearth-700 leading-relaxed">{comparison.verdict}</p>
              </div>

              <div className="prose-hearth">
                <h2>Local Considerations for Southwest Missouri</h2>
                <p>{comparison.localAngle}</p>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">More Comparisons</h3>
                <div className="space-y-2">
                  {COMPARISONS.filter(c => c.slug !== comparison.slug).map(c => (
                    <Link
                      key={c.slug}
                      href={`/compare/${c.slug}`}
                      className="flex items-center gap-2 text-hearth-600 hover:text-hearth-700 text-sm"
                    >
                      <ArrowRight className="w-4 h-4" /> {c.title.split(':')[0]}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <LeadForm
                page={`compare/${comparison.slug}`}
                cta="sidebar"
                heading="Not Sure Which to Choose?"
                description="We'll recommend the right fireplace type for your specific situation. Free consultation."
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-hearth-600 py-12">
        <div className="container-marketing text-center text-white">
          <h2 className="text-2xl font-display font-bold">Still Deciding?</h2>
          <p className="text-hearth-100 mt-2">We&apos;ll help you choose. Free consultation, no pressure.</p>
          <div className="flex justify-center gap-4 mt-6">
            <Link href="/contact" className="bg-white text-hearth-700 hover:bg-hearth-50 px-6 py-3 rounded-lg font-semibold transition-colors">
              Get Expert Advice
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
