import React from 'react';
import { Icon } from './Icon';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try Again',
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-3xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
        <Icon name="AlertTriangle" size={28} />
      </div>

      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mt-1 mb-6 leading-relaxed">
        {message}
      </p>

      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} leftIcon="RotateCw">
          {retryLabel}
        </Button>
      )}
    </div>
  );
};
