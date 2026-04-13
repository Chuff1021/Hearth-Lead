'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  items: FAQItem[];
  title?: string;
}

export default function FAQ({ items, title = 'Frequently Asked Questions' }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium text-gray-900 pr-4">{item.question}</span>
              <ChevronDown
                className={cn(
                  'w-5 h-5 text-gray-400 flex-shrink-0 transition-transform',
                  openIndex === i && 'rotate-180'
                )}
              />
            </button>
            {openIndex === i && (
              <div className="px-5 pb-4 text-gray-600 text-sm leading-relaxed">
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
