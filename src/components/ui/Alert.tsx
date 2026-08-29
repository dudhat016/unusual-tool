import React from 'react';
import { Icon } from './Icon';
import { IconButton } from './IconButton';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps {
  variant?: AlertVariant;
  title?: React.ReactNode;
  children: React.ReactNode;
  onDismiss?: () => void;
  action?: React.ReactNode;
  className?: string;
}

const variantStyles: Record<AlertVariant, { container: string; icon: string; iconName: string }> = {
  info: {
    container: 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800/60 text-sky-900 dark:text-sky-200',
    icon: 'text-sky-600 dark:text-sky-400',
    iconName: 'Info',
  },
  success: {
    container: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200',
    icon: 'text-emerald-600 dark:text-emerald-400',
    iconName: 'CheckCircle2',
  },
  warning: {
    container: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200',
    icon: 'text-amber-600 dark:text-amber-400',
    iconName: 'AlertTriangle',
  },
  error: {
    container: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-200',
    icon: 'text-rose-600 dark:text-rose-400',
    iconName: 'AlertCircle',
  },
};

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  onDismiss,
  action,
  className = '',
}) => {
  const conf = variantStyles[variant];

  return (
    <div
      role="alert"
      className={`relative flex items-start gap-3 p-4 rounded-2xl border ${conf.container} ${className}`}
    >
      <div className={`mt-0.5 shrink-0 ${conf.icon}`}>
        <Icon name={conf.iconName} size={20} />
      </div>

      <div className="flex-1 min-w-0">
        {title && <h4 className="text-sm font-bold tracking-tight mb-1">{title}</h4>}
        <div className="text-xs sm:text-sm leading-relaxed opacity-90">{children}</div>
        {action && <div className="mt-3">{action}</div>}
      </div>

      {onDismiss && (
        <IconButton
          icon="X"
          aria-label="Dismiss alert"
          size="xs"
          variant="ghost"
          onClick={onDismiss}
          className="shrink-0 -mr-1.5 -mt-1.5 opacity-60 hover:opacity-100"
        />
      )}
    </div>
  );
};
