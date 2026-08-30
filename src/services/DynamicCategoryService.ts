import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { CATEGORIES_REGISTRY } from '../config/categoryData';
import { CategorySeoEntry } from '../types/seo';

const STORAGE_KEY = 'aetherpix_categories_cache_v1';

export class DynamicCategoryService {
  private static categoriesCache: CategorySeoEntry[] = [];
  private static isInitialized = false;
  private static unsubscribeFirestore: Unsubscribe | null = null;
  private static listeners: Set<(categories: CategorySeoEntry[]) => void> = new Set();

  public static init(): CategorySeoEntry[] {
    if (this.isInitialized && this.categoriesCache.length > 0) {
      return this.categoriesCache;
    }

    // 1. Check local cache
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

    if (this.categoriesCache.length === 0) {
      this.categoriesCache = [...CATEGORIES_REGISTRY];
      this.saveToStorage(this.categoriesCache);
    }

    this.isInitialized = true;

    if (typeof window !== 'undefined' && !this.unsubscribeFirestore) {
      this.startFirestoreListener();
    }

    return this.categoriesCache;
  }

  private static startFirestoreListener() {
    try {
      const col = collection(db, 'categories');
      this.unsubscribeFirestore = onSnapshot(
        col,
        (snapshot) => {
          if (!snapshot.empty) {
            const catMap = new Map<string, CategorySeoEntry>();
            CATEGORIES_REGISTRY.forEach((c) => catMap.set(c.id, c));
            snapshot.docs.forEach((d) => {
              catMap.set(d.id, d.data() as CategorySeoEntry);
            });
            this.categoriesCache = Array.from(catMap.values());
            this.saveToStorage(this.categoriesCache);
            this.notifyListeners();
          } else {
            this.seedCategoriesToFirestore();
          }
        },
        (error) => {
          console.warn('Firestore categories subscription notice:', error);
        }
      );
    } catch (e) {
      console.warn('Could not start Firestore categories listener', e);
    }
  }

  private static async seedCategoriesToFirestore() {
    try {
      for (const cat of CATEGORIES_REGISTRY) {
        await setDoc(doc(db, 'categories', cat.id), cat, { merge: true });
      }
    } catch (e) {
      console.warn('Could not seed categories to Firestore', e);
    }
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

  public static subscribe(callback: (categories: CategorySeoEntry[]) => void): () => void {
    this.init();
    this.listeners.add(callback);
    callback(this.categoriesCache);
    return () => {
      this.listeners.delete(callback);
    };
  }

  public static getAllCategories(): CategorySeoEntry[] {
    if (!this.isInitialized || this.categoriesCache.length === 0) {
      this.init();
    }
    return this.categoriesCache;
  }

  public static getCategoryBySlug(slug: string): CategorySeoEntry | undefined {
    const categories = this.getAllCategories();
    const clean = slug.replace(/^\/+|\/+$/g, '').toLowerCase();
    if (clean === 'tools' || clean === 'all-tools' || clean === 'all' || clean === 'tool') {
      return categories.find((c) => c.id === 'image-tools') || CATEGORIES_REGISTRY[0];
    }
    return categories.find(
      (c) => c.slug.toLowerCase() === clean || c.id.toLowerCase() === clean
    );
  }

  public static async saveCategory(category: CategorySeoEntry): Promise<boolean> {
    try {
      const docRef = doc(db, 'categories', category.id);
      await setDoc(docRef, category, { merge: true });
      return true;
    } catch (e) {
      console.error('Failed to save category to Firestore', e);
      return false;
    }
  }
}
