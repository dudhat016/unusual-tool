export type TextDirection = 'auto' | 'ltr' | 'rtl';
export type FontFamilyOption = 'system' | 'sans' | 'serif' | 'mono';
export type FontSizeOption = 'sm' | 'base' | 'lg' | 'xl';
export type LineHeightOption = 'compact' | 'normal' | 'relaxed';
export type SaveStatusState = 'saved' | 'saving' | 'unsaved' | 'error';

export interface EditorFontSettings {
  fontFamily: FontFamilyOption;
  fontSize: FontSizeOption;
  lineHeight: LineHeightOption;
}

export interface Note {
  id: string;
  title: string;
  content: string; // HTML content
  plainText: string; // Extracted plain text for search and fast metrics
  createdAt: number;
  updatedAt: number;
  isPinned: boolean;
  isTrashed: boolean;
  trashedAt?: number;
  direction?: TextDirection;
  tags?: string[];
  fontSettings?: Partial<EditorFontSettings>;
}

export interface WritingStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  paragraphs: number;
  sentences: number;
  readingTimeMinutes: number;
  speakingTimeMinutes: number;
}

export interface FindReplaceState {
  isOpen: boolean;
  findText: string;
  replaceText: string;
  caseSensitive: boolean;
  matchCount: number;
  currentMatchIndex: number;
}
