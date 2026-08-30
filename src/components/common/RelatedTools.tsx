import React from 'react';
import { ToolDefinition } from '../../types';
import { DynamicToolService } from '../../services/DynamicToolService';
import { ToolCard } from './ToolCard';

interface RelatedToolsProps {
  currentToolId: string;
  category: string;
}

export const RelatedTools: React.FC<RelatedToolsProps> = ({ currentToolId, category }) => {
  const allTools = DynamicToolService.getAllTools();
  const related = allTools.filter(
    (t) => t.id !== currentToolId && (t.category === category || t.isPopular)
  ).slice(0, 3);

  if (related.length === 0) return null;

  return (
    <div className="space-y-4 pt-10 border-t border-slate-200/80 dark:border-slate-800">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Related Image Utilities</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {related.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  );
};
