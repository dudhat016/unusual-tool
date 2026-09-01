import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export interface DarkModeToggleProps {
  /**
   * Display style variant of the toggle
   * @default 'icon'
   */
  variant?: 'icon' | 'switch' | 'segmented' | 'button';
  /**
   * Size multiplier for the control
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Whether to display text label alongside icon
   * @default false
   */
  showLabel?: boolean;
  /**
   * Additional custom CSS classes
   */
  className?: string;
  /**
   * Optional custom HTML id attribute
   */
  id?: string;
  /**
   * Show sync status tooltip or badge
   */
  showSyncBadge?: boolean;
  showSyncStatus?: boolean;
}

export const DarkModeToggle: React.FC<DarkModeToggleProps> = ({
  variant = 'icon',
  size = 'md',
  showLabel = false,
  className = '',
  id = 'global-dark-mode-toggle',
  showSyncBadge = false,
  showSyncStatus = false,
}) => {
  const resolvedShowBadge = showSyncBadge || showSyncStatus;
  const { theme, toggleTheme, setTheme, user } = useApp();
  const isDark = theme === 'dark';

  // Sizing maps
  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const buttonPadding = {
    sm: 'p-1.5 rounded-lg text-xs',
    md: 'p-2 rounded-xl text-sm',
    lg: 'p-2.5 rounded-2xl text-base',
  };

  // 1. SEGMENTED PILL VARIANT (Light / Dark / System)
  if (variant === 'segmented') {
    return (
      <div
        id={id}
        className={`inline-flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 ${className}`}
        role="group"
        aria-label="Theme selection"
      >
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            !isDark
              ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
          aria-pressed={!isDark}
        >
          <Sun className="w-3.5 h-3.5 text-amber-500" />
          <span>Light</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            isDark
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
          aria-pressed={isDark}
        >
          <Moon className="w-3.5 h-3.5 text-indigo-400" />
          <span>Dark</span>
        </button>
      </div>
    );
  }

  // 2. SWITCH / TOGGLE TRACK VARIANT
  if (variant === 'switch') {
    const switchSizes = {
      sm: { track: 'w-11 h-6', thumb: 'w-4 h-4', offset: 20 },
      md: { track: 'w-14 h-7.5', thumb: 'w-5 h-5', offset: 26 },
      lg: { track: 'w-16 h-9', thumb: 'w-6 h-6', offset: 28 },
    };
    const currentSize = switchSizes[size];

    return (
      <div className={`inline-flex items-center gap-2.5 ${className}`}>
        {showLabel && (
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 select-none">
            {isDark ? 'Dark Mode' : 'Light Mode'}
          </span>
        )}
        <button
          id={id}
          type="button"
          role="switch"
          aria-checked={isDark}
          aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          onClick={toggleTheme}
          className={`relative inline-flex items-center shrink-0 cursor-pointer rounded-full p-1 transition-colors duration-300 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary ${
            currentSize.track
          } ${
            isDark
              ? 'bg-slate-800 border border-slate-700'
              : 'bg-amber-100 border border-amber-300'
          }`}
        >
          <motion.span
            layout
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className={`pointer-events-none flex items-center justify-center rounded-full shadow-md transition-transform ${
              currentSize.thumb
            } ${
              isDark
                ? 'translate-x-full bg-slate-950 text-indigo-400'
                : 'translate-x-0 bg-white text-amber-500'
            }`}
          >
            {isDark ? (
              <Moon className={iconSizes[size]} />
            ) : (
              <Sun className={iconSizes[size]} />
            )}
          </motion.span>
        </button>
      </div>
    );
  }

  // 3. FULL BUTTON WITH LABEL VARIANT
  if (variant === 'button' || showLabel) {
    return (
      <button
        id={id}
        type="button"
        onClick={toggleTheme}
        className={`group inline-flex items-center gap-2 font-semibold transition-all duration-200 cursor-pointer border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary ${
          buttonPadding[size]
        } ${className}`}
        aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        title={isDark ? 'Switch to Light Mode (Cloud-synced)' : 'Switch to Dark Mode (Cloud-synced)'}
      >
        <motion.div
          key={isDark ? 'dark' : 'light'}
          initial={{ rotate: -90, scale: 0.8, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          exit={{ rotate: 90, scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
        >
          {isDark ? (
            <Sun className={`${iconSizes[size]} text-amber-400 group-hover:rotate-45 transition-transform duration-300`} />
          ) : (
            <Moon className={`${iconSizes[size]} text-indigo-500 group-hover:-rotate-12 transition-transform duration-300`} />
          )}
        </motion.div>

        <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>

        {showSyncBadge && user && (
          <span
            className="ml-auto inline-flex items-center gap-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full"
            title="Theme saved to your account"
          >
            <Check className="w-2.5 h-2.5" />
            <span>Synced</span>
          </span>
        )}
      </button>
    );
  }

  // 4. DEFAULT COMPACT ICON BUTTON VARIANT
  return (
    <motion.button
      id={id}
      type="button"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center transition-all duration-200 cursor-pointer border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/90 shadow-2xs focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary ${
        buttonPadding[size]
      } ${className}`}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={isDark ? 'dark-icon' : 'light-icon'}
          initial={{ y: -10, opacity: 0, rotate: -45 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 10, opacity: 0, rotate: 45 }}
          transition={{ duration: 0.18 }}
          className="flex items-center justify-center"
        >
          {isDark ? (
            <Sun className={`${iconSizes[size]} text-amber-400`} />
          ) : (
            <Moon className={`${iconSizes[size]} text-slate-700`} />
          )}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
};

export default DarkModeToggle;
