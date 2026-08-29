import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { SeoBreadcrumbItem } from '../../types/seo';

interface BreadcrumbsProps {
  items: SeoBreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  if (!items || items.length <= 1) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 overflow-x-auto py-1 ${className}`}
    >
      <ol className="flex items-center space-x-1.5 flex-nowrap whitespace-nowrap">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isFirst = index === 0;

          return (
            <li key={item.url + index} className="inline-flex items-center">
              {index > 0 && (
                <ChevronRight className="h-3.5 w-3.5 text-slate-400 mx-1 shrink-0" aria-hidden="true" />
              )}
              {isLast ? (
                <span
                  className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-xs"
                  aria-current="page"
                >
                  {item.name}
                </span>
              ) : (
                <a
                  href={item.url}
                  onClick={(e) => {
                    e.preventDefault();
                    window.history.pushState({}, '', item.url);
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }}
                  className="inline-flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {isFirst && <Home className="h-3.5 w-3.5 shrink-0" />}
                  <span>{item.name}</span>
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
