import React, { forwardRef } from 'react';

export type CardVariant = 'default' | 'outline' | 'glass' | 'ghost' | 'raised' | 'flat' | 'interactive' | 'selected' | 'danger' | 'success';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverEffect?: boolean;
  interactive?: boolean;
}

const cardVariants: Record<CardVariant, string> = {
  default: 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm',
  outline: 'bg-transparent border-2 border-slate-200 dark:border-slate-800',
  glass: 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/60 shadow-xl',
  ghost: 'bg-transparent border-transparent shadow-none',
  raised: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-900/5 dark:shadow-black/30',
  flat: 'bg-slate-50 dark:bg-slate-850/40 border border-slate-200/60 dark:border-slate-800/50 shadow-none',
  interactive: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-primary hover:shadow-lg transition-all cursor-pointer',
  selected: 'bg-primary/10 border-2 border-primary shadow-sm',
  danger: 'bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900',
  success: 'bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900',
};

const paddings = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      hoverEffect = false,
      interactive = false,
      className = '',
      children,
      ...rest
    },
    ref
  ) => {
    const isClickable = interactive || hoverEffect || variant === 'interactive';
    return (
      <div
        ref={ref}
        className={`rounded-3xl border transition-all duration-200 flex flex-col ${
          cardVariants[variant]
        } ${paddings[padding]} ${
          isClickable ? 'cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:border-primary/50' : ''
        } ${className}`}
        {...rest}
      >
        {children}
      </div>
    );
  }
) as React.ForwardRefExoticComponent<CardProps & React.RefAttributes<HTMLDivElement>> & {
  Header: typeof CardHeader;
  Body: typeof CardContent;
  Footer: typeof CardFooter;
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement> & { title?: React.ReactNode; subtitle?: React.ReactNode; action?: React.ReactNode }> = ({
  title,
  subtitle,
  action,
  className = '',
  children,
  ...rest
}) => (
  <div className={`px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-4 ${className}`} {...rest}>
    <div className="flex-1 min-w-0">
      {title && <h3 className="text-base font-black text-slate-900 dark:text-white truncate">{title}</h3>}
      {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{subtitle}</p>}
      {children}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className = '',
  children,
  ...rest
}) => (
  <h3 className={`text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight ${className}`} {...rest}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className = '',
  children,
  ...rest
}) => (
  <p className={`text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed ${className}`} {...rest}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...rest
}) => (
  <div className={`p-6 flex-1 ${className}`} {...rest}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...rest
}) => (
  <div className={`px-6 py-4 bg-slate-50/50 dark:bg-slate-850/40 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3 ${className}`} {...rest}>
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Body = CardContent;
Card.Footer = CardFooter;

Card.displayName = 'Card';
export default Card;
