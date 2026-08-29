import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { ToolFaqItem } from '../../types/toolCms';

export interface GenericFaqItem {
  id?: string;
  question?: string;
  answerHtml?: string;
  q?: string;
  a?: string;
  answer?: string;
  enabled?: boolean;
}

interface DynamicFaqAccordionProps {
  faqs: (GenericFaqItem | ToolFaqItem)[] | any[];
  toolName?: string;
  title?: string;
  subtitle?: string;
  className?: string;
  iconColor?: string;
}

export const DynamicFaqAccordion: React.FC<DynamicFaqAccordionProps> = ({
  faqs = [],
  toolName = 'this tool',
  title = 'Frequently Asked Questions',
  subtitle,
  className = '',
  iconColor = 'text-primary',
}) => {
  // Normalize any FAQ structure (CMS, SEO, or local arrays)
  const normalizedItems = (faqs || [])
    .filter((f: any) => f && f.enabled !== false)
    .map((f: any, idx: number) => {
      const qText = f.question || f.q || `Question #${idx + 1}`;
      const aText = f.answerHtml || f.answer || f.a || '';
      return {
        id: f.id || `faq-${idx}`,
        question: qText,
        contentHtml: aText.startsWith('<') ? aText : `<p>${aText}</p>`,
      };
    });

  const [openIndex, setOpenIndex] = useState<number | null>(0); // 1st item open by default

  if (normalizedItems.length === 0) return null;

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section aria-labelledby="faq-heading" className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 ${iconColor}`}>
          <HelpCircle className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h2 id="faq-heading" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {subtitle || `Got questions about using ${toolName}? Find instant answers below.`}
          </p>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        {normalizedItems.map((faq, index) => {
          const isOpen = openIndex === index;
          const buttonId = `faq-btn-${index}`;
          const panelId = `faq-panel-${index}`;

          return (
            <div
              key={faq.id}
              className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs transition-all"
            >
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggleAccordion(index)}
                className="flex w-full items-center justify-between p-4 sm:p-5 text-left font-bold text-sm sm:text-base text-slate-900 dark:text-white hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
              >
                <span>{faq.question}</span>
                <ChevronDown
                  className={`h-5 w-5 text-slate-400 transition-transform duration-200 shrink-0 ${
                    isOpen ? 'rotate-180 text-primary' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>

              {isOpen && (
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className="px-4 pb-5 sm:px-5 sm:pb-5 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800/60 pt-3"
                  dangerouslySetInnerHTML={{ __html: faq.contentHtml }}
                />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
