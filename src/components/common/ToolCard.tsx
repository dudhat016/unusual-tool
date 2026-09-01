import React from 'react';
import { ToolDefinition } from '../../types';
import { useApp } from '../../context/AppContext';
import { DynamicIcon } from './DynamicIcon';
import { Zap, Heart, ArrowUpRight, Sparkles, Layers } from 'lucide-react';
import { Link } from './Link';

interface ToolCardProps {
  tool: ToolDefinition;
  variant?: 'standard' | 'compact' | 'featured';
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, variant = 'standard' }) => {
  const { isFavorite, toggleFavorite } = useApp();
  const favorite = isFavorite(tool.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(tool.id);
  };

  const categorySlug = tool.category ? (tool.category.endsWith('-tools') ? tool.category : `${tool.category}-tools`) : 'image-tools';
  const toolSlug = tool.slug || tool.id;
  const targetRoute = tool.route && tool.route.split('/').filter(Boolean).length >= 2
    ? tool.route
    : `/${categorySlug}/${toolSlug.replace(/^\/+/, '')}`;

  if (variant === 'featured') {
    return (
      <Link
        href={targetRoute}
        className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs hover:shadow-xl hover:border-primary/80 hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-primary/80 transition-all duration-300 flex flex-col justify-between"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
              <DynamicIcon name={tool.icon} className="h-6 w-6" />
            </div>
            <div className="flex items-center gap-1.5">
              {tool.isAi ? (
                <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary border border-primary/20">
                  <Sparkles className="h-3 w-3" /> AI
                </span>
              ) : (
                <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                  <Zap className="h-3 w-3" /> Free
                </span>
              )}
              <button
                type="button"
                onClick={handleFavoriteClick}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  favorite
                    ? 'bg-rose-50 text-rose-500 dark:bg-rose-950/60 shadow-xs'
                    : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50'
                }`}
                title={favorite ? 'Remove from favorites' : 'Bookmark & add to favorites'}
                aria-label={favorite ? 'Remove from favorites' : 'Bookmark & add to favorites'}
              >
                <Heart className={`h-4 w-4 transition-transform active:scale-90 ${favorite ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors flex items-center justify-between">
              <span>{tool.name}</span>
              <ArrowUpRight className="h-4 w-4 opacity-0 -translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all text-primary shrink-0" />
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2">
              {tool.shortDescription}
            </p>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <span className="flex items-center gap-1">
            {tool.supportsBatch ? <><Layers className="h-3 w-3 text-primary" /> Batch Ready</> : 'Single Precision'}
          </span>
          <span className="text-primary font-semibold group-hover:underline">Open Tool →</span>
        </div>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link
        href={targetRoute}
        className="group relative cursor-pointer overflow-hidden rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs hover:shadow-md hover:border-primary/80 hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-primary/80 transition-all duration-200 flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
            <DynamicIcon name={tool.icon} className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors">
              {tool.name}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {tool.shortDescription}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleFavoriteClick}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              favorite
                ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/60'
                : 'text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={favorite ? 'Remove from favorites' : 'Bookmark'}
            aria-label="Bookmark tool"
          >
            <Heart className={`h-3.5 w-3.5 ${favorite ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={targetRoute}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-2xs hover:shadow-lg hover:border-primary/80 hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-primary/80 transition-all duration-200 flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-105 transition-all duration-200 shadow-2xs">
            <DynamicIcon name={tool.icon} className="h-5 w-5" />
          </div>

          <div className="flex items-center gap-1.5">
            {tool.isAi ? (
              <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary border border-primary/20">
                AI • {tool.creditCost}c
              </span>
            ) : (
              <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                Browser
              </span>
            )}
            <button
              type="button"
              onClick={handleFavoriteClick}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                favorite
                  ? 'bg-rose-50 text-rose-500 dark:bg-rose-950/60 shadow-2xs'
                  : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50'
              }`}
              title={favorite ? 'Remove from favorites' : 'Bookmark & add to favorites'}
              aria-label={favorite ? 'Remove from favorites' : 'Bookmark & add to favorites'}
            >
              <Heart className={`h-3.5 w-3.5 transition-transform active:scale-90 ${favorite ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>
        </div>

        <div className="mt-3.5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors flex items-center justify-between">
            <span>{tool.name}</span>
            <ArrowUpRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all text-primary shrink-0" />
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {tool.shortDescription}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
        <span className="capitalize font-medium">{tool.category}</span>
        <span className="text-primary font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
          Launch Tool →
        </span>
      </div>
    </Link>
  );
};

