import React from 'react';

export type CardVariant = 'default' | 'interactive' | 'selected' | 'danger' | 'success' | 'glass';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  hoverEffect?: boolean;
}

const cardVariantStyles: Record<CardVariant, string> = {
  default:
    'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs',
  interactive:
    'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer',
  selected:
    'bg-indigo-50/50 dark:bg-indigo-950/20 border-2 border-indigo-600 dark:border-indigo-500 shadow-sm',
  danger:
    'bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900',
  success:
    'bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900',
  glass:
    'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 shadow-xs',
};

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  hoverEffect = false,
  className = '',
  children,
  ...rest
}) => {
  return (
    <div
      className={`rounded-2xl overflow-hidden transition-all duration-200 ${
        cardVariantStyles[variant]
      } ${hoverEffect ? 'hover:-translate-y-0.5' : ''} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...rest
}) => (
  <div className={`p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800/60 ${className}`} {...rest}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className = '',
  children,
  ...rest
}) => (
  <h3 className={`text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight ${className}`} {...rest}>
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
  <div className={`p-5 sm:p-6 ${className}`} {...rest}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...rest
}) => (
  <div className={`p-5 sm:p-6 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-3 ${className}`} {...rest}>
    {children}
  </div>
);
