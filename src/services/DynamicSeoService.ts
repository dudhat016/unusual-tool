import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { TOOL_SEO_DATABASE } from '../config/seoRegistry';
import { ToolSeoEntry } from '../types/seo';

const STORAGE_KEY = 'aetherpix_dynamic_seo_v1';
const SETTINGS_STORAGE_KEY = 'aetherpix_seo_settings_v1';

export interface GlobalSeoConfig {
  siteName: string;
  siteDomain: string;
  siteTagline: string;
  defaultMetaDescription: string;
  defaultOgImage: string;
  googleSiteVerification?: string;
  bingSiteVerification?: string;
  twitterHandle?: string;
  indexAllPages: boolean;
}

export const DEFAULT_GLOBAL_SEO: GlobalSeoConfig = {
  siteName: 'AetherPix Studio',
  siteDomain: 'https://aetherpix.studio',
  siteTagline: 'Free Online Image Utility Suite & Creator Tools',
  defaultMetaDescription: 'Free online image tools, photo compressor, resizer, converter, background remover, PDF tools, and text utilities with 100% private in-browser processing.',
  defaultOgImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
  googleSiteVerification: '',
  bingSiteVerification: '',
  twitterHandle: '@aetherpix',
  indexAllPages: true,
};

export class DynamicSeoService {
  private static seoEntriesCache: Record<string, Partial<ToolSeoEntry>> = {};
  private static globalConfigCache: GlobalSeoConfig = DEFAULT_GLOBAL_SEO;
  private static isInitialized = false;
  private static listeners: Set<(entries: Record<string, Partial<ToolSeoEntry>>) => void> = new Set();
  private static unsubscribeFirestore: Unsubscribe | null = null;

  public static init(): Record<string, Partial<ToolSeoEntry>> {
    if (this.isInitialized && Object.keys(this.seoEntriesCache).length > 0) {
      return this.seoEntriesCache;
    }

    // Load from local storage
    if (typeof localStorage !== 'undefined') {
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          this.seoEntriesCache = JSON.parse(cached);
        }
        const cachedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (cachedSettings) {
          this.globalConfigCache = JSON.parse(cachedSettings);
        }
      } catch (e) {
        console.warn('Error loading SEO cache', e);
      }
    }

    if (Object.keys(this.seoEntriesCache).length === 0) {
      this.seoEntriesCache = { ...TOOL_SEO_DATABASE };
      this.saveToStorage();
    }

    this.isInitialized = true;

    if (typeof window !== 'undefined' && !this.unsubscribeFirestore) {
      this.startFirestoreListener();
    }

    return this.seoEntriesCache;
  }

  private static startFirestoreListener() {
    try {
      const seoCol = collection(db, 'seo_entries');
      this.unsubscribeFirestore = onSnapshot(
        seoCol,
        (snapshot) => {
          if (!snapshot.empty) {
            const firestoreEntries: Record<string, Partial<ToolSeoEntry>> = {};
            snapshot.docs.forEach((d) => {
              firestoreEntries[d.id] = d.data() as Partial<ToolSeoEntry>;
            });

            // Merge with local baseline
            this.seoEntriesCache = {
              ...TOOL_SEO_DATABASE,
              ...this.seoEntriesCache,
              ...firestoreEntries,
            };
            this.saveToStorage();
            this.notifyListeners();
          }
        },
        (error) => {
          console.warn('Firestore SEO subscription notice:', error);
        }
      );

      // Also listen to global SEO settings
      const settingsRef = doc(db, 'seo_settings', 'global');
      getDoc(settingsRef).then((snap) => {
        if (snap.exists()) {
          this.globalConfigCache = { ...DEFAULT_GLOBAL_SEO, ...(snap.data() as GlobalSeoConfig) };
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(this.globalConfigCache));
          }
        }
      }).catch(console.warn);

    } catch (e) {
      console.warn('Could not start Firestore SEO listener', e);
    }
  }

  private static saveToStorage() {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.seoEntriesCache));
    } catch (e) {
      console.warn('Error saving SEO to localStorage', e);
    }
  }

  private static notifyListeners() {
    this.listeners.forEach((listener) => {
      try {
        listener(this.seoEntriesCache);
      } catch (e) {
        console.error('Error in SEO listener', e);
      }
    });
  }

  public static subscribe(callback: (entries: Record<string, Partial<ToolSeoEntry>>) => void): () => void {
    this.init();
    this.listeners.add(callback);
    callback(this.seoEntriesCache);
    return () => {
      this.listeners.delete(callback);
    };
  }

  public static getSeoForRoute(route: string): Partial<ToolSeoEntry> | undefined {
    this.init();
    const cleanRoute = route.replace(/\/+$/, '') || '/';
    const cleanSlug = cleanRoute.replace(/^\/+/, '');

    // Look for exact ID / route match
    if (this.seoEntriesCache[cleanSlug]) {
      return this.seoEntriesCache[cleanSlug];
    }

    // Search by canonicalUrl or slug match
    for (const key of Object.keys(this.seoEntriesCache)) {
      const entry = this.seoEntriesCache[key];
      if (
        entry.slug === cleanSlug ||
        entry.canonicalUrl === cleanRoute ||
        entry.canonicalUrl === `/${cleanSlug}` ||
        entry.id === cleanSlug
      ) {
        return entry;
      }
    }

    return undefined;
  }

  public static async saveSeoEntry(id: string, entry: Partial<ToolSeoEntry>): Promise<void> {
    this.init();
    this.seoEntriesCache[id] = { ...this.seoEntriesCache[id], ...entry, id };
    this.saveToStorage();
    this.notifyListeners();

    try {
      await setDoc(doc(db, 'seo_entries', id), this.seoEntriesCache[id], { merge: true });
    } catch (e) {
      console.error('Failed to save SEO entry to Firestore', e);
    }
  }

  public static async deleteSeoEntry(id: string): Promise<boolean> {
    this.init();
    delete this.seoEntriesCache[id];
    this.saveToStorage();
    this.notifyListeners();

    try {
      await deleteDoc(doc(db, 'seo_entries', id));
      return true;
    } catch (e) {
      console.warn('Failed to delete SEO entry in Firestore', e);
      return false;
    }
  }

  public static getAllSeoEntries(): Record<string, Partial<ToolSeoEntry>> {
    return this.init();
  }

  public static getGlobalConfig(): GlobalSeoConfig {
    this.init();
    return this.globalConfigCache;
  }

  public static async saveGlobalConfig(config: Partial<GlobalSeoConfig>): Promise<GlobalSeoConfig> {
    this.init();
    this.globalConfigCache = { ...this.globalConfigCache, ...config };
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(this.globalConfigCache));
    }

    try {
      await setDoc(doc(db, 'seo_settings', 'global'), this.globalConfigCache, { merge: true });
    } catch (e) {
      console.warn('Failed to save global SEO config to Firestore', e);
    }

    return this.globalConfigCache;
  }
}
