import { Unsubscribe } from 'firebase/firestore';
import { CategorySeoEntry } from '../types/seo';
import { STORAGE_KEYS } from '../config/storageKeys';
import { FIREBASE_COLLECTIONS } from '../config/firebaseCollections';
import { subscribeToFirestoreCollection, saveFirestoreDocument } from './FirestoreStreamHelper';

const STORAGE_KEY = STORAGE_KEYS.CATEGORIES_CACHE;

export class DynamicCategoryService {
  private static categoriesCache: CategorySeoEntry[] = [];
  private static isInitialized = false;
  private static unsubscribeFirestore: Unsubscribe | null = null;
  private static listeners: Set<(categories: CategorySeoEntry[]) => void> = new Set();

  /**
   * Initializes category catalog from localStorage cache and live Firebase Firestore.
   */
  public static init(): CategorySeoEntry[] {
    if (this.isInitialized && this.categoriesCache.length > 0) {
      return this.categoriesCache;
    }

    if (typeof localStorage !== 'undefined') {
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          this.categoriesCache = JSON.parse(cached);
        }
      } catch (e) {
        console.warn('Error reading categories from cache', e);
      }
    }

    this.isInitialized = true;

    if (typeof window !== 'undefined' && !this.unsubscribeFirestore) {
      this.startFirestoreListener();
    }

    return this.categoriesCache;
  }

  /**
   * Realtime Firestore listener — Firebase Firestore is the single source of truth for categories.
   */
  private static startFirestoreListener() {
    this.unsubscribeFirestore = subscribeToFirestoreCollection<CategorySeoEntry>(
      FIREBASE_COLLECTIONS.CATEGORIES,
      (items) => {
        this.categoriesCache = items;
        this.saveToStorage(items);
        this.notifyListeners();
      }
    );
  }

  private static saveToStorage(categories: CategorySeoEntry[]) {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
    } catch (e) {
      console.warn('Error saving categories to localStorage', e);
    }
  }

  private static notifyListeners() {
    this.listeners.forEach((l) => {
      try {
        l(this.categoriesCache);
      } catch (e) {
        console.warn('Listener error in categories', e);
      }
    });
  }

  /**
   * Subscribe to dynamic category updates.
   */
  public static subscribe(callback: (categories: CategorySeoEntry[]) => void): () => void {
    this.init();
    this.listeners.add(callback);
    callback(this.categoriesCache);
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Returns all dynamic categories.
   */
  public static getAllCategories(): CategorySeoEntry[] {
    if (!this.isInitialized || this.categoriesCache.length === 0) {
      this.init();
    }
    return this.categoriesCache;
  }

  /**
   * Look up a category by slug or ID dynamically from Firebase Firestore cache.
   */
  public static getCategoryBySlug(slug: string): CategorySeoEntry | undefined {
    const categories = this.getAllCategories();
    const clean = slug.replace(/^\/+|\/+$/g, '').toLowerCase();
    if (clean.includes('/') && !clean.startsWith('category/')) {
      return undefined;
    }
    if (clean === 'tools' || clean === 'all-tools' || clean === 'all' || clean === 'tool') {
      return categories.find((c) => c.id === 'image-tools') || categories[0];
    }

    // 1. Direct match on id, slug, or Firebase matchingCategories array
    const matched = categories.find(
      (c) =>
        c.slug.toLowerCase() === clean ||
        c.id.toLowerCase() === clean ||
        (c.matchingCategories && c.matchingCategories.some((m) => m.toLowerCase() === clean))
    );
    if (matched) return matched;

    // 2. Dynamic prefix/suffix match (e.g. /convert -> image-converter-tools, /resize -> image-resizer-tools)
    const stemmedMatch = categories.find(
      (c) =>
        c.slug.toLowerCase() === `${clean}-tools` ||
        c.slug.toLowerCase() === `image-${clean}-tools` ||
        c.id.toLowerCase() === `image-${clean}-tools` ||
        c.slug.toLowerCase().includes(clean)
    );
    if (stemmedMatch) return stemmedMatch;

    const targetId = clean.endsWith('-tools') ? clean : `${clean}-tools`;
    
    // Dynamic fallback structure for unseeded categories
    return {
      id: targetId,
      slug: clean,
      name: `${clean.replace(/-/g, ' ').toUpperCase()} Hub`,
      h1: `${clean.replace(/-/g, ' ').toUpperCase()} Utility Hub`,
      title: `${clean.replace(/-/g, ' ')} Tools – Free Online`,
      metaDescription: `Explore all online utilities in the ${clean.replace(/-/g, ' ')} category. 100% free and private.`,
      description: `Explore all online utilities in the ${clean.replace(/-/g, ' ')} category. 100% free and private.`,
      quickAnswer: `Access online utilities for ${clean.replace(/-/g, ' ')}.`,
      primaryKeyword: `${clean.replace(/-/g, ' ')} online`,
      secondaryKeywords: [`free ${clean.replace(/-/g, ' ')}`],
      toolSlugs: [],
      keyWorkflows: [`Use ${clean.replace(/-/g, ' ')} utilities`],
      faq: [{ question: `Is ${clean} free?`, answer: 'Yes, 100% free.' }],
      indexable: true,
    };
  }

  /**
   * Save or update a category document in Firestore (Admin action).
   */
  public static async saveCategory(category: CategorySeoEntry): Promise<boolean> {
    return saveFirestoreDocument<CategorySeoEntry>(FIREBASE_COLLECTIONS.CATEGORIES, category);
  }
}
