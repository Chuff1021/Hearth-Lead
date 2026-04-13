import type { Metadata } from 'next';
import Link from 'next/link';
import { FileText, Download, ArrowRight, CheckSquare, HelpCircle, BookOpen, Ruler } from 'lucide-react';
import LeadForm from '@/components/LeadForm';

export const metadata: Metadata = {
  title: 'New Home Fireplace Resources & Checklists',
  description: 'Free resources for planning your new home fireplace. Checklists, builder discussion guides, rough-in specifications, and more. Download now.',
};

const RESOURCES = [
  {
    icon: <CheckSquare className="w-6 h-6" />,
    title: 'New Home Fireplace Planning Checklist',
    description: 'A step-by-step checklist of every decision you need to make about your fireplace, from fuel type to surround material. Print it and bring it to your builder meeting.',
    items: [
      'Choose fuel type (gas, wood, electric)',
      'Decide on placement (which room, which wall)',
      'Select venting type (direct-vent, B-vent, ventless)',
      'Pick a style (traditional, linear, see-through)',
      'Choose surround material (stone, tile, brick, wood)',
      'Decide on mantel style and material',
      'Confirm rough-in dimensions with builder',
      'Schedule gas line and electrical rough-in',
      'Select fireplace unit and place order',
      'Coordinate installation with construction schedule',
      'Schedule final inspection',
    ],
  },
  {
    icon: <HelpCircle className="w-6 h-6" />,
    title: 'Questions to Ask Your Builder About Fireplaces',
    description: 'Don\'t get caught off guard at your builder meeting. These are the questions that will help you make the best fireplace decisions.',
    items: [
      'Is a fireplace included in the base price or is it an upgrade?',
      'What is the cost for a fireplace rough-in only (without the unit)?',
      'Which fireplace brands/suppliers do you work with?',
      'Can I source my own fireplace unit from an independent dealer?',
      'What are the surround/mantel upgrade options and costs?',
      'When is the last possible date to add a fireplace to my plan?',
      'Will the fireplace be inspected as part of the mechanical inspection?',
      'Can the floor plan accommodate a see-through or multi-sided unit?',
      'What is the additional cost for a second fireplace (basement/bedroom)?',
      'Do you install outdoor fireplaces as part of the home build?',
    ],
  },
  {
    icon: <Ruler className="w-6 h-6" />,
    title: 'Fireplace Rough-In Specifications',
    description: 'Technical specifications your builder needs for fireplace framing. Share this with your contractor to ensure the rough-in is done correctly.',
    items: [
      'Standard gas fireplace chase: 48"W x 20"D x ceiling height',
      'Linear (42-60") fireplace chase: 56-72"W x 18"D x ceiling height',
      'Minimum combustible clearance: per manufacturer specs (typically 0" for zero-clearance)',
      'Gas line: 1/2" black iron or CSST to fireplace location, capped and pressure-tested',
      'Electrical: 120V outlet inside chase for fan/ignition, switched outlet for optional blower',
      'Vent pipe: Direct-vent co-axial through roof or rear wall per manufacturer routing',
      'Header: minimum double 2x10 for openings over 4 feet',
      'Firestop: required at all floor/ceiling penetrations',
      'Non-combustible hearth: required for wood-burning, optional for gas',
      'Always confirm exact dimensions with manufacturer installation manual',
    ],
  },
];

export default function ResourcesPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-gray-900 to-hearth-950 text-white py-16 lg:py-20">
        <div className="container-marketing">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-hearth-300 text-sm mb-4">
              <BookOpen className="w-4 h-4" /> Free Resources
            </div>
            <h1 className="text-4xl sm:text-5xl font-display font-bold">
              New Home Fireplace <span className="text-hearth-400">Resources</span>
            </h1>
            <p className="text-lg text-gray-300 mt-6">
              Free checklists, guides, and specifications to help you plan the perfect
              fireplace for your new home. No signup required.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-marketing">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-10">
              {RESOURCES.map((resource) => (
                <div key={resource.title} className="card p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-hearth-100 rounded-xl flex items-center justify-center text-hearth-600 flex-shrink-0">
                      {resource.icon}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{resource.title}</h2>
                      <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                    </div>
                  </div>
                  <ol className="space-y-2">
                    {resource.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                        <span className="w-5 h-5 bg-gray-100 text-gray-500 rounded flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        {item}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}

              <div className="prose-hearth">
                <h2>Related Guides</h2>
                <ul>
                  <li><Link href="/cost-guide">Complete Fireplace Cost Guide</Link></li>
                  <li><Link href="/compare/gas-vs-wood-vs-electric">Gas vs Wood vs Electric Comparison</Link></li>
                  <li><Link href="/compare/ventless-vs-direct-vent">Ventless vs Direct-Vent Guide</Link></li>
                  <li><Link href="/blog">All Blog Posts & Articles</Link></li>
                </ul>
              </div>
            </div>

            <div className="space-y-6">
              <LeadForm
                page="resources"
                cta="sidebar"
                formType="checklist"
                heading="Want Personalized Recommendations?"
                description="Tell us about your project and we'll create a custom fireplace plan."
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
