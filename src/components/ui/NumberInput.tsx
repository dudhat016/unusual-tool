import React, { forwardRef } from 'react';
import { Icon } from './Icon';

export interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange'> {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  size?: 'sm' | 'md' | 'lg';
  error?: boolean | string;
  helperText?: string;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      label,
      value,
      onChange,
      min = -Infinity,
      max = Infinity,
      step = 1,
      unit,
      size = 'md',
      error = false,
      helperText,
      disabled = false,
      className = '',
      ...rest
    },
    ref
  ) => {
    const handleIncrement = () => {
      if (disabled) return;
      const next = Math.min(max, (Number(value) || 0) + step);
      onChange(next);
    };

    const handleDecrement = () => {
      if (disabled) return;
      const prev = Math.max(min, (Number(value) || 0) - step);
      onChange(prev);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const parsed = parseFloat(e.target.value);
      if (isNaN(parsed)) {
        onChange(min !== -Infinity ? min : 0);
      } else {
        onChange(Math.max(min, Math.min(max, parsed)));
      }
    };

    return (
      <div className="w-full space-y-1">
        {label && (
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}
        <div className="flex items-center rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
          <input
            ref={ref}
            type="number"
            min={min !== -Infinity ? min : undefined}
            max={max !== Infinity ? max : undefined}
            step={step}
            value={value}
            onChange={handleInputChange}
            disabled={disabled}
            className={`w-full bg-transparent px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${className}`}
            {...rest}
          />
          {unit && (
            <span className="px-2 text-xs font-semibold text-slate-400 select-none">
              {unit}
            </span>
          )}
          <div className="flex flex-col border-l border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={handleIncrement}
              disabled={disabled || value >= max}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Increase value"
            >
              <Icon name="ChevronUp" size={12} />
            </button>
            <button
              type="button"
              onClick={handleDecrement}
              disabled={disabled || value <= min}
              className="p-1 border-t border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Decrease value"
            >
              <Icon name="ChevronDown" size={12} />
            </button>
          </div>
        </div>
        {typeof error === 'string' ? (
          <p className="text-xs text-rose-500 font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

NumberInput.displayName = 'NumberInput';
