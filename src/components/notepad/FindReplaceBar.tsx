import React, { useEffect, useRef } from 'react';
import { FindReplaceState } from '../../types/notepad';
import { Search, Replace, ChevronUp, ChevronDown, X, CaseSensitive } from 'lucide-react';

interface FindReplaceBarProps {
  state: FindReplaceState;
  onChange: (updates: Partial<FindReplaceState>) => void;
  onFindNext: () => void;
  onFindPrev: () => void;
  onReplaceCurrent: () => void;
  onReplaceAll: () => void;
  onClose: () => void;
}

export const FindReplaceBar: React.FC<FindReplaceBarProps> = ({
  state,
  onChange,
  onFindNext,
  onFindPrev,
  onReplaceCurrent,
  onReplaceAll,
  onClose,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.isOpen && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [state.isOpen]);

  if (!state.isOpen) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shadow-lg text-xs z-30 transition-all">
      {/* Find input */}
      <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1">
        <Search className="w-3.5 h-3.5 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          value={state.findText}
          onChange={(e) => onChange({ findText: e.target.value })}
          placeholder="Find in note..."
          className="bg-transparent border-none outline-none text-slate-900 dark:text-white w-32 sm:w-44 text-xs"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              if (e.shiftKey) onFindPrev();
              else onFindNext();
            }
            if (e.key === 'Escape') onClose();
          }}
        />
        {state.findText && (
          <span className="text-[10px] text-slate-400 font-mono">
            {state.matchCount > 0
              ? `${state.currentMatchIndex + 1}/${state.matchCount}`
              : '0/0'}
          </span>
        )}
      </div>

      {/* Case Sensitive Toggle */}
      <button
        type="button"
        onClick={() => onChange({ caseSensitive: !state.caseSensitive })}
        className={`p-1.5 rounded-lg border transition-colors ${
          state.caseSensitive
            ? 'bg-purple-100 dark:bg-purple-950 border-purple-400 text-purple-700 dark:text-purple-300 font-bold'
            : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
        title="Match Case"
      >
        <CaseSensitive className="w-3.5 h-3.5" />
      </button>

      {/* Prev / Next Buttons */}
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={onFindPrev}
          disabled={state.matchCount === 0}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
          title="Previous Match (Shift+Enter)"
        >
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={onFindNext}
          disabled={state.matchCount === 0}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
          title="Next Match (Enter)"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Replace input */}
      <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1">
        <Replace className="w-3.5 h-3.5 text-slate-400" />
        <input
          type="text"
          value={state.replaceText}
          onChange={(e) => onChange({ replaceText: e.target.value })}
          placeholder="Replace with..."
          className="bg-transparent border-none outline-none text-slate-900 dark:text-white w-32 sm:w-44 text-xs"
          onKeyDown={(e) => {
            if (e.key === 'Enter') onReplaceCurrent();
            if (e.key === 'Escape') onClose();
          }}
        />
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onReplaceCurrent}
          disabled={state.matchCount === 0}
          className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold disabled:opacity-40"
        >
          Replace
        </button>
        <button
          type="button"
          onClick={onReplaceAll}
          disabled={state.matchCount === 0}
          className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold disabled:opacity-40"
        >
          Replace All
        </button>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="ms-auto p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
