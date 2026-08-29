import React from 'react';

export interface SegmentedOption {
  value: string;
  label: React.ReactNode;
  icon?: string;
  badge?: string;
  disabled?: boolean;
}

export interface SegmentedControlProps {
  options: SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: 'p-0.5 text-xs rounded-xl',
  md: 'p-1 text-sm rounded-xl',
  lg: 'p-1.5 text-base rounded-2xl',
};

const itemPadding = {
  sm: 'px-2.5 py-1',
  md: 'px-3.5 py-1.5',
  lg: 'px-4.5 py-2',
};

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  value,
  onChange,
  size = 'md',
  fullWidth = true,
  className = '',
}) => {
  return (
    <div
      role="tablist"
      className={`inline-flex items-center bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 select-none ${
        sizeConfig[size]
      } ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {options.map((opt) => {
        const isSelected = value === opt.value;

        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={isSelected}
            disabled={opt.disabled}
            onClick={() => onChange(opt.value)}
            className={`relative flex items-center justify-center gap-1.5 font-semibold transition-all duration-150 rounded-lg cursor-pointer ${
              itemPadding[size]
            } ${fullWidth ? 'flex-1' : ''} ${
              isSelected
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            } ${opt.disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}`}
          >
            <span className="truncate">{opt.label}</span>
            {opt.badge && (
              <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                {opt.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
