import React from 'react';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeConfig = {
  sm: { track: 'w-8 h-4.5', thumb: 'w-3.5 h-3.5', translate: 'translate-x-3.5 rtl:-translate-x-3.5' },
  md: { track: 'w-11 h-6', thumb: 'w-4.5 h-4.5', translate: 'translate-x-5 rtl:-translate-x-5' },
  lg: { track: 'w-14 h-7.5', thumb: 'w-6 h-6', translate: 'translate-x-6.5 rtl:-translate-x-6.5' },
};

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  size = 'md',
  className = '',
}) => {
  const cfg = sizeConfig[size];

  return (
    <label
      className={`inline-flex items-start gap-3 select-none ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${className}`}
    >
      <div className="relative inline-flex items-center mt-0.5">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className={`${cfg.track} rounded-full transition-colors duration-200 ease-in-out p-0.5 ${
            checked
              ? 'bg-primary'
              : 'bg-slate-300 dark:bg-slate-700'
          }`}
        >
          <div
            className={`${cfg.thumb} rounded-full bg-white shadow-sm transform transition-transform duration-200 ease-in-out ${
              checked ? cfg.translate : 'translate-x-0'
            }`}
          />
        </div>
      </div>

      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
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
};
