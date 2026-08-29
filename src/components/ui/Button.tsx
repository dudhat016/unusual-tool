import React, { forwardRef } from 'react';
import { Spinner } from './Spinner';
import { Icon, IconName } from './Icon';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'destructive'
  | 'success'
  | 'link'
  | 'premium';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: IconName | React.ReactNode;
  rightIcon?: IconName | React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow active:bg-indigo-800 focus-visible:ring-indigo-500 border border-transparent dark:bg-indigo-600 dark:hover:bg-indigo-500',
  secondary:
    'bg-slate-100 hover:bg-slate-200 text-slate-800 active:bg-slate-300 focus-visible:ring-slate-400 border border-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700',
  outline:
    'bg-transparent hover:bg-slate-100/80 text-slate-700 active:bg-slate-200/60 focus-visible:ring-slate-400 border border-slate-300 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-800',
  ghost:
    'bg-transparent hover:bg-slate-100 text-slate-700 active:bg-slate-200 focus-visible:ring-slate-400 border border-transparent dark:text-slate-300 dark:hover:bg-slate-800/80',
  destructive:
    'bg-rose-600 hover:bg-rose-700 text-white shadow-sm active:bg-rose-800 focus-visible:ring-rose-500 border border-transparent dark:bg-rose-600 dark:hover:bg-rose-500',
  success:
    'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm active:bg-emerald-800 focus-visible:ring-emerald-500 border border-transparent dark:bg-emerald-600 dark:hover:bg-emerald-500',
  link:
    'bg-transparent text-indigo-600 hover:text-indigo-700 underline-offset-4 hover:underline p-0 h-auto border-none focus-visible:ring-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300',
  premium:
    'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-sm active:opacity-90 focus-visible:ring-amber-500 border border-transparent',
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: 'px-2.5 py-1 text-xs rounded-lg gap-1.5 font-medium',
  sm: 'px-3.5 py-1.5 text-xs font-semibold rounded-xl gap-2',
  md: 'px-4.5 py-2.5 text-sm font-semibold rounded-xl gap-2',
  lg: 'px-6 py-3 text-base font-semibold rounded-2xl gap-2.5',
  xl: 'px-7 py-3.5 text-lg font-bold rounded-2xl gap-3',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled = false,
      className = '',
      children,
      type = 'button',
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={`inline-flex items-center justify-center transition-all duration-150 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${
          variantStyles[variant]
        } ${variant !== 'link' ? sizeStyles[size] : ''} ${
          fullWidth ? 'w-full' : ''
        } ${
          isDisabled
            ? 'opacity-50 cursor-not-allowed pointer-events-none shadow-none'
            : ''
        } ${className}`}
        {...rest}
      >
        {loading && <Spinner size={size === 'xs' || size === 'sm' ? 'xs' : 'sm'} />}
        {!loading && leftIcon && (
          typeof leftIcon === 'string' ? (
            <Icon name={leftIcon} size={size === 'xs' ? 14 : size === 'sm' ? 16 : 18} />
          ) : (
            leftIcon
          )
        )}
        {children && <span className="truncate">{children}</span>}
        {!loading && rightIcon && (
          typeof rightIcon === 'string' ? (
            <Icon name={rightIcon} size={size === 'xs' ? 14 : size === 'sm' ? 16 : 18} />
          ) : (
            rightIcon
          )
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
