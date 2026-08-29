import React, { forwardRef, useRef } from 'react';
import { Icon, IconName } from './Icon';
import { Loader2, CheckCircle2, LucideIcon } from 'lucide-react';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  inputSize?: 'sm' | 'md' | 'lg';
  variant?: 'outline' | 'filled' | 'ghost';
  leftIcon?: IconName | React.ReactNode | LucideIcon;
  rightIcon?: IconName | React.ReactNode | LucideIcon;
  rightAction?: React.ReactNode;
  error?: boolean | string;
  helperText?: string;
  clearable?: boolean;
  onClear?: () => void;
  isLoading?: boolean;
  isSuccess?: boolean;
  required?: boolean;
}

const inputSizeStyles = {
  sm: 'px-3.5 py-2 text-xs rounded-xl',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-4.5 py-3.5 text-base rounded-2xl',
};

const variantStyles = {
  outline: 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700',
  filled: 'bg-slate-100 dark:bg-slate-800/80 border-transparent focus:bg-white dark:focus:bg-slate-900',
  ghost: 'bg-transparent border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      size = 'md',
      inputSize,
      variant = 'outline',
      leftIcon,
      rightIcon,
      rightAction,
      error = false,
      helperText,
      clearable = false,
      onClear,
      isLoading = false,
      isSuccess = false,
      disabled = false,
      required = false,
      className = '',
      value,
      id,
      ...rest
    },
    ref
  ) => {
    const generatedId = useRef(`input-${Math.random().toString(36).substring(2, 7)}`).current;
    const inputId = id || generatedId;
    const helperId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;

    const finalSize = inputSize || size;
    const hasError = Boolean(error);
    const errorMessage = typeof error === 'string' ? error : undefined;

    const renderIcon = (iconItem: any) => {
      if (!iconItem) return null;
      if (typeof iconItem === 'string') {
        return <Icon name={iconItem} size={finalSize === 'sm' ? 14 : 16} aria-hidden="true" />;
      }
      if (React.isValidElement(iconItem)) {
        return iconItem;
      }
      if (
        typeof iconItem === 'function' ||
        (typeof iconItem === 'object' && iconItem !== null && ('render' in iconItem || '$$typeof' in iconItem))
      ) {
        return React.createElement(iconItem, { className: 'w-4 h-4 shrink-0 text-slate-400', 'aria-hidden': 'true' });
      }
      return null;
    };

    const describedBy = errorMessage ? errorId : helperText ? helperId : undefined;

    return (
      <div className="w-full space-y-1.5">
        {(label || isLoading) && (
          <div className="flex items-center justify-between px-0.5">
            {label && (
              <label htmlFor={inputId} className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
                {label}
                {required && <span className="text-rose-500 ml-1">*</span>}
              </label>
            )}
            {isLoading && <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" aria-hidden="true" />}
          </div>
        )}

        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center justify-center pointer-events-none text-slate-400 dark:text-slate-500">
              {renderIcon(leftIcon)}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled || isLoading}
            value={value}
            required={required}
            aria-invalid={hasError ? 'true' : undefined}
            aria-describedby={describedBy}
            className={`w-full border text-slate-900 dark:text-white font-medium transition-all duration-150 focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 ${
              inputSizeStyles[finalSize]
            } ${variantStyles[variant]} ${leftIcon ? 'pl-10' : ''} ${
              rightIcon || rightAction || (clearable && value) || isLoading || isSuccess ? 'pr-11' : ''
            } ${
              hasError
                ? 'border-rose-400 dark:border-rose-800 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/10'
                : isSuccess
                ? 'border-emerald-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                : 'hover:border-slate-400 dark:hover:border-slate-600 focus:border-primary focus:ring-2 focus:ring-primary/20'
            } ${
              disabled
                ? 'opacity-50 bg-slate-50 dark:bg-slate-800/60 cursor-not-allowed pointer-events-none'
                : ''
            } ${className}`}
            {...rest}
          />

          {clearable && Boolean(value) && !disabled && !isLoading && (
            <button
              type="button"
              onClick={onClear}
              className="absolute right-3.5 p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              aria-label="Clear input"
            >
              <Icon name="X" size={14} aria-hidden="true" />
            </button>
          )}

          {!clearable && (
            <div className="absolute right-3.5 flex items-center gap-2">
              {isLoading && !rightAction && <Loader2 className="w-4 h-4 text-primary animate-spin" aria-hidden="true" />}
              {isSuccess && !isLoading && <CheckCircle2 className="w-4 h-4 text-emerald-500" aria-hidden="true" />}
              {rightIcon && !isLoading && !isSuccess && renderIcon(rightIcon)}
              {rightAction && <div>{rightAction}</div>}
            </div>
          )}
        </div>

        {errorMessage ? (
          <p id={errorId} className="text-xs text-rose-500 dark:text-rose-400 font-extrabold px-0.5">{errorMessage}</p>
        ) : helperText ? (
          <p id={helperId} className="text-xs text-slate-500 dark:text-slate-400 font-medium px-0.5">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
