import { ArrowRight, Search, Sparkles, X } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { POPULAR_CONVERTER_PAIRS } from '../../config/converterTools';
import { EXACT_TARGET_SIZE_ITEMS } from '../../config/targetSizeTools';
import { TOOLS_REGISTRY } from '../../config/tools';
import { useApp } from '../../context/AppContext';
import { DynamicIcon } from './DynamicIcon';
import { Link } from './Link';
import { BlogService } from '../../services/BlogService';

interface SearchResultItem {
  id: string;
  name: string;
  description: string;
  route: string;
  category: string;
  icon: string;
  badge: string;
  isAi?: boolean;
}

export const QuickSearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, navigate } = useApp();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isSearchOpen]);

  // Combined searchable index
  const allSearchItems = useMemo<SearchResultItem[]>(() => {
    const mainTools: SearchResultItem[] = TOOLS_REGISTRY.map((t) => ({
      id: `tool-${t.id}`,
      name: t.name,
      description: t.shortDescription,
      route: t.route,
      category: t.category,
      icon: t.icon,
      badge: t.isAi ? 'AI Engine' : 'Browser',
      isAi: t.isAi,
    }));

    const converterTools: SearchResultItem[] = POPULAR_CONVERTER_PAIRS.map((pair) => ({
      id: `convert-${pair.slug}`,
      name: pair.title,
      description: pair.description,
      route: `/convert/${pair.slug}`,
      category: 'convert',
      icon: 'RefreshCw',
      badge: 'Converter',
    }));

    const targetSizeTools: SearchResultItem[] = EXACT_TARGET_SIZE_ITEMS.map((item) => ({
      id: `target-${item.slug}`,
      name: item.label,
      description: `Compress ${item.mediaType === 'pdf' ? 'PDF document' : 'image'} strictly to ${
        item.targetSizeKb >= 1000 ? `${item.targetSizeKb / 1000}MB` : `${item.targetSizeKb}KB`
      }`,
      route: `/${item.slug}`,
      category: item.mediaType === 'pdf' ? 'pdf' : 'compress',
      icon: item.mediaType === 'pdf' ? 'FileText' : 'Minimize2',
      badge: item.mediaType === 'pdf' ? 'PDF Target' : 'Target Size',
    }));

    const blogPosts: SearchResultItem[] = BlogService.getPublishedPosts().map((p) => ({
      id: `blog-${p.id}`,
      name: p.title,
      description: p.excerpt,
      route: `/blog/${p.slug}`,
      category: p.category,
      icon: 'BookOpen',
      badge: 'Article',
    }));

    // Deduplicate by route
    const seenRoutes = new Set<string>();
    const uniqueItems: SearchResultItem[] = [];

    for (const item of [...mainTools, ...converterTools, ...targetSizeTools, ...blogPosts]) {
      if (!seenRoutes.has(item.route)) {
        seenRoutes.add(item.route);
        uniqueItems.push(item);
      }
    }

    return uniqueItems;
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const q = query.trim().toLowerCase();
  const filtered = allSearchItems.filter((item) => {
    if (!q) return true;
    return (
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.route.toLowerCase().includes(q)
    );
  });

  const handleSelect = (route: string) => {
    setIsSearchOpen(false);
    navigate(route);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/60 p-4 sm:p-6 backdrop-blur-xs pt-16 sm:pt-24 animate-in fade-in duration-150"
      onClick={() => setIsSearchOpen(false)}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <Search className="h-5 w-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools, converters, or target sizes (e.g. webp to png, 50kb, passport, crop)..."
            className="w-full bg-transparent px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="mr-2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Clear
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Results list */}
        <div className="max-h-[380px] overflow-y-auto p-2 space-y-1">
          {filtered.length > 0 ? (
            filtered.map((tool) => (
              <Link
                key={tool.id}
                href={tool.route}
                onClick={() => setIsSearchOpen(false)}
                className="w-full flex items-center justify-between gap-3 rounded-xl p-2.5 text-left hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <DynamicIcon name={tool.icon} className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {tool.name}
                      </span>
                      {tool.isAi ? (
                        <span className="flex items-center gap-0.5 rounded bg-primary/10 px-1.5 py-0.2 text-[9px] font-bold text-primary">
                          <Sparkles className="h-2.5 w-2.5" /> AI
                        </span>
                      ) : tool.badge === 'Target Size' ? (
                        <span className="rounded bg-emerald-50 px-1.5 py-0.2 text-[9px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          {tool.badge}
                        </span>
                      ) : tool.badge === 'Converter' ? (
                        <span className="rounded bg-sky-50 px-1.5 py-0.2 text-[9px] font-bold text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                          {tool.badge}
                        </span>
                      ) : (
                        <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[9px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                          {tool.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {tool.description}
                    </p>
                  </div>
                </div>

                <ArrowRight className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            ))
          ) : (
            <div className="py-10 text-center text-xs text-slate-400">
              No image tools or converters found matching "{query}"
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-4 py-2 text-[11px] text-slate-400 dark:border-slate-800 dark:bg-slate-950/60">
          <span>{filtered.length} tools & converters available</span>
          <div className="flex items-center gap-2">
            <span>Press ESC to exit</span>
          </div>
        </div>
      </div>
    </div>
  );
};
