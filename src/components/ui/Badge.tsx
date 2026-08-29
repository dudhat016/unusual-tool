import React from 'react';
import { Icon, IconName } from './Icon';

export type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'premium'
  | 'outline';

export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: IconName;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  default:
    'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700',
  secondary:
    'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-800/60',
  success:
    'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/60',
  warning:
    'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/60',
  danger:
    'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/60',
  info:
    'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200/60 dark:border-sky-800/60',
  premium:
    'bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-700 dark:text-amber-300 border-amber-300/40 dark:border-amber-700/40',
  outline:
    'bg-transparent text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700',
};

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-slate-400',
  secondary: 'bg-indigo-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
  info: 'bg-sky-500',
  premium: 'bg-amber-500',
  outline: 'bg-slate-400',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[10px] gap-1 rounded-md font-semibold',
  md: 'px-2.5 py-0.5 text-xs gap-1.5 rounded-lg font-semibold',
  lg: 'px-3 py-1 text-sm gap-2 rounded-xl font-bold',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  icon,
  dot = false,
  className = '',
  children,
  ...rest
}) => {
  return (
    <span
      className={`inline-flex items-center justify-center border select-none whitespace-nowrap leading-none ${
        variantStyles[variant]
      } ${sizeStyles[size]} ${className}`}
      {...rest}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />
      )}
      {icon && <Icon name={icon} size={size === 'sm' ? 10 : size === 'lg' ? 14 : 12} />}
      <span>{children}</span>
    </span>
  );
};
