import React from 'react';
import { CategorySeoEntry } from '../types/seo';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { getBreadcrumbsForRoute } from '../config/seoRegistry';
import { TOOLS_REGISTRY } from '../config/tools';
import { ToolCard } from '../components/common/ToolCard';
import { Sparkles, CheckCircle, HelpCircle, ChevronDown, Layers, ArrowRight } from 'lucide-react';
import { TopicalClusterLinks } from '../components/common/TopicalClusterLinks';

interface CategoryPageViewProps {
  category: CategorySeoEntry;
}

export const CategoryPageView: React.FC<CategoryPageViewProps> = ({ category }) => {
  const breadcrumbs = getBreadcrumbsForRoute(`/${category.slug}`);
  const [openFaqIndex, setOpenFaqIndex] = React.useState<number | null>(0);

  // Match tools belonging to this category
  const matchingTools = TOOLS_REGISTRY.filter((tool) => {
    if (tool.id === category.id || tool.slug === category.slug) return false;
    if (category.id === 'image-tools') return true;
    if (category.id === 'image-compressor-tools') return tool.category === 'compress' || tool.id === 'compress-image';
    if (category.id === 'image-converter-tools') return tool.category === 'convert' || tool.id === 'convert-image';
    if (category.id === 'image-resizer-tools') return tool.category === 'resize' || tool.category === 'crop' || tool.category === 'passport' || tool.category === 'social';
    if (category.id === 'image-editing-tools') return tool.category === 'effects' || tool.category === 'metadata' || tool.id === 'border-maker' || tool.id === 'watermark-image' || tool.id === 'color-picker';
    if (category.id === 'ai-image-tools') return tool.category === 'ai' || tool.isAi;
    if (category.id === 'youtube-tools') return tool.category === 'youtube';
    return tool.category === category.id;
  });

  return (
    <div className="space-y-10 py-6 max-w-6xl mx-auto">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbs} />

      {/* Category Hero Header */}
      <div className="space-y-4 border-b border-slate-200/80 pb-8 dark:border-slate-800">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800">
          <Layers className="h-3.5 w-3.5" />
          <span>Curated Utility Hub • {matchingTools.length} Tools Available</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {category.h1}
        </h1>

        <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300 max-w-4xl">
          {category.description}
        </p>
      </div>

      {/* Tools Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Available Utilities in this Hub
          </h2>
          <span className="text-xs text-slate-500">{matchingTools.length} Utilities</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {matchingTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </div>

      {/* Key Workflows Checklist */}
      {category.keyWorkflows && category.keyWorkflows.length > 0 && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-2xs space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Recommended Workflows & Capabilities
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {category.keyWorkflows.map((workflow, idx) => (
              <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="font-medium text-slate-800 dark:text-slate-200">{workflow}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQs Section */}
      {category.faq && category.faq.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Frequently Asked Questions</h2>
          </div>

          <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200/80 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
            {category.faq.map((faqItem, idx) => {
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

      {/* Cluster Navigation */}
      <TopicalClusterLinks
        currentCategorySlug={category.slug}
        isCompressor={category.id === 'image-compressor-tools'}
        isConverter={category.id === 'image-converter-tools'}
      />
    </div>
  );
};
