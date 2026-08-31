import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EXACT_TARGET_SIZE_ITEMS, EXACT_IMAGE_TARGET_SIZE_ITEMS, EXACT_PDF_TARGET_SIZE_ITEMS } from '../../config/targetSizeTools';
import { FileText, Image as ImageIcon } from 'lucide-react';
import { Link } from './Link';

interface ExactTargetSizesGridProps {
  currentSlug?: string;
  className?: string;
  title?: string;
  defaultFilter?: 'all' | 'image' | 'pdf';
}

export const ExactTargetSizesGrid: React.FC<ExactTargetSizesGridProps> = ({
  currentSlug,
  className = '',
  title = 'Exact Target Sizes',
  defaultFilter = 'all',
}) => {
  const { navigate } = useApp();
  const [activeTab, setActiveTab] = useState<'all' | 'image' | 'pdf'>(() => {
    if (defaultFilter !== 'all') return defaultFilter;
    if (currentSlug?.includes('pdf')) return 'pdf';
    return 'all';
  });

  const displayedItems = 
    activeTab === 'image'
      ? EXACT_IMAGE_TARGET_SIZE_ITEMS
      : activeTab === 'pdf'
      ? EXACT_PDF_TARGET_SIZE_ITEMS
      : EXACT_TARGET_SIZE_ITEMS;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        {title && (
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click any benchmark to compress directly to exact KB limits
            </p>
          </div>
        )}

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Sizes ({EXACT_TARGET_SIZE_ITEMS.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pdf')}
            className={`flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'pdf'
                ? 'bg-white dark:bg-slate-700 text-primary shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="h-3 w-3" />
            PDF Targets
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('image')}
            className={`flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'image'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ImageIcon className="h-3 w-3" />
            Photo Targets
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
        {displayedItems.map((item) => {
          const isActive = currentSlug === item.slug;
          const isPdf = item.mediaType === 'pdf' || item.slug.includes('pdf');
          return (
            <Link
              key={item.slug}
              href={`/${isPdf ? 'pdf-tools' : 'compress-image-tools'}/${item.slug}`}
              className={`px-3 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border text-center transition-all flex items-center justify-center gap-1.5 ${
                isActive
                  ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20 shadow-xs font-bold'
                  : isPdf
                  ? 'border-slate-200/90 bg-white text-slate-700 hover:border-primary hover:bg-primary/10 hover:text-primary dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:border-primary dark:hover:bg-slate-800 dark:hover:text-primary shadow-2xs'
                  : 'border-slate-200/90 bg-white text-slate-700 hover:border-emerald-400 hover:bg-emerald-50/50 hover:text-emerald-600 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:border-emerald-500 dark:hover:bg-slate-800 dark:hover:text-emerald-400 shadow-2xs'
              }`}
            >
              {isPdf ? (
                <FileText className="h-3 w-3 text-blue-500 shrink-0" />
              ) : (
                <ImageIcon className="h-3 w-3 text-emerald-500 shrink-0" />
              )}
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

