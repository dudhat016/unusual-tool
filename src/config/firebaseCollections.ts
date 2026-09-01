/**
 * Centralized Firebase Firestore Collection Registry.
 * Single source of truth for all database collection names across services.
 */
export const FIREBASE_COLLECTIONS = {
  TOOLS: 'tools',
  CATEGORIES: 'categories',
  SEO: 'seo',
  BLOG_POSTS: 'blog_posts',
  PLANS: 'plans',
  SYSTEM_SETTINGS: 'system_settings',
  USER_PROFILES: 'user_profiles',
  ANALYTICS: 'analytics',
  FAVORITES: 'favorites',
} as const;
