import React, { forwardRef } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean | string;
  helperText?: string;
  maxCharacters?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      error = false,
      helperText,
      maxCharacters,
      disabled = false,
      className = '',
      value,
      ...rest
    },
    ref
  ) => {
    const hasError = Boolean(error);
    const errorMessage = typeof error === 'string' ? error : undefined;
    const currentLength = typeof value === 'string' ? value.length : 0;

    return (
      <div className="w-full space-y-1.5">
        <textarea
          ref={ref}
          disabled={disabled}
          value={value}
          className={`w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border rounded-xl p-3 text-sm transition-all duration-150 focus:outline-none focus:ring-2 placeholder:text-slate-400 dark:placeholder:text-slate-500 min-h-[90px] ${
            hasError
              ? 'border-rose-300 dark:border-rose-800 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/10'
              : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-indigo-500/20'
          } ${
            disabled
              ? 'opacity-50 bg-slate-50 dark:bg-slate-800/60 cursor-not-allowed pointer-events-none'
              : ''
          } ${className}`}
          {...rest}
        />

        <div className="flex justify-between items-center text-xs">
          {errorMessage ? (
            <p className="text-rose-500 dark:text-rose-400 font-medium">{errorMessage}</p>
          ) : helperText ? (
            <p className="text-slate-500 dark:text-slate-400">{helperText}</p>
          ) : (
            <span />
          )}

          {maxCharacters && (
            <span
              className={`font-mono ${
                currentLength > maxCharacters
                  ? 'text-rose-500 font-semibold'
                  : 'text-slate-400'
              }`}
            >
              {currentLength} / {maxCharacters}
            </span>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
