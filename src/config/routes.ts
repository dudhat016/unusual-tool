import { DEFAULT_LANGUAGE } from '../i18n/config';

/**
 * Centralized Route Registry for type-safe, locale-aware URL construction across the application.
 */
export const routes = {
  home: (locale: string = DEFAULT_LANGUAGE) => `/${locale}`,
  
  category: (slug: string, locale: string = DEFAULT_LANGUAGE) => {
    const cleanSlug = slug.replace(/^\/+|\/+$/g, '');
    return `/${locale}/${cleanSlug}`;
  },

  tool: (slug: string, categorySlug?: string, locale: string = DEFAULT_LANGUAGE) => {
    const cleanSlug = slug.replace(/^\/+|\/+$/g, '');
    if (categorySlug) {
      const cleanCat = categorySlug.replace(/^\/+|\/+$/g, '');
      return `/${locale}/${cleanCat}/${cleanSlug}`;
    }
    return `/${locale}/${cleanSlug}`;
  },

  blog: (slug?: string, locale: string = DEFAULT_LANGUAGE) => {
    if (slug) {
      const cleanSlug = slug.replace(/^\/+|\/+$/g, '');
      return `/${locale}/blog/${cleanSlug}`;
    }
    return `/${locale}/blog`;
  },

  trust: (page: string, locale: string = DEFAULT_LANGUAGE) => {
    const cleanPage = page.replace(/^\/+|\/+$/g, '');
    return `/${locale}/${cleanPage}`;
  },

  admin: () => '/admin',
  dashboard: () => '/dashboard',
  history: () => '/history',
};
