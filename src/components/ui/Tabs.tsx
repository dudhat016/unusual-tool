import React from 'react';
import { Icon, IconName } from './Icon';

export interface TabItem {
  id: string;
  label: React.ReactNode;
  icon?: IconName;
  badge?: string | number;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'underline' | 'pills' | 'enclosed';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'underline',
  size = 'md',
  className = '',
}) => {
  return (
    <div
      role="tablist"
      className={`flex items-center gap-2 overflow-x-auto no-scrollbar select-none ${
        variant === 'underline'
          ? 'border-b border-slate-200 dark:border-slate-800'
          : variant === 'enclosed'
          ? 'p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700'
          : 'gap-1.5'
      } ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            disabled={tab.disabled}
            onClick={() => onChange(tab.id)}
            className={`inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 cursor-pointer whitespace-nowrap ${
              size === 'sm'
                ? 'px-3 py-1.5 text-xs'
                : size === 'lg'
                ? 'px-5 py-3 text-base'
                : 'px-4 py-2 text-sm'
            } ${
              variant === 'underline'
                ? `border-b-2 -mb-px ${
                    isActive
                      ? 'border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`
                : variant === 'pills'
                ? `rounded-xl ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300'
                  }`
                : `rounded-xl ${
                    isActive
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`
            } ${tab.disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}`}
          >
            {tab.icon && (
              <Icon
                name={tab.icon}
                size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16}
              />
            )}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                  isActive
                    ? variant === 'pills'
                      ? 'bg-white/20 text-white'
                      : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                    : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
