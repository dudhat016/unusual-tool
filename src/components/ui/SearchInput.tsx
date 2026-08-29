import React, { forwardRef } from 'react';
import { Input, InputProps } from './Input';
import { Icon } from './Icon';

export interface SearchInputProps extends Omit<InputProps, 'leftIcon'> {
  shortcut?: string;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ shortcut = '⌘K', className = '', ...rest }, ref) => {
    return (
      <Input
        ref={ref}
        type="search"
        leftIcon={<Icon name="Search" size={18} />}
        rightIcon={
          shortcut ? (
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 select-none">
              {shortcut}
            </kbd>
          ) : undefined
        }
        className={className}
        {...rest}
      />
    );
  }
);

SearchInput.displayName = 'SearchInput';
