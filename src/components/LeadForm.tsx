'use client';

import { useState } from 'react';
import { Send, CheckCircle, Loader2 } from 'lucide-react';

interface LeadFormProps {
  page: string;
  cta?: string;
  formType?: 'contact' | 'quiz' | 'consultation' | 'checklist';
  heading?: string;
  description?: string;
  compact?: boolean;
  className?: string;
}

export default function LeadForm({
  page,
  cta = 'hero',
  formType = 'consultation',
  heading = 'Get Your Free Fireplace Consultation',
  description = 'Tell us about your new home and we\'ll recommend the perfect fireplace.',
  compact = false,
  className = '',
}: LeadFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      message: formData.get('message'),
      builder: formData.get('builder'),
      timeline: formData.get('timeline'),
      page,
      cta,
      formType,
    };

    try {
      const res = await fetch('/api/lead-capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Failed to submit');
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please call us directly.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Thank You!</h3>
        <p className="text-gray-600">
          We&apos;ll be in touch within 24 hours. For immediate assistance,
          call <a href="tel:(417) 555-0199" className="text-hearth-600 font-semibold">(417) 555-0199</a>.
        </p>
      </div>
    );
  }

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className={`flex flex-col sm:flex-row gap-3 ${className}`}>
        <input
          name="firstName"
          type="text"
          placeholder="Your name"
          required
          className="input-field flex-1"
        />
        <input
          name="email"
          type="email"
          placeholder="Email address"
          required
          className="input-field flex-1"
        />
        <input name="lastName" type="hidden" value="" />
        <button type="submit" disabled={loading} className="btn-primary whitespace-nowrap">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          <span className="ml-2">Get Free Quote</span>
        </button>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </form>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8 ${className}`}>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{heading}</h3>
      <p className="text-gray-600 text-sm mb-6">{description}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              className="input-field"
              placeholder="John"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              className="input-field"
              placeholder="Smith"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="input-field"
              placeholder="john@example.com"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              className="input-field"
              placeholder="(417) 555-1234"
            />
          </div>
        </div>

        <div>
          <label htmlFor="builder" className="block text-sm font-medium text-gray-700 mb-1">
            Who is your builder?
          </label>
          <select id="builder" name="builder" className="input-field">
            <option value="">Select a builder (optional)</option>
            <option value="schuber-mitchell">Schuber Mitchell Homes</option>
            <option value="cronkhite">Cronkhite Homes</option>
            <option value="john-marion">John Marion Custom Homes</option>
            <option value="wisebuilt">WiseBuilt</option>
            <option value="built-by-brett">Built By Brett</option>
            <option value="trendsetter">Trendsetter Homes</option>
            <option value="alair">Alair Homes</option>
            <option value="other">Other</option>
            <option value="not-sure">Not sure yet</option>
          </select>
        </div>

        <div>
          <label htmlFor="timeline" className="block text-sm font-medium text-gray-700 mb-1">
            Where are you in the building process?
          </label>
          <select id="timeline" name="timeline" className="input-field">
            <option value="">Select timeline (optional)</option>
            <option value="planning">Still planning / picking a builder</option>
            <option value="contracted">Signed with builder, pre-construction</option>
            <option value="foundation">Foundation / site work</option>
            <option value="framing">Framing stage</option>
            <option value="finishing">Drywall / finishing</option>
            <option value="complete">Home is complete (retrofit)</option>
          </select>
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Tell us about your project
          </label>
          <textarea
            id="message"
            name="message"
            rows={3}
            className="input-field"
            placeholder="What kind of fireplace are you interested in? Any specific style or features?"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Send className="w-5 h-5 mr-2" />
              Schedule Free Consultation
            </>
          )}
        </button>

        <p className="text-xs text-gray-400 text-center">
          No obligation. We&apos;ll contact you within 24 hours.
        </p>
      </form>
    </div>
  );
}
