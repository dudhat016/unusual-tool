import React from 'react';

export interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  showValueBadge?: boolean;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit = '',
  label,
  disabled = false,
  className = '',
  showValueBadge = true,
}) => {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  return (
    <div className={`w-full space-y-2 select-none ${className}`}>
      {(label || showValueBadge) && (
        <div className="flex justify-between items-center text-xs">
          {label && (
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {label}
            </span>
          )}
          {showValueBadge && (
            <span className="font-mono font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
              {value}
              {unit}
            </span>
          )}
        </div>
      )}

      <div className="relative flex items-center w-full h-5">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: `linear-gradient(to right, hsl(var(--primary)) ${percentage}%, rgba(148, 163, 184, 0.25) ${percentage}%)`,
          }}
        />
      </div>

      <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
        <span>
          {min}
          {unit}
        </span>
        <span>
          {max}
          {unit}
        </span>
      </div>
    </div>
  );
};
