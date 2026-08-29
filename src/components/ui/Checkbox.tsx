import React, { forwardRef, useEffect, useRef } from 'react';
import { Icon } from './Icon';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: string;
  indeterminate?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, checked, indeterminate, disabled, className = '', onChange, ...rest }, ref) => {
    const defaultRef = useRef<HTMLInputElement>(null);
    const resolvedRef = (ref as React.RefObject<HTMLInputElement>) || defaultRef;

    useEffect(() => {
      if (resolvedRef.current) {
        resolvedRef.current.indeterminate = Boolean(indeterminate);
      }
    }, [indeterminate, resolvedRef]);

    return (
      <label
        className={`inline-flex items-center gap-2.5 select-none ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer group'
        } ${className}`}
      >
        <div className="relative flex items-center justify-center shrink-0">
          <input
            ref={resolvedRef}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            onChange={onChange}
            className="peer sr-only"
            {...rest}
          />
          <div className="w-4 h-4 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 peer-checked:bg-primary peer-checked:border-primary peer-indeterminate:bg-primary peer-indeterminate:border-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/30 transition-all flex items-center justify-center text-primary-foreground shadow-2xs">
            {checked && !indeterminate && <Icon name="Check" size={12} className="stroke-[3]" />}
            {indeterminate && <Icon name="Minus" size={12} className="stroke-[3]" />}
          </div>
        </div>

        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors">
                {label}
              </span>
            )}
            {description && (
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
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
export default Checkbox;
