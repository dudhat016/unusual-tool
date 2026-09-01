/**
 * Centralized LocalStorage keys to prevent key mismatch, typos, and simplify cache invalidation.
 */
export const STORAGE_KEYS = {
  THEME: 'aetherpix_theme',
  PRIMARY_COLOR: 'aetherpix_primary_color',
  RADIUS: 'aetherpix_radius',
  SIDEBAR_THEME: 'aetherpix_sidebar_theme',
  HISTORY: 'aetherpix_history',
  FAVORITES: 'aetherpix_favorites',
  CATEGORIES_CACHE: 'aetherpix_categories_cache_v1',
  TOOLS_CACHE: 'aetherpix_tools_cache_v1',
  LANGUAGE: 'aetherpix_language_v1',
} as const;
