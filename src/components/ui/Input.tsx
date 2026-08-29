import React, { forwardRef } from 'react';
import { Icon, IconName } from './Icon';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: IconName | React.ReactNode;
  rightIcon?: IconName | React.ReactNode;
  error?: boolean | string;
  helperText?: string;
  clearable?: boolean;
  onClear?: () => void;
}

const inputSizeStyles = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-3.5 py-2 text-sm rounded-xl',
  lg: 'px-4.5 py-3 text-base rounded-xl',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = 'md',
      leftIcon,
      rightIcon,
      error = false,
      helperText,
      clearable = false,
      onClear,
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
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center justify-center pointer-events-none text-slate-400 dark:text-slate-500">
              {typeof leftIcon === 'string' ? <Icon name={leftIcon} size={18} /> : leftIcon}
            </div>
          )}

          <input
            ref={ref}
            disabled={disabled}
            value={value}
            className={`w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border transition-all duration-150 focus:outline-none focus:ring-2 placeholder:text-slate-400 dark:placeholder:text-slate-500 ${
              inputSizeStyles[size]
            } ${leftIcon ? 'pl-10 rtl:pl-3.5 rtl:pr-10' : ''} ${
              rightIcon || (clearable && value) ? 'pr-10 rtl:pr-3.5 rtl:pl-10' : ''
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
          />

          {clearable && Boolean(value) && !disabled && (
            <button
              type="button"
              onClick={onClear}
              className="absolute right-3 rtl:right-auto rtl:left-3 p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              aria-label="Clear input"
            >
              <Icon name="X" size={14} />
            </button>
          )}

          {rightIcon && (!clearable || !value) && (
            <div className="absolute right-3.5 rtl:right-auto rtl:left-3.5 flex items-center justify-center pointer-events-none text-slate-400 dark:text-slate-500">
              {typeof rightIcon === 'string' ? <Icon name={rightIcon} size={18} /> : rightIcon}
            </div>
          )}
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

Input.displayName = 'Input';
