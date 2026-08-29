import React, { forwardRef } from 'react';
import { Icon } from './Icon';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, checked, disabled, className = '', ...rest }, ref) => {
    return (
      <label
        className={`inline-flex items-start gap-3 select-none ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer group'
        } ${className}`}
      >
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            ref={ref}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            className="peer sr-only"
            {...rest}
          />
          <div className="w-5 h-5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 peer-checked:bg-indigo-600 peer-checked:border-indigo-600 peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-500/30 transition-all flex items-center justify-center text-white shadow-xs">
            {checked && <Icon name="Check" size={14} className="stroke-[3]" />}
          </div>
        </div>

        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {label}
              </span>
            )}
            {description && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {description}
              </span>
            )}
          </div>
        )}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
