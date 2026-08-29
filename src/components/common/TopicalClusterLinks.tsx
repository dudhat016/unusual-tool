import React from 'react';
import { Sparkles, BookOpen, ArrowRight, Layers, Sliders } from 'lucide-react';
import { EXACT_TARGET_SIZE_ITEMS } from '../../config/targetSizeTools';
import { POPULAR_CONVERTER_PAIRS } from '../../config/converterTools';
import { GUIDES_REGISTRY } from '../../config/guidesData';
import { CATEGORIES_REGISTRY } from '../../config/categoryData';

interface TopicalClusterLinksProps {
  currentCategorySlug?: string;
  currentToolId?: string;
  isCompressor?: boolean;
  isConverter?: boolean;
}

export const TopicalClusterLinks: React.FC<TopicalClusterLinksProps> = ({
  currentCategorySlug,
  currentToolId,
  isCompressor,
  isConverter,
}) => {
  const guides = GUIDES_REGISTRY.slice(0, 4);

  const navigate = (url: string) => {
    window.history.pushState({}, '', url);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <div className="space-y-8 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-900/30">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span>Explore Related Utilities & Learning Hubs</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Deep links to specialized format pairs, target sizes, and optimization guides
        </p>
      </div>

      {/* Target Sizes Cluster if relevant */}
      {(isCompressor || currentCategorySlug === 'image-compressor-tools' || currentCategorySlug === 'pdf-tools' || currentToolId?.includes('pdf') || currentToolId?.includes('compress')) && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Sliders className="h-3.5 w-3.5 text-blue-500" />
            <span>Exact Target Size Compressors (PDF & Image)</span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {EXACT_TARGET_SIZE_ITEMS.map((item) => (
              <button
                key={item.slug}
                onClick={() => navigate(`/${item.slug}`)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  item.mediaType === 'pdf' || item.slug.includes('pdf')
                    ? 'border-blue-200 bg-blue-50/50 text-blue-700 hover:border-blue-500 hover:bg-blue-100/70 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Converter Pairs Cluster if relevant */}
      {(isConverter || currentCategorySlug === 'image-converter-tools') && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Sliders className="h-3.5 w-3.5 text-indigo-500" />
            <span>Popular Format Transcoder Pairs</span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {POPULAR_CONVERTER_PAIRS.slice(0, 8).map((pair) => (
              <button
                key={pair.slug}
                onClick={() => navigate(`/convert/${pair.slug}`)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300 transition-colors"
              >
                {pair.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category Hubs */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-violet-500" />
          <span>Image Utility Hubs</span>
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {CATEGORIES_REGISTRY.map((cat) => (
            <button
              key={cat.id}
              onClick={() => navigate(`/${cat.slug}`)}
              className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white text-left text-xs font-medium text-slate-800 hover:border-blue-500 hover:text-blue-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:text-blue-400 transition-colors"
            >
              <span className="truncate">{cat.name}</span>
              <ArrowRight className="h-3 w-3 shrink-0 opacity-60 ml-1" />
            </button>
          ))}
        </div>
      </div>

      {/* Step-by-Step Educational Guides */}
      <div className="space-y-3 border-t border-slate-200/60 dark:border-slate-800 pt-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <BookOpen className="h-3.5 w-3.5 text-emerald-500" />
          <span>Official Tutorials & Format Guides</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {guides.map((guide) => (
            <div
              key={guide.id}
              onClick={() => navigate(`/${guide.slug}`)}
              className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-500 dark:border-slate-800 dark:bg-slate-800/80 cursor-pointer transition-all hover:shadow-2xs group"
            >
              <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                {guide.category} • {guide.readTime}
              </div>
              <h5 className="text-xs font-bold text-slate-900 dark:text-white mt-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {guide.title}
              </h5>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                {guide.quickAnswer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
