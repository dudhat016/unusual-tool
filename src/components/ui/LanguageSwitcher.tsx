import React, { useState, useRef, useEffect } from 'react';
import { useTranslation, SupportedLanguage } from '../../i18n';
import { Icon } from './Icon';

export interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'compact' | 'segmented';
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'dropdown',
  className = '',
}) => {
  const { language, languageInfo, supportedLanguages, setLanguage, t, getCompletionRate } =
    useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (variant === 'compact') {
    return (
      <div ref={dropdownRef} className={`relative inline-block ${className}`}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={t('common.selectLanguage')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors shadow-xs"
        >
          <span className="text-sm leading-none">{languageInfo.flag}</span>
          <span className="uppercase font-mono text-[11px]">{language}</span>
          <Icon name="ChevronDown" size={12} className="text-slate-400" />
        </button>

        {isOpen && (
          <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-64 max-h-80 overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
              {t('common.selectLanguage')}
            </div>
            <div className="divide-y divide-slate-100/50 dark:divide-slate-800/40">
              {supportedLanguages.map((item) => {
                const isSelected = item.code === language;
                const completion = getCompletionRate(item.code as SupportedLanguage);

                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => {
                      setLanguage(item.code as SupportedLanguage);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl transition-colors cursor-pointer text-left rtl:text-right ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base leading-none">{item.flag}</span>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {item.nativeName}
                        </div>
                        <div className="text-[10px] text-slate-400">{item.name}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400">
                        {completion}%
                      </span>
                      {isSelected && (
                        <Icon name="Check" size={14} className="text-indigo-600 dark:text-indigo-400" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full dropdown
  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t('common.selectLanguage')}
        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 transition-all shadow-xs"
      >
        <span className="text-base leading-none">{languageInfo.flag}</span>
        <span className="truncate max-w-[100px]">{languageInfo.nativeName}</span>
        <Icon name="Globe" size={14} className="text-slate-400" />
        <Icon name="ChevronDown" size={12} className="text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-72 max-h-96 overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between px-3 py-2 text-xs font-bold text-slate-500 border-b border-slate-100 dark:border-slate-800">
            <span>{t('common.language')}</span>
            <span className="text-[10px] font-mono text-slate-400">
              {supportedLanguages.length} Available
            </span>
          </div>

          <div className="py-1 space-y-0.5">
            {supportedLanguages.map((item) => {
              const isSelected = item.code === language;
              const completion = getCompletionRate(item.code as SupportedLanguage);

              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => {
                    setLanguage(item.code as SupportedLanguage);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg leading-none">{item.flag}</span>
                    <div className="text-left rtl:text-right">
                      <div className={isSelected ? 'text-white' : 'text-slate-900 dark:text-slate-100'}>
                        {item.nativeName}
                      </div>
                      <div
                        className={`text-[10px] ${
                          isSelected ? 'text-indigo-200' : 'text-slate-400'
                        }`}
                      >
                        {item.name} {item.dir === 'rtl' ? '• RTL' : ''}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono ${
                        isSelected ? 'text-indigo-200' : 'text-slate-400'
                      }`}
                    >
                      {completion}%
                    </span>
                    {isSelected && <Icon name="Check" size={14} className="text-white" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
