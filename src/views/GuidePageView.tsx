import React from 'react';
import { GuideArticleEntry } from '../types/seo';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { getBreadcrumbsForRoute } from '../config/seoRegistry';
import { Sparkles, ArrowRight, Calendar, User, Clock, CheckCircle2, HelpCircle, ChevronDown, BookOpen } from 'lucide-react';
import { TopicalClusterLinks } from '../components/common/TopicalClusterLinks';

interface GuidePageViewProps {
  guide: GuideArticleEntry;
}

export const GuidePageView: React.FC<GuidePageViewProps> = ({ guide }) => {
  const breadcrumbs = getBreadcrumbsForRoute(`/${guide.slug}`);
  const [openFaqIndex, setOpenFaqIndex] = React.useState<number | null>(0);

  const navigate = (url: string) => {
    window.history.pushState({}, '', url);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <article className="space-y-10 py-6 max-w-4xl mx-auto">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbs} />

      {/* Header & Meta */}
      <header className="space-y-4 border-b border-slate-200/80 pb-6 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span className="rounded-md bg-blue-50 px-2.5 py-0.5 font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800">
            {guide.category}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {guide.readTime}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            Updated {guide.updatedDate}
          </span>
          <span className="flex items-center gap-1">
            <User className="h-3.5 w-3.5" />
            {guide.author.name}
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
          {guide.h1}
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
          {guide.metaDescription}
        </p>
      </header>

      {/* Embedded Tool CTA */}
      {guide.relatedToolSlug && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-blue-600 text-white shadow-md">
          <div>
            <div className="text-xs font-semibold text-blue-100 uppercase tracking-wider">Interactive Utility</div>
            <h3 className="text-base font-bold">Try the Tool Mentioned in this Guide</h3>
            <p className="text-xs text-blue-100 mt-0.5">Process your photo immediately with 100% browser privacy</p>
          </div>
          <button
            onClick={() => navigate(guide.relatedToolSlug)}
            className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors shadow-sm shrink-0"
          >
            <span>Open Tool Now</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Guide Content Sections */}
      <div className="space-y-8 text-slate-800 dark:text-slate-200">
        {guide.sections.map((section, idx) => (
          <section key={idx} className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {section.heading}
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line">
              {section.content}
            </p>

            {section.bullets && section.bullets.length > 0 && (
              <ul className="space-y-2 pt-2">
                {section.bullets.map((bullet, bIdx) => (
                  <li key={bIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      {/* FAQs Section */}
      {guide.faq && guide.faq.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Frequently Asked Questions</h2>
          </div>

          <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200/80 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
            {guide.faq.map((faqItem, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className="p-4 sm:p-5">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between text-left text-sm font-semibold text-slate-900 dark:text-white"
                  >
                    <span>{faqItem.question}</span>
                    <ChevronDown
                      className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-blue-600' : ''}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300 pr-6">
                      {faqItem.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Topical Clusters */}
      <TopicalClusterLinks />
    </article>
  );
};
