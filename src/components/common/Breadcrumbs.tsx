import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { SeoBreadcrumbItem } from '../../types/seo';
import { Link } from './Link';

export interface UnifiedBreadcrumbItem {
  name?: string;
  label?: string;
  url?: string;
  href?: string;
  path?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
}

export interface BreadcrumbsProps {
  items: (SeoBreadcrumbItem | UnifiedBreadcrumbItem)[];
  className?: string;
  id?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '', id }) => {
  if (!items || items.length <= 1) return null;

  return (
    <nav
      id={id}
      aria-label="Breadcrumb"
      className={`flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 overflow-x-auto py-1 ${className}`}
    >
      <ol className="flex items-center space-x-1.5 flex-nowrap whitespace-nowrap">
        {items.map((rawItem, index) => {
          const name = (rawItem as any).name || (rawItem as any).label || '';
          const url = (rawItem as any).url || (rawItem as any).href || (rawItem as any).path || '';
          const isLast = index === items.length - 1;
          const isFirst = index === 0;
          const key = (url || name) + index;

          return (
            <li key={key} className="inline-flex items-center">
              {index > 0 && (
                <ChevronRight className="h-3.5 w-3.5 text-slate-400 mx-1 shrink-0" aria-hidden="true" />
              )}
              {isLast || !url ? (
                <span
                  className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-xs"
                  aria-current={isLast ? 'page' : undefined}
                >
                  {name}
                </span>
              ) : (
                <Link
                  href={url}
                  className="inline-flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
                >
                  {isFirst && <Home className="h-3.5 w-3.5 shrink-0" />}
                  <span>{name}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
