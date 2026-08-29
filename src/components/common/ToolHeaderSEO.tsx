import React from 'react';
import { ToolDefinition } from '../../types';
import { DynamicIcon } from './DynamicIcon';
import { Lock, Zap, Sparkles, Layers, ShieldCheck } from 'lucide-react';

import { ToolDetailContent } from '../../types/toolCms';

interface ToolHeaderSEOProps {
  tool: ToolDefinition;
  content?: ToolDetailContent | null;
}

export const ToolHeaderSEO: React.FC<ToolHeaderSEOProps> = ({ tool, content }) => {
  const displayTitle = content?.seo?.h1Title || tool.name;
  const displayDescription = content?.seo?.headerDescription || tool.fullDescription;

  return (
    <div className="space-y-4 border-b border-slate-200/80 pb-6 dark:border-slate-800">
      {/* Badges Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
          <DynamicIcon name={tool.icon} className="h-3.5 w-3.5" />
          <span className="capitalize">{tool.category}</span>
        </span>

        {tool.processingType === 'browser' ? (
          <span className="flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
            <Lock className="h-3.5 w-3.5" /> 100% In-Browser & Private
          </span>
        ) : (
          <span className="flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary border border-primary/20">
            <Sparkles className="h-3.5 w-3.5" /> AI Engine • {tool.creditCost} Credits
          </span>
        )}

        {tool.supportsBatch && (
          <span className="flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <Layers className="h-3.5 w-3.5" /> Batch Ready
          </span>
        )}
      </div>

      {/* Main H1 & SEO Subheading */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {displayTitle}
        </h1>
        <p className="mt-2 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300 max-w-3xl">
          {displayDescription}
        </p>
      </div>
    </div>
  );
};
