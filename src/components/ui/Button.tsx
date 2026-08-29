import React, { forwardRef } from 'react';
import { Spinner } from './Spinner';
import { Icon, IconName } from './Icon';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'destructive'
  | 'danger'
  | 'success'
  | 'link'
  | 'premium'
  | 'gradient'
  | 'white'
  | 'soft';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  loading?: boolean;
  isLoading?: boolean;
  leftIcon?: IconName | React.ReactNode | React.ElementType;
  rightIcon?: IconName | React.ReactNode | React.ElementType;
  fullWidth?: boolean;
  as?: any;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-primary-foreground shadow-md shadow-primary/25 hover:bg-primary/90 active:scale-[0.99] border border-transparent',
  secondary:
    'bg-slate-100 hover:bg-slate-200 text-slate-900 active:bg-slate-300 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 dark:border-slate-700',
  outline:
    'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 hover:border-primary hover:bg-primary/10',
  ghost:
    'bg-transparent hover:bg-primary/10 text-slate-700 dark:text-slate-300 hover:text-primary border border-transparent',
  destructive:
    'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20 active:scale-[0.99] border border-transparent',
  danger:
    'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20 active:scale-[0.99] border border-transparent',
  success:
    'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 active:scale-[0.99] border border-transparent',
  white:
    'bg-white text-slate-900 shadow-lg hover:bg-slate-50 border border-slate-200',
  soft:
    'bg-primary/10 text-primary hover:bg-primary/20 border border-transparent',
  gradient:
    'bg-gradient-to-r from-primary via-primary/80 to-primary/60 text-primary-foreground shadow-md shadow-primary/30 hover:opacity-95 border border-transparent',
  premium:
    'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-md active:opacity-90 border border-transparent',
  link:
    'bg-transparent text-primary hover:underline underline-offset-4 p-0 h-auto border-none shadow-none font-semibold',
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: 'px-2.5 py-1 text-xs rounded-lg gap-1.5 font-bold uppercase tracking-wider',
  sm: 'h-9 px-3.5 text-xs font-bold uppercase tracking-wider rounded-xl gap-2',
  md: 'h-11 px-5 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl gap-2',
  lg: 'h-13 px-6 text-sm sm:text-base font-extrabold uppercase tracking-wider rounded-2xl gap-2.5',
  xl: 'h-15 px-8 text-base sm:text-lg font-black uppercase tracking-widest rounded-2xl gap-3',
  icon: 'h-10 w-10 p-0 flex items-center justify-center rounded-xl',
};

const roundedStyles = {
  none: 'rounded-none',
  sm: 'rounded-lg',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  xl: 'rounded-2xl',
  full: 'rounded-full',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      rounded = 'md',
      fullWidth = false,
      leftIcon,
      rightIcon,
      isLoading = false,
      loading,
      disabled = false,
      className = '',
      children,
      type = 'button',
      as: Component = 'button',
      ...rest
    },
    ref
  ) => {
    const isBusy = Boolean(loading || isLoading);
    const isDisabled = disabled || isBusy;

    const renderIcon = (iconItem: any) => {
      if (!iconItem) return null;
      if (React.isValidElement(iconItem)) {
        return React.cloneElement(iconItem as React.ReactElement<any>, { 'aria-hidden': 'true' });
      }
      if (typeof iconItem === 'string') {
        return <Icon name={iconItem} size={size === 'xs' ? 14 : size === 'sm' ? 15 : 18} />;
      }
      if (typeof iconItem === 'function' || typeof iconItem === 'object') {
        return React.createElement(iconItem as React.ComponentType<{ className?: string; 'aria-hidden'?: string }>, {
          className: 'w-4 h-4 shrink-0',
          'aria-hidden': 'true',
        });
      }
      return null;
    };

    return (
      <Component
        ref={ref}
        type={Component === 'button' ? type : undefined}
        disabled={isDisabled}
        aria-busy={isBusy ? 'true' : undefined}
        className={`inline-flex items-center justify-center transition-all duration-150 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
          variantStyles[variant]
        } ${variant !== 'link' ? sizeStyles[size] : ''} ${
          rounded ? roundedStyles[rounded] : ''
        } ${fullWidth ? 'w-full' : ''} ${
          isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none shadow-none' : ''
        } ${className}`}
        {...(rest as any)}
      >
        {isBusy ? (
          <Spinner size={size === 'xs' || size === 'sm' ? 'xs' : 'sm'} />
        ) : (
          <>
            {renderIcon(leftIcon)}
            {children && <span className="truncate">{children}</span>}
            {renderIcon(rightIcon)}
          </>
        )}
      </Component>
    );
  }
);

Button.displayName = 'Button';
export default Button;
