import type { Metadata } from 'next';
import Link from 'next/link';
import { DollarSign, ArrowRight, Phone, CheckCircle } from 'lucide-react';
import LeadForm from '@/components/LeadForm';
import FAQ from '@/components/FAQ';
import { faqSchema, articleSchema } from '@/lib/seo/structured-data';

export const metadata: Metadata = {
  title: 'Fireplace Cost Guide 2025 | New Construction vs Retrofit Pricing',
  description: 'Complete fireplace installation cost guide for Southwest Missouri. Gas, wood-burning, and electric fireplace pricing for new construction. Save $3,000+ by installing during your build.',
};

const PRICING_DATA = [
  { type: 'Gas Fireplace (Direct-Vent)', newConstruction: '$2,500–$5,500', retrofit: '$5,500–$9,000', savings: '$3,000–$3,500' },
  { type: 'Gas Fireplace (Ventless)', newConstruction: '$1,800–$3,500', retrofit: '$2,500–$5,000', savings: '$700–$1,500' },
  { type: 'Linear Gas (Contemporary)', newConstruction: '$3,500–$7,500', retrofit: '$6,500–$12,000', savings: '$3,000–$4,500' },
  { type: 'Wood-Burning (Prefab)', newConstruction: '$2,200–$4,500', retrofit: '$5,000–$8,000', savings: '$2,800–$3,500' },
  { type: 'Wood-Burning (Masonry)', newConstruction: '$8,000–$20,000', retrofit: '$12,000–$30,000', savings: '$4,000–$10,000' },
  { type: 'Electric Fireplace', newConstruction: '$500–$2,500', retrofit: '$800–$3,500', savings: '$300–$1,000' },
  { type: 'See-Through / Dual-Sided', newConstruction: '$4,500–$10,000', retrofit: '$8,000–$16,000', savings: '$3,500–$6,000' },
  { type: 'Outdoor Fireplace', newConstruction: '$3,000–$12,000', retrofit: '$4,000–$15,000', savings: '$1,000–$3,000' },
];

const faqs = [
  {
    question: 'How much does a gas fireplace cost to install during new construction?',
    answer: 'A standard direct-vent gas fireplace installed during new construction in Southwest Missouri costs $2,500–$5,500 including the unit, venting, gas line, and a basic surround. Premium linear models run $3,500–$7,500. These prices include coordination with your builder\'s construction schedule.',
  },
  {
    question: 'Why is it cheaper to install a fireplace during construction?',
    answer: 'During new construction, the fireplace chase is framed as part of the normal wall framing process. The gas line is roughed in with other plumbing. The vent goes through the roof before roofing is installed. None of this requires demolition or rework. Retrofitting requires cutting into finished walls, modifying framing, and often re-doing drywall and paint—adding $3,000–$5,000+ in labor.',
  },
  {
    question: 'What does a fireplace rough-in cost?',
    answer: 'A fireplace rough-in (the framed chase, gas line, and vent pipe installed during framing, but without the actual fireplace unit) costs $800–$1,500. This is a smart option if you want to keep your options open—you can install the fireplace unit and surround later without the expensive retrofit costs.',
  },
  {
    question: 'Do gas fireplaces increase home value?',
    answer: 'Yes. The National Association of Realtors reports that fireplaces add 6–12% to a home\'s perceived value. In the Springfield MO market, a $3,500 gas fireplace installation in a $300,000 home typically adds $8,000–$15,000 in appraised value. They also help homes sell faster.',
  },
  {
    question: 'What are the annual operating costs for a gas fireplace?',
    answer: 'A gas fireplace in the Springfield area costs approximately $60–$120 per year to operate (based on 3-4 hours of use per day during heating season with local natural gas rates). This is less than the cost of using your central heating system for the same space.',
  },
];

export default function CostGuidePage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema({
            title: 'Fireplace Installation Cost Guide 2025 – Springfield MO',
            description: 'Complete pricing for gas, wood, and electric fireplaces in SW Missouri.',
            url: `${siteUrl}/cost-guide`,
            datePublished: '2025-01-15',
            dateModified: '2025-04-01',
          })),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 to-hearth-950 text-white py-16 lg:py-20">
        <div className="container-marketing">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-hearth-300 text-sm mb-4">
              <DollarSign className="w-4 h-4" /> Pricing Guide
            </div>
            <h1 className="text-4xl sm:text-5xl font-display font-bold">
              Fireplace Cost Guide: <span className="text-hearth-400">New Construction vs Retrofit</span>
            </h1>
            <p className="text-lg text-gray-300 mt-6">
              See exactly what a fireplace costs in Southwest Missouri — gas, wood-burning, electric,
              and outdoor options. Plus why installing during construction saves you thousands.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Table */}
      <section className="py-16">
        <div className="container-marketing">
          <h2 className="text-3xl font-display font-bold text-gray-900 mb-8 text-center">
            2025 Fireplace Installation Pricing
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-hearth-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Fireplace Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">New Construction</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Retrofit</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">You Save</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {PRICING_DATA.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.type}</td>
                    <td className="px-6 py-4 text-sm text-green-700 font-semibold">{row.newConstruction}</td>
                    <td className="px-6 py-4 text-sm text-red-700">{row.retrofit}</td>
                    <td className="px-6 py-4 text-sm text-hearth-600 font-semibold">{row.savings}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-4 text-center">
            * Prices reflect Springfield, MO metro area averages as of 2025. Actual costs vary by product selection and home specifications.
          </p>
        </div>
      </section>

      {/* Content Sections */}
      <section className="bg-gray-50 py-16">
        <div className="container-marketing">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 prose-hearth">
              <h2>What Determines Fireplace Installation Cost?</h2>
              <p>
                Several factors affect your final price. Understanding these helps you budget
                accurately and avoid surprises.
              </p>
              <h3>1. Fireplace Unit Cost</h3>
              <p>
                The fireplace itself ranges from $300 for a basic electric insert to $5,000+
                for a premium linear gas unit. We carry all major brands and can match any
                budget. Gas direct-vent units in the $1,500–$3,000 range offer the best
                balance of quality, efficiency, and aesthetics.
              </p>
              <h3>2. Venting & Gas Line</h3>
              <p>
                Gas fireplaces require a vent pipe through the roof or wall ($300–$800) and
                a gas line run from the meter ($200–$600). During new construction, these
                are installed as part of the normal plumbing and framing phases at minimal
                marginal cost.
              </p>
              <h3>3. Fireplace Chase Framing</h3>
              <p>
                The chase is the framed box in the wall that houses the fireplace. During
                new construction, it&apos;s built with the rest of the walls. Retrofitting
                requires demolishing existing wall sections and rebuilding—the single
                biggest cost difference between new construction and retrofit.
              </p>
              <h3>4. Surround & Finish</h3>
              <p>
                The surround (stone, tile, brick, or mantel) ranges from $500 for basic
                tile to $5,000+ for custom stonework. This cost is similar whether you&apos;re
                building new or retrofitting, so it&apos;s not where the savings come from.
              </p>

              <h2>The Rough-In Strategy</h2>
              <p>
                Not sure if you want a fireplace? Ask your builder for a <strong>fireplace rough-in</strong>.
                For $800–$1,500, they&apos;ll frame the chase, run the gas line, and install
                the vent pipe. You can add the actual fireplace unit and surround anytime
                later without the expensive retrofit costs. This is the smartest move for
                budget-conscious builders who want to keep their options open.
              </p>

              <h2>Return on Investment</h2>
              <p>
                Fireplaces consistently rank among the top home features for buyer appeal.
                In the Springfield area:
              </p>
              <ul>
                <li>Homes with fireplaces sell for <strong>6–12% more</strong> than comparable homes without</li>
                <li><strong>83% of Midwest homebuyers</strong> say a fireplace is desirable or essential</li>
                <li>A $3,500 gas fireplace in a $300K home adds <strong>$8,000–$15,000 in value</strong></li>
                <li>Homes with fireplaces sell <strong>faster</strong> on average</li>
              </ul>
            </div>

            <div className="space-y-6">
              <LeadForm
                page="cost-guide"
                cta="sidebar"
                heading="Get an Exact Quote"
                description="Send us your floor plan and we'll provide detailed pricing for your specific project."
              />

              <div className="card p-6 bg-green-50 border-green-200">
                <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" /> Cost-Saving Tips
                </h3>
                <ul className="space-y-2 text-sm text-green-700">
                  <li>Request a rough-in even if you&apos;re not sure about the fireplace</li>
                  <li>Compare builder pricing to independent dealer pricing</li>
                  <li>Choose direct-vent gas for the best value</li>
                  <li>Consider a simple surround now, upgrade later</li>
                  <li>Ask about second-fireplace discounts for multi-unit installs</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="container-marketing max-w-3xl">
          <FAQ items={faqs} />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-hearth-600 py-12">
        <div className="container-marketing text-center text-white">
          <h2 className="text-2xl font-display font-bold">
            Get Your Exact Price Today
          </h2>
          <p className="text-hearth-100 mt-2">Free estimate — no obligation.</p>
          <div className="flex justify-center gap-4 mt-6">
            <Link href="/contact" className="bg-white text-hearth-700 hover:bg-hearth-50 px-6 py-3 rounded-lg font-semibold transition-colors">
              Request Quote
            </Link>
            <a href="tel:(417) 555-0199" className="border-2 border-white/50 text-white hover:bg-white/10 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2">
              <Phone className="w-4 h-4" /> (417) 555-0199
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
