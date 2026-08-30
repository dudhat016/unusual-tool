import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
  Unsubscribe,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { ALL_TOOLS } from '../config/tools';
import { parseTargetSizeRoute } from '../config/targetSizeTools';
import { parseConverterRoute } from '../config/converterTools';
import { ToolDefinition } from '../types';

const STORAGE_KEY = 'aetherpix_dynamic_tools_v2';
const SYNC_TIMESTAMP_KEY = 'aetherpix_tools_last_synced';

export class DynamicToolService {
  private static toolsCache: ToolDefinition[] = [];
  private static isInitialized = false;
  private static listeners: Set<(tools: ToolDefinition[]) => void> = new Set();
  private static unsubscribeFirestore: Unsubscribe | null = null;

  /**
   * Initializes tool catalog from Local Storage & Firestore.
   */
  public static init(): ToolDefinition[] {
    if (this.isInitialized && this.toolsCache.length > 0) {
      return this.toolsCache;
    }

    // 1. Try local storage cache
    if (typeof localStorage !== 'undefined') {
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached) as ToolDefinition[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.toolsCache = parsed;
          }
        }
      } catch (e) {
        console.warn('Error reading tools from cache', e);
      }
    }

    // If cache is empty, populate from base registry
    if (this.toolsCache.length === 0) {
      this.toolsCache = [...ALL_TOOLS];
      this.saveToStorage(this.toolsCache);
    }

    this.isInitialized = true;

    // Start live Firestore listener in browser environment
    if (typeof window !== 'undefined' && !this.unsubscribeFirestore) {
      this.startFirestoreListener();
    }

    return this.toolsCache;
  }

  /**
   * Realtime Firestore listener for live admin tool mutations.
   */
  private static startFirestoreListener() {
    try {
      const toolsCol = collection(db, 'tools');
      this.unsubscribeFirestore = onSnapshot(
        toolsCol,
        (snapshot) => {
          if (!snapshot.empty) {
            const firestoreTools: (ToolDefinition & { isDeleted?: boolean })[] = snapshot.docs.map((d) => d.data() as any);
            
            // Merge firestore tools with base tools so no dynamic route parser is broken
            const toolMap = new Map<string, ToolDefinition>();
            // Add base tools first
            ALL_TOOLS.forEach((t) => toolMap.set(t.id, t));
            // Apply firestore tools on top (or delete if marked isDeleted)
            firestoreTools.forEach((t) => {
              if (t.isDeleted) {
                toolMap.delete(t.id);
              } else {
                toolMap.set(t.id, t);
              }
            });

            const merged = Array.from(toolMap.values());
            this.toolsCache = merged;
            this.saveToStorage(merged);
            this.notifyListeners();
          } else {
            // If firestore tools collection is empty, retain local baseline tools
            if (this.toolsCache.length === 0) {
              this.toolsCache = [...ALL_TOOLS];
              this.saveToStorage(this.toolsCache);
              this.notifyListeners();
            }
          }
        },
        (error) => {
          console.warn('Firestore tools subscription warning (using local fallback):', error);
        }
      );
    } catch (e) {
      console.warn('Could not establish Firestore tools listener', e);
    }
  }

  /**
   * Seeds Firestore with baseline tools catalog if collection is empty.
   */
  public static async seedFirestoreWithBaseTools(): Promise<void> {
    try {
      const snap = await getDocs(collection(db, 'tools'));
      if (snap.empty) {
        // Batch write first 30 essential tools to avoid exceeding write limits
        const batch = writeBatch(db);
        const seedBatch = ALL_TOOLS.slice(0, 30);
        seedBatch.forEach((tool) => {
          const docRef = doc(db, 'tools', tool.id);
          batch.set(docRef, tool, { merge: true });
        });
        await batch.commit();
      }
    } catch (e) {
      console.warn('Seed tools to Firestore warning:', e);
    }
  }

  private static saveToStorage(tools: ToolDefinition[]) {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tools));
      localStorage.setItem(SYNC_TIMESTAMP_KEY, Date.now().toString());
    } catch (e) {
      console.warn('Error saving tools to localStorage', e);
    }
  }

  private static notifyListeners() {
    this.listeners.forEach((listener) => {
      try {
        listener(this.toolsCache);
      } catch (e) {
        console.error('Error in tool change listener', e);
      }
    });
  }

  /**
   * Subscribe to dynamic tool updates.
   */
  public static subscribe(callback: (tools: ToolDefinition[]) => void): () => void {
    this.init();
    this.listeners.add(callback);
    callback(this.toolsCache);

    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Returns all dynamic tools.
   */
  public static getAllTools(): ToolDefinition[] {
    return this.init();
  }

  /**
   * Look up a tool by slug or route dynamically.
   */
  public static getToolBySlug(slug: string): ToolDefinition | undefined {
    const tools = this.init();
    const cleanSlug = slug.replace(/^\/+/, '');
    const found = tools.find(
      (t) => t.slug === cleanSlug || t.id === cleanSlug || t.route === `/${cleanSlug}`
    );
    if (found) return found;

    // Dynamic virtual generator fallbacks
    const targetSizeTool = parseTargetSizeRoute(cleanSlug);
    if (targetSizeTool) return targetSizeTool;

    return parseConverterRoute(cleanSlug);
  }

  /**
   * Look up a tool by its exact route.
   */
  public static getToolByRoute(route: string): ToolDefinition | undefined {
    const tools = this.init();
    const clean = route.replace(/\/+$/, '') || '/';
    const found = tools.find(
      (t) => t.route === clean || `/${t.slug}` === clean || `/${t.id}` === clean
    );
    if (found) return found;

    const targetSizeTool = parseTargetSizeRoute(clean);
    if (targetSizeTool) return targetSizeTool;

    return parseConverterRoute(clean);
  }

  /**
   * Look up a tool by its unique ID.
   */
  public static getToolById(id: string): ToolDefinition | undefined {
    const tools = this.init();
    return tools.find((t) => t.id === id);
  }

  /**
   * Filter tools by category.
   */
  public static getToolsByCategory(category: string): ToolDefinition[] {
    const tools = this.init();
    if (category === 'all') return tools;
    return tools.filter((t) => t.category === category || (category === 'ai' && t.isAi));
  }

  /**
   * Save or update a tool in Firestore & local cache (Admin action).
   */
  public static async saveTool(tool: ToolDefinition): Promise<ToolDefinition> {
    this.init();
    const cleanTool = { ...tool, isDeleted: false };
    const existingIndex = this.toolsCache.findIndex((t) => t.id === tool.id);

    if (existingIndex >= 0) {
      this.toolsCache[existingIndex] = { ...this.toolsCache[existingIndex], ...cleanTool };
    } else {
      this.toolsCache.unshift(cleanTool);
    }

    this.saveToStorage(this.toolsCache);
    this.notifyListeners();

    // Persist to Firestore
    try {
      await setDoc(doc(db, 'tools', tool.id), cleanTool, { merge: true });
    } catch (e) {
      console.error('Failed to save tool to Firestore', e);
      throw e;
    }

    return cleanTool;
  }

  /**
   * Update tool configuration (tier access, maintenance mode, etc.).
   */
  public static async updateToolConfig(
    toolId: string,
    updates: Partial<ToolDefinition>
  ): Promise<ToolDefinition | undefined> {
    this.init();
    const tool = this.toolsCache.find((t) => t.id === toolId);
    if (!tool) return undefined;

    const updated = { ...tool, ...updates };
    return this.saveTool(updated);
  }

  /**
   * Delete a tool from Firestore & local cache (Admin action).
   */
  public static async deleteTool(toolId: string): Promise<boolean> {
    this.init();
    const prevLen = this.toolsCache.length;
    this.toolsCache = this.toolsCache.filter((t) => t.id !== toolId);
    this.saveToStorage(this.toolsCache);
    this.notifyListeners();

    try {
      const isBaseTool = ALL_TOOLS.some((t) => t.id === toolId);
      if (isBaseTool) {
        // Base tool: write isDeleted: true to Firestore so listener won't revive it
        await setDoc(doc(db, 'tools', toolId), { id: toolId, isDeleted: true }, { merge: true });
      } else {
        await deleteDoc(doc(db, 'tools', toolId));
      }
    } catch (e) {
      console.warn('Failed to delete tool from Firestore', e);
      throw e;
    }

    return this.toolsCache.length < prevLen;
  }

  /**
   * Sync & seed all base tools from static registry directly to Firestore.
   */
  public static async syncAllBaseToolsToFirestore(): Promise<number> {
    this.init();
    try {
      // Chunk writes in batches of 25 to respect Firestore transaction limits
      const chunkSize = 25;
      for (let i = 0; i < ALL_TOOLS.length; i += chunkSize) {
        const chunk = ALL_TOOLS.slice(i, i + chunkSize);
        const batch = writeBatch(db);
        chunk.forEach((tool) => {
          const docRef = doc(db, 'tools', tool.id);
          batch.set(docRef, { ...tool, isDeleted: false }, { merge: true });
        });
        await batch.commit();
      }

      await this.refreshFromFirestore();
      return ALL_TOOLS.length;
    } catch (e) {
      console.error('Error syncing all tools to Firestore', e);
      throw e;
    }
  }

  /**
   * Manually force a refresh from the Firestore tools collection.
   */
  public static async refreshFromFirestore(): Promise<ToolDefinition[]> {
    this.init();
    try {
      const snap = await getDocs(collection(db, 'tools'));
      if (!snap.empty) {
        const firestoreTools: (ToolDefinition & { isDeleted?: boolean })[] = snap.docs.map((d) => d.data() as any);
        const toolMap = new Map<string, ToolDefinition>();
        ALL_TOOLS.forEach((t) => toolMap.set(t.id, t));
        firestoreTools.forEach((t) => {
          if (t.isDeleted) {
            toolMap.delete(t.id);
          } else {
            toolMap.set(t.id, t);
          }
        });
        const merged = Array.from(toolMap.values());
        this.toolsCache = merged;
        this.saveToStorage(merged);
        this.notifyListeners();
      }
    } catch (e) {
      console.error('Error refreshing tools from Firestore', e);
      throw e;
    }
    return this.toolsCache;
  }
}
