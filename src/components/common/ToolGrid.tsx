import React, { useState, useMemo } from 'react';
import { ToolDefinition, ToolCategory } from '../../types';
import { TOOL_CATEGORIES, TOOLS_REGISTRY } from '../../config/tools';
import { ToolCard } from './ToolCard';
import { Search, Filter, Sparkles, Zap, Layers } from 'lucide-react';

interface ToolGridProps {
  initialCategory?: ToolCategory;
  showFilters?: boolean;
  showSearch?: boolean;
  title?: string;
  limit?: number;
  featuredOnly?: boolean;
}

export const ToolGrid: React.FC<ToolGridProps> = ({
  initialCategory = 'all',
  showFilters = true,
  showSearch = true,
  title,
  limit,
  featuredOnly = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [processingFilter, setProcessingFilter] = useState<'all' | 'browser' | 'ai'>('all');

  const filteredTools = useMemo(() => {
    let result = TOOLS_REGISTRY;

    if (featuredOnly) {
      result = result.filter((t) => t.isPopular || t.isAi);
    }

    if (selectedCategory !== 'all') {
      result = result.filter((t) => t.category === selectedCategory || (selectedCategory === 'ai' && t.isAi));
    }

    if (processingFilter === 'browser') {
      result = result.filter((t) => t.processingType === 'browser');
    } else if (processingFilter === 'ai') {
      result = result.filter((t) => t.isAi || t.processingType === 'ai');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.shortDescription.toLowerCase().includes(q) ||
          t.seo.keywords.some((k) => k.toLowerCase().includes(q)) ||
          t.category.toLowerCase().includes(q)
      );
    }

    if (limit) {
      result = result.slice(0, limit);
    }

    return result;
  }, [selectedCategory, searchQuery, processingFilter, featuredOnly, limit]);

  return (
    <div className="space-y-6">
      {/* Header / Title if provided */}
      {title && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h2>
          <span className="text-xs text-slate-500">{filteredTools.length} tools available</span>
        </div>
      )}

      {/* Controls: Search & Category Pills */}
      {(showSearch || showFilters) && (
        <div className="space-y-4">
          {/* Search bar & Type Toggles */}
          {showSearch && (
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search image tools (e.g. compress to 100kb, passport photo, crop, ocr)..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-white shadow-2xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Processing Filter (All, Browser, AI) */}
              <div className="flex shrink-0 items-center rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-900 w-full sm:w-auto">
                <button
                  onClick={() => setProcessingFilter('all')}
                  className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    processingFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-800 dark:text-white'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setProcessingFilter('browser')}
                  className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1 ${
                    processingFilter === 'browser'
                      ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-800 dark:text-white'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                  }`}
                >
                  <Zap className="h-3 w-3 text-emerald-500" /> Free Browser
                </button>
                <button
                  onClick={() => setProcessingFilter('ai')}
                  className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1 ${
                    processingFilter === 'ai'
                      ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-800 dark:text-white'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                  }`}
                >
                  <Sparkles className="h-3 w-3 text-indigo-500" /> AI Tools
                </button>
              </div>
            </div>
          )}

          {/* Category Chips Carousel */}
          {showFilters && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
              {TOOL_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id as ToolCategory)}
                    className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                        : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400 dark:hover:bg-slate-800'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Grid of Tool Cards */}
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center dark:border-slate-800">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No matching image tools found</p>
          <p className="mt-1 text-xs text-slate-400">Try searching for keywords like "crop", "size", or "convert"</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setProcessingFilter('all');
            }}
            className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
