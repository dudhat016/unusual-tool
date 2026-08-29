import React from 'react';
import { Icon, IconName } from './Icon';

export interface ChipProps {
  label: React.ReactNode;
  icon?: IconName;
  selected?: boolean;
  onSelect?: () => void;
  onRemove?: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  icon,
  selected = false,
  onSelect,
  onRemove,
  disabled = false,
  size = 'md',
  className = '',
}) => {
  return (
    <span
      onClick={!disabled && onSelect ? onSelect : undefined}
      className={`inline-flex items-center gap-1.5 font-medium transition-all select-none border whitespace-nowrap ${
        size === 'sm'
          ? 'px-2.5 py-0.5 text-xs rounded-lg'
          : 'px-3 py-1 text-xs rounded-xl'
      } ${
        selected
          ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
          : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
      } ${onSelect && !disabled ? 'cursor-pointer' : ''} ${
        disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
      } ${className}`}
    >
      {icon && (
        <Icon
          name={icon}
          size={12}
          className={selected ? 'text-white' : 'text-slate-500 dark:text-slate-400'}
        />
      )}
      <span>{label}</span>

      {onRemove && !disabled && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className={`p-0.5 rounded-full hover:bg-black/10 transition-colors ${
            selected ? 'text-white' : 'text-slate-400 hover:text-slate-600'
          }`}
          aria-label="Remove"
        >
          <Icon name="X" size={10} />
        </button>
      )}
    </span>
  );
};
