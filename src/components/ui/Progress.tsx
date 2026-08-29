import React from 'react';

export interface ProgressProps {
  value: number; // 0 - 100
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  className?: string;
}

const heightStyles = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

const variantColors = {
  primary: 'bg-primary',
  success: 'bg-emerald-600 dark:bg-emerald-500',
  warning: 'bg-amber-500 dark:bg-amber-400',
  danger: 'bg-rose-600 dark:bg-rose-500',
};

export const Progress: React.FC<ProgressProps> = ({
  value,
  size = 'md',
  variant = 'primary',
  showLabel = false,
  label,
  animated = false,
  className = '',
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center text-xs font-semibold">
          <span className="text-slate-700 dark:text-slate-300">{label || 'Progress'}</span>
          <span className="font-mono text-slate-500 dark:text-slate-400">
            {Math.round(clampedValue)}%
          </span>
        </div>
      )}

      <div
        className={`w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden ${heightStyles[size]}`}
      >
        <div
          role="progressbar"
          aria-valuenow={clampedValue}
          aria-valuemin={0}
          aria-valuemax={100}
          style={{ width: `${clampedValue}%` }}
          className={`h-full rounded-full transition-all duration-300 ease-out ${
            variantColors[variant]
          } ${animated ? 'animate-pulse' : ''}`}
        />
      </div>
    </div>
  );
};
