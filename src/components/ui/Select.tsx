import React, { forwardRef, useState, useRef, useEffect } from 'react';
import { Icon } from './Icon';
import { ChevronDown, Search, X, Check, LucideIcon } from 'lucide-react';
import { Input } from './Input';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
  description?: string;
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  options: SelectOption[];
  size?: 'sm' | 'md' | 'lg';
  error?: boolean | string;
  helperText?: string;
}

const selectSizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-3.5 py-2 text-sm rounded-xl',
  lg: 'px-4.5 py-2.5 text-base rounded-xl',
};

// 1. Primary UI Select Component powered by CustomSelect dropdown
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      options = [],
      size = 'md',
      error = false,
      helperText,
      disabled = false,
      className = '',
      value,
      onChange,
      placeholder,
      id,
      name,
    },
    _ref
  ) => {
    const handleChange = (val: any) => {
      if (onChange) {
        const syntheticEvent = {
          target: { value: val, id, name },
          currentTarget: { value: val, id, name },
        } as React.ChangeEvent<HTMLSelectElement>;
        onChange(syntheticEvent);
      }
    };

    return (
      <div className="w-full">
        <CustomSelect
          options={options}
          value={value !== undefined && value !== null ? String(value) : ''}
          onChange={handleChange}
          disabled={disabled}
          error={typeof error === 'string' ? error : undefined}
          placeholder={placeholder}
          className={className}
        />
        {helperText && !error && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

// 2. Promptly Rich Interactive Custom Dropdown Select Component
export interface CustomSelectProps {
  options: SelectOption[];
  value: string | string[];
  onChange: (value: any) => void;
  placeholder?: string;
  label?: string;
  isMulti?: boolean;
  isSearchable?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option...',
  label,
  isMulti = false,
  isSearchable = false,
  error,
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (opt.description && opt.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedOptions = isMulti
    ? options.filter((opt) => Array.isArray(value) && value.includes(opt.value))
    : options.find((opt) => opt.value === value);

  const toggleOption = (optValue: string) => {
    if (isMulti) {
      const current = Array.isArray(value) ? value : [];
      const updated = current.includes(optValue)
        ? current.filter((v) => v !== optValue)
        : [...current, optValue];
      onChange(updated);
    } else {
      onChange(optValue);
      setIsOpen(false);
    }
  };

  const removeOption = (e: React.MouseEvent, optValue: string) => {
    e.stopPropagation();
    if (isMulti && Array.isArray(value)) {
      onChange(value.filter((v) => v !== optValue));
    }
  };

  return (
    <div className={`relative w-full space-y-1.5 ${className}`} ref={containerRef}>
      {label && <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">{label}</label>}

      {/* Trigger Box */}
      <div
        role="button"
        aria-expanded={isOpen}
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            !disabled && setIsOpen(!isOpen);
          }
        }}
        className={`flex min-h-[44px] w-full items-center justify-between rounded-xl border bg-white dark:bg-slate-900 px-4 py-2 text-sm transition-all cursor-pointer ${
          error
            ? 'border-rose-400 focus:border-rose-500'
            : isOpen
            ? 'border-primary ring-2 ring-primary/20'
            : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
        } ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
      >
        <div className="flex flex-wrap gap-1.5 flex-1 min-w-0 items-center">
          {isMulti ? (
            Array.isArray(selectedOptions) && selectedOptions.length > 0 ? (
              selectedOptions.map((opt) => (
                <span
                  key={opt.value}
                  className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-0.5 rounded-lg text-xs font-bold"
                >
                  {opt.label}
                  <X
                    className="w-3.5 h-3.5 hover:bg-primary/20 rounded-full cursor-pointer transition-colors p-0.5"
                    onClick={(e) => removeOption(e, opt.value)}
                  />
                </span>
              ))
            ) : (
              <span className="text-slate-400 dark:text-slate-500">{placeholder}</span>
            )
          ) : selectedOptions ? (
            <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white truncate">
              {(selectedOptions as SelectOption).icon &&
                React.createElement((selectedOptions as SelectOption).icon!, { className: 'w-4 h-4 text-primary' })}
              <span>{(selectedOptions as SelectOption).label}</span>
            </div>
          ) : (
            <span className="text-slate-400 dark:text-slate-500">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ml-2 shrink-0 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
      </div>

      {error && <p className="text-xs font-semibold text-rose-500 px-1">{error}</p>}

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-1.5 animate-in fade-in zoom-in-95 duration-150">
          {isSearchable && (
            <div className="p-1.5">
              <div className="relative">
                <input
                  type="text"
                  autoFocus
                  className="w-full bg-slate-100 dark:bg-slate-800/60 border border-transparent rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-primary transition-all placeholder:text-slate-400"
                  placeholder="Search options..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>
          )}

          <div className="max-h-60 overflow-y-auto p-1 space-y-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = isMulti
                  ? Array.isArray(value) && value.includes(opt.value)
                  : value === opt.value;

                return (
                  <div
                    key={opt.value}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleOption(opt.value);
                    }}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20'
                        : 'hover:bg-primary/10 text-slate-800 dark:text-slate-200 hover:text-primary font-medium'
                    }`}
                  >
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2 truncate">
                        {opt.icon && React.createElement(opt.icon, { className: `w-4 h-4 shrink-0 ${isSelected ? 'text-primary-foreground' : 'text-primary'}` })}
                        <span className="truncate">{opt.label}</span>
                      </div>
                      {opt.description && (
                        <span className={`text-[10px] ${isSelected ? 'opacity-80' : 'text-slate-400'}`}>
                          {opt.description}
                        </span>
                      )}
                    </div>
                    {isSelected && <Check className="w-4 h-4 shrink-0 ml-2" />}
                  </div>
                );
              })
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">No matches found for "{searchTerm}"</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
