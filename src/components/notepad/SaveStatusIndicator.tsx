import React from 'react';
import { SaveStatusState } from '../../types/notepad';
import { Check, CloudOff, Loader2, AlertCircle } from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';

interface SaveStatusIndicatorProps {
  status: SaveStatusState;
  lastSavedTime?: number;
}

export const SaveStatusIndicator: React.FC<SaveStatusIndicatorProps> = ({
  status,
  lastSavedTime,
}) => {
  const getStatusContent = () => {
    switch (status) {
      case 'saving':
        return (
          <div className="inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Saving...</span>
          </div>
        );
      case 'unsaved':
        return (
          <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Unsaved changes</span>
          </div>
        );
      case 'error':
        return (
          <div className="inline-flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Storage issue</span>
          </div>
        );
      case 'saved':
      default:
        return (
          <div className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <Check className="w-3.5 h-3.5" />
            <span>Saved locally</span>
          </div>
        );
    }
  };

  const formattedTime = lastSavedTime
    ? new Date(lastSavedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'Just now';

  return (
    <Tooltip content={`Last saved: ${formattedTime} (Stored in browser memory only)`}>
      <div className="flex items-center gap-2 cursor-help px-2.5 py-1 rounded-lg bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 select-none">
        {getStatusContent()}
        <span className="text-[10px] text-slate-400 border-s border-slate-300 dark:border-slate-700 ps-1.5 hidden sm:inline-flex items-center gap-1">
          <CloudOff className="w-3 h-3" /> Offline safe
        </span>
      </div>
    </Tooltip>
  );
};
