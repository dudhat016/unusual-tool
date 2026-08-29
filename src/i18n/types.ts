export type SupportedLanguage = 
  | 'en' 
  | 'hi' 
  | 'es' 
  | 'fr' 
  | 'de' 
  | 'pt' 
  | 'it' 
  | 'ja' 
  | 'ko' 
  | 'zh' 
  | 'ar';

export type TextDirection = 'ltr' | 'rtl';

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  dir: TextDirection;
  flag: string;
  enabled: boolean;
  isDefault?: boolean;
}

export interface TranslationGlossaryTerm {
  key: string;
  en: string;
  definition: string;
}
