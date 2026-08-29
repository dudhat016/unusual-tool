import React, { createContext, useContext, useState, useCallback } from 'react';
import { Icon } from './Icon';
import { IconButton } from './IconButton';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => string;
  removeToast: (id: string) => void;
  toast: {
    success: (message: string, title?: string) => void;
    error: (message: string, title?: string) => void;
    info: (message: string, title?: string) => void;
    warning: (message: string, title?: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<ToastItem, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      const duration = toast.duration ?? 4000;
      const newToast: ToastItem = { ...toast, id };

      setToasts((prev) => [...prev.slice(-4), newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  const toastHelpers = {
    success: (message: string, title?: string) =>
      addToast({ type: 'success', message, title }),
    error: (message: string, title?: string) =>
      addToast({ type: 'error', message, title }),
    info: (message: string, title?: string) =>
      addToast({ type: 'info', message, title }),
    warning: (message: string, title?: string) =>
      addToast({ type: 'warning', message, title }),
  };

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        toast: toastHelpers,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
};

const toastIconMap = {
  success: { name: 'CheckCircle2', color: 'text-emerald-500' },
  error: { name: 'AlertCircle', color: 'text-rose-500' },
  info: { name: 'Info', color: 'text-sky-500' },
  warning: { name: 'AlertTriangle', color: 'text-amber-500' },
};

const ToastContainer: React.FC<{
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 rtl:right-auto rtl:left-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none select-none">
      {toasts.map((t) => {
        const iconCfg = toastIconMap[t.type];

        return (
          <div
            key={t.id}
            className="pointer-events-auto flex items-start gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl animate-in slide-in-from-bottom-5 duration-200"
          >
            <div className={`shrink-0 mt-0.5 ${iconCfg.color}`}>
              <Icon name={iconCfg.name} size={18} />
            </div>

            <div className="flex-1 min-w-0">
              {t.title && (
                <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                  {t.title}
                </h5>
              )}
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
                {t.message}
              </p>
            </div>

            <IconButton
              icon="X"
              aria-label="Close notification"
              size="xs"
              variant="ghost"
              onClick={() => onRemove(t.id)}
              className="shrink-0 -mr-1 -mt-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            />
          </div>
        );
      })}
    </div>
  );
};
