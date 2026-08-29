import React from 'react';
import { FAQItem, UsageStep } from '../../types';
import { CheckCircle } from 'lucide-react';
import { DynamicFaqAccordion } from './DynamicFaqAccordion';

interface ToolFAQSectionProps {
  faqs?: FAQItem[];
  howToSteps?: UsageStep[];
  features?: string[];
  toolName: string;
}

export const ToolFAQSection: React.FC<ToolFAQSectionProps> = ({
  faqs = [],
  howToSteps = [],
  features = [],
  toolName,
}) => {
  const hasHowTo = Array.isArray(howToSteps) && howToSteps.length > 0;
  const hasFeatures = Array.isArray(features) && features.length > 0;
  const hasFaqs = Array.isArray(faqs) && faqs.length > 0;

  if (!hasHowTo && !hasFeatures && !hasFaqs) {
    return null;
  }

  return (
    <div className="space-y-12 border-t border-slate-200/80 pt-12 dark:border-slate-800">
      {/* How to use steps */}
      {hasHowTo && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              How to use {toolName}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Follow these simple steps to process your image in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {howToSteps.map((step) => (
              <div
                key={step.step}
                className="relative rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-sm mb-3">
                  {step.step}
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{step.title}</h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Features Checklist */}
      {hasFeatures && (
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-900/40 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Key Capabilities & Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {features.map((feat, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reusable FAQs Accordion */}
      {hasFaqs && <DynamicFaqAccordion faqs={faqs} toolName={toolName} />}
    </div>
  );
};
