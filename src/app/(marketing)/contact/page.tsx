import type { Metadata } from 'next';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import LeadForm from '@/components/LeadForm';

export const metadata: Metadata = {
  title: 'Contact Us | Free Fireplace Consultation',
  description: 'Schedule a free fireplace consultation for your new home in Springfield MO. Call (417) 555-0199 or fill out our form. Expert advice, no obligation.',
};

export default function ContactPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-gray-900 to-hearth-950 text-white py-16">
        <div className="container-marketing text-center">
          <h1 className="text-4xl sm:text-5xl font-display font-bold">
            Get Your <span className="text-hearth-400">Free Consultation</span>
          </h1>
          <p className="text-lg text-gray-300 mt-4 max-w-2xl mx-auto">
            Tell us about your new home and we&apos;ll recommend the perfect fireplace.
            No obligation, no pressure — just expert advice.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container-marketing">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <LeadForm
                page="contact"
                cta="main-form"
                formType="consultation"
                heading="Schedule Your Free Consultation"
                description="Fill out the form below and we'll contact you within 24 hours."
              />
            </div>

            <div className="space-y-6">
              <div className="card p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <a href="tel:(417) 555-0199" className="flex items-start gap-3 text-gray-600 hover:text-hearth-600 transition-colors">
                    <Phone className="w-5 h-5 mt-0.5 text-hearth-600" />
                    <div>
                      <p className="font-medium text-gray-900">(417) 555-0199</p>
                      <p className="text-sm">Call or text anytime</p>
                    </div>
                  </a>
                  <a href="mailto:info@hearthandhomemo.com" className="flex items-start gap-3 text-gray-600 hover:text-hearth-600 transition-colors">
                    <Mail className="w-5 h-5 mt-0.5 text-hearth-600" />
                    <div>
                      <p className="font-medium text-gray-900">info@hearthandhomemo.com</p>
                      <p className="text-sm">We respond within 24 hours</p>
                    </div>
                  </a>
                  <div className="flex items-start gap-3 text-gray-600">
                    <MapPin className="w-5 h-5 mt-0.5 text-hearth-600" />
                    <div>
                      <p className="font-medium text-gray-900">Springfield, MO 65803</p>
                      <p className="text-sm">Serving all of SW Missouri</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-gray-600">
                    <Clock className="w-5 h-5 mt-0.5 text-hearth-600" />
                    <div>
                      <p className="font-medium text-gray-900">Business Hours</p>
                      <p className="text-sm">Mon–Fri: 8am–5pm</p>
                      <p className="text-sm">Sat: 9am–2pm</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card p-6 bg-hearth-50 border-hearth-200">
                <h3 className="font-semibold text-hearth-800 mb-3">What to Expect</h3>
                <ol className="space-y-3 text-sm text-hearth-700">
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 bg-hearth-600 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">1</span>
                    We&apos;ll call to discuss your project
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 bg-hearth-600 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">2</span>
                    Review your floor plan and recommend options
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 bg-hearth-600 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">3</span>
                    Provide a detailed, no-obligation quote
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 bg-hearth-600 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">4</span>
                    Coordinate with your builder when you&apos;re ready
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
