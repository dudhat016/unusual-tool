import React, { forwardRef } from 'react';
import { Icon } from './Icon';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  group?: string;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  options: SelectOption[];
  size?: 'sm' | 'md' | 'lg';
  error?: boolean | string;
  helperText?: string;
}

const selectSizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-3.5 py-2 text-sm rounded-xl',
  lg: 'px-4.5 py-2.5 text-base rounded-xl',
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      options,
      size = 'md',
      error = false,
      helperText,
      disabled = false,
      className = '',
      value,
      ...rest
    },
    ref
  ) => {
    const hasError = Boolean(error);
    const errorMessage = typeof error === 'string' ? error : undefined;

    return (
      <div className="w-full space-y-1.5">
        <div className="relative flex items-center w-full">
          <select
            ref={ref}
            disabled={disabled}
            value={value}
            className={`w-full appearance-none cursor-pointer bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border pr-10 rtl:pr-3.5 rtl:pl-10 transition-all duration-150 focus:outline-none focus:ring-2 ${
              selectSizes[size]
            } ${
              hasError
                ? 'border-rose-300 dark:border-rose-800 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/10'
                : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-indigo-500/20'
            } ${
              disabled
                ? 'opacity-50 bg-slate-50 dark:bg-slate-800/60 cursor-not-allowed pointer-events-none'
                : ''
            } ${className}`}
            {...rest}
          >
            {options.map((opt) => (
              <option
                key={String(opt.value)}
                value={opt.value}
                disabled={opt.disabled}
                className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 py-1"
              >
                {opt.label}
              </option>
            ))}
          </select>

          <div className="absolute right-3.5 rtl:right-auto rtl:left-3.5 flex items-center justify-center pointer-events-none text-slate-400 dark:text-slate-500">
            <Icon name="ChevronDown" size={16} />
          </div>
        </div>

        {errorMessage ? (
          <p className="text-xs text-rose-500 dark:text-rose-400 font-medium">{errorMessage}</p>
        ) : helperText ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
