import React, { forwardRef } from 'react';
import { Icon, IconName } from './Icon';
import { Spinner } from './Spinner';
import { ButtonVariant, ButtonSize } from './Button';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName | React.ReactNode | React.ComponentType<{ className?: string }> | any;
  'aria-label': string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  tooltip?: string;
}

const iconSizeStyles: Record<ButtonSize, string> = {
  xs: 'p-1 w-6 h-6 rounded-md',
  sm: 'p-1.5 w-8 h-8 rounded-lg',
  md: 'p-2 w-10 h-10 rounded-xl',
  lg: 'p-2.5 w-12 h-12 rounded-xl',
  xl: 'p-3 w-14 h-14 rounded-2xl',
  icon: 'p-2 w-10 h-10 rounded-xl',
};

const iconPixelSizes: Record<ButtonSize, number> = {
  xs: 12,
  sm: 15,
  md: 18,
  lg: 22,
  xl: 26,
  icon: 18,
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon,
      'aria-label': ariaLabel,
      variant = 'ghost',
      size = 'md',
      loading = false,
      disabled = false,
      className = '',
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
        aria-label={ariaLabel || 'Button'}
        aria-busy={loading ? 'true' : undefined}
        disabled={isDisabled}
        className={`inline-flex items-center justify-center transition-all duration-150 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${
          iconSizeStyles[size]
        } ${
          variant === 'primary'
            ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
            : variant === 'secondary'
            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
            : variant === 'outline'
            ? 'border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            : variant === 'destructive'
            ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
        } ${isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''} ${className}`}
        {...rest}
      >
        {loading ? (
          <Spinner size={size === 'xs' || size === 'sm' ? 'xs' : 'sm'} />
        ) : typeof icon === 'string' ? (
          <Icon name={icon} size={iconPixelSizes[size]} aria-hidden="true" />
        ) : React.isValidElement(icon) ? (
          React.cloneElement(icon as React.ReactElement<any>, { 'aria-hidden': 'true' })
        ) : typeof icon === 'function' || (typeof icon === 'object' && icon !== null) ? (
          React.createElement(icon as any, {
            className: 'w-4 h-4 shrink-0',
            'aria-hidden': 'true',
          })
        ) : null}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';
