import React, { forwardRef } from 'react';

export interface RadioOption {
  value: string;
  label: React.ReactNode;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  disabled?: boolean;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  options,
  value,
  onChange,
  orientation = 'vertical',
  className = '',
  disabled = false,
}) => {
  return (
    <div
      role="radiogroup"
      className={`flex ${
        orientation === 'horizontal' ? 'flex-row flex-wrap gap-4' : 'flex-col gap-2.5'
      } ${className}`}
    >
      {options.map((opt) => {
        const isSelected = value === opt.value;
        const isDisabled = disabled || opt.disabled;

        return (
          <label
            key={opt.value}
            className={`inline-flex items-start gap-3 select-none ${
              isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer group'
            }`}
          >
            <div className="relative flex items-center justify-center mt-0.5">
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={isSelected}
                disabled={isDisabled}
                onChange={() => onChange(opt.value)}
                className="sr-only peer"
              />
              <div
                className={`w-5 h-5 rounded-full border transition-all flex items-center justify-center ${
                  isSelected
                    ? 'border-indigo-600 dark:border-indigo-500 bg-white dark:bg-slate-900'
                    : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 group-hover:border-slate-400'
                }`}
              >
                {isSelected && (
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-500" />
                )}
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {opt.label}
              </span>
              {opt.description && (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {opt.description}
                </span>
              )}
            </div>
          </label>
        );
      })}
    </div>
  );
};
