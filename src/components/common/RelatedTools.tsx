import React from 'react';
import { Layers } from 'lucide-react';
import { DynamicToolService } from '../../services/DynamicToolService';
import { ToolCard } from './ToolCard';

interface RelatedToolsProps {
  currentToolId: string;
  category: string;
  className?: string;
}

export const RelatedTools: React.FC<RelatedToolsProps> = ({ currentToolId, category, className = '' }) => {
  const allTools = DynamicToolService.getAllTools();
  
  // Prefer same category tools, complemented with popular tools if needed
  const sameCategory = allTools.filter((t) => t.id !== currentToolId && t.category === category);
  const fallbackTools = allTools.filter((t) => t.id !== currentToolId && t.category !== category && t.isPopular);
  
  const related = [...sameCategory, ...fallbackTools].slice(0, 3);

  if (related.length === 0) return null;

  return (
    <section aria-labelledby="related-tools-heading" className={`space-y-4 pt-10 border-t border-slate-200/80 dark:border-slate-800 ${className}`}>
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Layers className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h2 id="related-tools-heading" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Related Tools
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Explore complementary utilities and batch tools for your workflow
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
        {related.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </section>
  );
};

