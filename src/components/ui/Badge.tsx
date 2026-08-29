import React from 'react';
import { Icon, IconName } from './Icon';

export type BadgeVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'premium'
  | 'outline'
  | 'purple'
  | 'gradient'
  | 'default';

export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: IconName | React.ReactNode;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  default:
    'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700',
  primary:
    'bg-primary/10 text-primary border-primary/20',
  purple:
    'bg-primary/10 text-primary border-primary/20',
  secondary:
    'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  success:
    'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  warning:
    'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  danger:
    'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  info:
    'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
  gradient:
    'bg-gradient-to-r from-primary to-primary/70 text-primary-foreground border-transparent shadow-xs',
  premium:
    'bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-700 dark:text-amber-300 border-amber-300/40 dark:border-amber-700/40',
  outline:
    'bg-transparent text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700',
};

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-slate-400',
  primary: 'bg-primary',
  purple: 'bg-primary',
  secondary: 'bg-slate-400',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
  info: 'bg-sky-500',
  gradient: 'bg-white',
  premium: 'bg-amber-500',
  outline: 'bg-slate-400',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[10px] gap-1 rounded-md font-bold uppercase tracking-wider',
  md: 'px-2.5 py-0.5 text-xs gap-1.5 rounded-lg font-bold uppercase tracking-wider',
  lg: 'px-3.5 py-1 text-xs sm:text-sm gap-2 rounded-xl font-extrabold uppercase tracking-widest',
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
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant]}`} />}
      {icon &&
        (typeof icon === 'string' ? (
          <Icon name={icon} size={size === 'sm' ? 10 : size === 'lg' ? 14 : 12} />
        ) : (
          icon
        ))}
      {children && <span>{children}</span>}
    </span>
  );
};
export default Badge;
