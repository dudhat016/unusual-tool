import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { SupportedLanguage, TextDirection, LanguageInfo } from './types';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY, getLanguageInfo } from './config';
import { en } from './locales/en';
import { hi } from './locales/hi';
import { es } from './locales/es';
import { fr } from './locales/fr';
import { de } from './locales/de';
import { pt } from './locales/pt';
import { it } from './locales/it';
import { ja } from './locales/ja';
import { ko } from './locales/ko';
import { zh } from './locales/zh';
import { ar } from './locales/ar';

export const LOCALES: Record<SupportedLanguage, any> = {
  en,
  hi,
  es,
  fr,
  de,
  pt,
  it,
  ja,
  ko,
  zh,
  ar,
};

export interface I18nContextType {
  language: SupportedLanguage;
  languageInfo: LanguageInfo;
  direction: TextDirection;
  isRtl: boolean;
  supportedLanguages: LanguageInfo[];
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  tPlural: (keySingular: string, keyPlural: string, count: number) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatBytes: (bytes: number, decimals?: number) => string;
  formatDate: (date: Date | number, options?: Intl.DateTimeFormatOptions) => string;
  formatCurrency: (amount: number, currency?: string) => string;
  getCompletionRate: (lang: SupportedLanguage) => number;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Helper function to resolve nested key e.g. "common.appName"
function getNestedValue(obj: any, path: string): any {
  if (!obj || typeof obj !== 'object') return undefined;
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return current;
}

// Calculate total key count in base dictionary for completion statistics
function countLeafKeys(obj: any): number {
  let count = 0;
  if (!obj || typeof obj !== 'object') return 0;
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      count += countLeafKeys(obj[key]);
    } else {
      count += 1;
    }
  }
  return count;
}

const TOTAL_BASE_KEYS = countLeafKeys(en);

export const LanguageProvider: React.FC<{
  children: React.ReactNode;
  userLanguage?: string | null;
  onLanguagePersist?: (lang: SupportedLanguage) => void;
}> = ({ children, userLanguage, onLanguagePersist }) => {
  // Detect language priority: 1. User prop / Firestore -> 2. LocalStorage -> 3. Browser -> 4. Default 'en'
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    if (userLanguage && userLanguage in LOCALES) {
      return userLanguage as SupportedLanguage;
    }
    try {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (stored && stored in LOCALES) {
        return stored as SupportedLanguage;
      }
    } catch {}

    if (typeof navigator !== 'undefined' && navigator.language) {
      const browserCode = navigator.language.split('-')[0].toLowerCase();
      if (browserCode in LOCALES) {
        return browserCode as SupportedLanguage;
      }
    }

    return DEFAULT_LANGUAGE;
  });

  const languageInfo = useMemo(() => getLanguageInfo(language), [language]);
  const direction: TextDirection = languageInfo.dir;
  const isRtl = direction === 'rtl';

  // Apply HTML lang and dir attributes globally
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
      document.documentElement.dir = direction;
      if (isRtl) {
        document.documentElement.classList.add('rtl');
      } else {
        document.documentElement.classList.remove('rtl');
      }
    }
  }, [language, direction, isRtl]);

  // Sync if external user profile language changes
  useEffect(() => {
    if (userLanguage && userLanguage in LOCALES && userLanguage !== language) {
      setLanguageState(userLanguage as SupportedLanguage);
    }
  }, [userLanguage]);

  const setLanguage = useCallback(
    (newLang: SupportedLanguage) => {
      if (!newLang || !(newLang in LOCALES)) return;
      setLanguageState(newLang);
      try {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, newLang);
      } catch {}
      if (onLanguagePersist) {
        onLanguagePersist(newLang);
      }
    },
    [onLanguagePersist]
  );

  // Translation function with parameter interpolation and fallback
  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      // 1. Check current locale
      let text = getNestedValue(LOCALES[language], key);

      // 2. Fallback to English if missing
      if (text === undefined || text === null) {
        text = getNestedValue(LOCALES[DEFAULT_LANGUAGE], key);
      }

      // 3. Fallback to key itself if missing everywhere
      if (text === undefined || text === null) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[i18n] Missing translation for key: "${key}" in language: "${language}"`);
        }
        return key;
      }

      if (typeof text !== 'string') {
        return String(text);
      }

      // 4. Interpolate parameters e.g. {size}, {count}
      if (params) {
        return Object.keys(params).reduce((acc, paramKey) => {
          const regex = new RegExp(`\\{${paramKey}\\}`, 'g');
          return acc.replace(regex, String(params[paramKey]));
        }, text);
      }

      return text;
    },
    [language]
  );

  // Pluralization helper
  const tPlural = useCallback(
    (keySingular: string, keyPlural: string, count: number): string => {
      const key = Math.abs(count) === 1 ? keySingular : keyPlural;
      return t(key, { count });
    },
    [t]
  );

  // Locale-aware number formatting
  const formatNumber = useCallback(
    (value: number, options?: Intl.NumberFormatOptions): string => {
      try {
        return new Intl.NumberFormat(language, options).format(value);
      } catch {
        return value.toString();
      }
    },
    [language]
  );

  // Locale-aware byte formatting (e.g. 5.2 MB)
  const formatBytes = useCallback(
    (bytes: number, decimals: number = 2): string => {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
      const val = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));
      return `${formatNumber(val)} ${sizes[i]}`;
    },
    [formatNumber]
  );

  // Locale-aware date formatting
  const formatDate = useCallback(
    (date: Date | number, options?: Intl.DateTimeFormatOptions): string => {
      try {
        const d = typeof date === 'number' ? new Date(date) : date;
        return new Intl.DateTimeFormat(language, options || { dateStyle: 'medium', timeStyle: 'short' }).format(d);
      } catch {
        return String(date);
      }
    },
    [language]
  );

  // Locale-aware currency formatting
  const formatCurrency = useCallback(
    (amount: number, currency: string = 'USD'): string => {
      try {
        return new Intl.NumberFormat(language, {
          style: 'currency',
          currency,
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }).format(amount);
      } catch {
        return `$${amount}`;
      }
    },
    [language]
  );

  // Calculate translation completion rate
  const getCompletionRate = useCallback((lang: SupportedLanguage): number => {
    if (lang === 'en') return 100;
    const targetObj = LOCALES[lang];
    if (!targetObj) return 0;
    const count = countLeafKeys(targetObj);
    return Math.min(100, Math.round((count / TOTAL_BASE_KEYS) * 100));
  }, []);

  return (
    <I18nContext.Provider
      value={{
        language,
        languageInfo,
        direction,
        isRtl,
        supportedLanguages: SUPPORTED_LANGUAGES,
        setLanguage,
        t,
        tPlural,
        formatNumber,
        formatBytes,
        formatDate,
        formatCurrency,
        getCompletionRate,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};

export * from './types';
export * from './config';
export * from './glossary';
