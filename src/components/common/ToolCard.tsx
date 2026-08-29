import React from 'react';
import { ToolDefinition } from '../../types';
import { useApp } from '../../context/AppContext';
import { DynamicIcon } from './DynamicIcon';
import { Zap, Heart, ArrowUpRight, Sparkles } from 'lucide-react';

interface ToolCardProps {
  tool: ToolDefinition;
  variant?: 'standard' | 'compact' | 'featured';
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, variant = 'standard' }) => {
  const { navigate, isFavorite, toggleFavorite } = useApp();
  const favorite = isFavorite(tool.id);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(tool.route);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(tool.id);
  };

  if (variant === 'featured') {
    return (
      <div
        onClick={handleClick}
        className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-xl hover:border-purple-300 dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-purple-700 transition-all duration-300 flex flex-col justify-between"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20 group-hover:scale-110 transition-transform">
              <DynamicIcon name={tool.icon} className="h-6 w-6" />
            </div>
            <div className="flex items-center gap-1.5">
              {tool.isAi ? (
                <span className="flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-[11px] font-semibold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60">
                  <Sparkles className="h-3 w-3" /> AI
                </span>
              ) : (
                <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                  <Zap className="h-3 w-3" /> Free
                </span>
              )}
              <button
                onClick={handleFavoriteClick}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                aria-label="Favorite tool"
              >
                <Heart className={`h-4 w-4 ${favorite ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors flex items-center gap-1">
              {tool.name}
              <ArrowUpRight className="h-4 w-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-purple-500" />
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2">
              {tool.shortDescription}
            </p>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <span>{tool.supportsBatch ? 'Batch Supported' : 'Single Precision'}</span>
          <span className="text-purple-600 dark:text-purple-400 font-semibold group-hover:underline">Open Tool →</span>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className="group relative cursor-pointer overflow-hidden rounded-xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-2xs hover:shadow-md hover:border-purple-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-purple-700 transition-all duration-200 flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <DynamicIcon name={tool.icon} className="h-5 w-5" />
          </div>

          <div className="flex items-center gap-1">
            {tool.isAi ? (
              <span className="rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                AI • {tool.creditCost}c
              </span>
            ) : (
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                Browser
              </span>
            )}
            <button
              onClick={handleFavoriteClick}
              className="p-1 rounded-md text-slate-400 hover:text-rose-500 transition-colors"
              aria-label="Favorite tool"
            >
              <Heart className={`h-3.5 w-3.5 ${favorite ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>
        </div>

        <div className="mt-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
            {tool.name}
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-normal">
            {tool.shortDescription}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/60">
        <span className="capitalize">{tool.category}</span>
        <span className="text-purple-600 dark:text-purple-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          Launch →
        </span>
      </div>
    </div>
  );
};
