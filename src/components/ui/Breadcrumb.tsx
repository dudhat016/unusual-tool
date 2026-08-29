import React from 'react';
import { Icon } from './Icon';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center text-xs ${className}`}>
      <ol className="flex items-center gap-1.5 flex-wrap">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="inline-flex items-center gap-1.5">
              {index > 0 && (
                <span className="text-slate-400 rtl:rotate-180">
                  <Icon name="ChevronRight" size={12} />
                </span>
              )}

              {isLast ? (
                <span
                  aria-current="page"
                  className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5"
                >
                  {item.icon && <Icon name={item.icon} size={14} />}
                  {item.label}
                </span>
              ) : item.onClick ? (
                <button
                  type="button"
                  onClick={item.onClick}
                  className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {item.icon && <Icon name={item.icon} size={14} />}
                  {item.label}
                </button>
              ) : item.href ? (
                <a
                  href={item.href}
                  className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors flex items-center gap-1.5"
                >
                  {item.icon && <Icon name={item.icon} size={14} />}
                  {item.label}
                </a>
              ) : (
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  {item.icon && <Icon name={item.icon} size={14} />}
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
