import React, { useEffect, useState } from 'react';
import { History, Clock, ArrowRight, Trash2 } from 'lucide-react';
import { ToolDefinition } from '../../types';
import { DynamicToolService } from '../../services/DynamicToolService';
import { useApp } from '../../context/AppContext';
import { ToolCard } from './ToolCard';
import { Link } from './Link';

interface RecentlyUsedToolsProps {
  currentToolId?: string;
  maxItems?: number;
  className?: string;
}

const RECENT_TOOLS_KEY = 'aetherpix_recent_tool_ids';

/**
 * Helper to record a visited tool to localStorage
 */
export function recordRecentlyUsedTool(toolId: string) {
  if (typeof window === 'undefined' || !toolId) return;
  try {
    const raw = localStorage.getItem(RECENT_TOOLS_KEY);
    const existing: string[] = raw ? JSON.parse(raw) : [];
    const next = [toolId, ...existing.filter((id) => id !== toolId)].slice(0, 12);
    localStorage.setItem(RECENT_TOOLS_KEY, JSON.stringify(next));
  } catch (e) {
    console.warn('Failed to record recent tool', e);
  }
}

export const RecentlyUsedTools: React.FC<RecentlyUsedToolsProps> = ({
  currentToolId,
  maxItems = 3,
  className = '',
}) => {
  const { history = [] } = useApp();
  const [recentTools, setRecentTools] = useState<ToolDefinition[]>([]);

  useEffect(() => {
    // Collect tool IDs from both local visit log and operation history
    const allTools = DynamicToolService.getAllTools();
    const collectedIds: string[] = [];

    // 1. From visit tracking
    try {
      const raw = localStorage.getItem(RECENT_TOOLS_KEY);
      if (raw) {
        const parsed: string[] = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          collectedIds.push(...parsed);
        }
      }
    } catch {}

    // 2. From processing history
    history.forEach((h) => {
      if (h.toolId && !collectedIds.includes(h.toolId)) {
        collectedIds.push(h.toolId);
      }
    });

    // Deduplicate and filter out current tool
    const uniqueIds = Array.from(new Set(collectedIds)).filter((id) => id !== currentToolId);

    // Resolve to ToolDefinition objects
    let resolved = uniqueIds
      .map((id) => DynamicToolService.getToolById(id) || DynamicToolService.getToolBySlug(id))
      .filter((t): t is ToolDefinition => Boolean(t));

    // If no or very few recent tools, supplement with popular tools
    if (resolved.length === 0) {
      const popular = allTools
        .filter((t) => t.id !== currentToolId && t.isPopular)
        .slice(0, maxItems);
      resolved = popular;
    } else {
      resolved = resolved.slice(0, maxItems);
    }

    setRecentTools(resolved);
  }, [currentToolId, history, maxItems]);

  const handleClearRecents = (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      localStorage.removeItem(RECENT_TOOLS_KEY);
      // Keep only history items or popular fallbacks
      const allTools = DynamicToolService.getAllTools();
      const popular = allTools
        .filter((t) => t.id !== currentToolId && t.isPopular)
        .slice(0, maxItems);
      setRecentTools(popular);
    } catch {}
  };

  if (recentTools.length === 0) return null;

  return (
    <section aria-labelledby="recently-used-heading" className={`space-y-4 pt-10 border-t border-slate-200/80 dark:border-slate-800 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <History className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 id="recently-used-heading" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Recently Used Tools
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Quickly jump back into your recent image and media utilities
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <Link
            href="/dashboard/history"
            className="flex items-center gap-1 font-semibold text-primary hover:underline"
          >
            <span>Full History</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
        {recentTools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </section>
  );
};
