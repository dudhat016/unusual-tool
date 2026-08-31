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
   * Initializes tool catalog from localStorage cache and Firestore (Firestore is source of truth).
   */
  public static init(): ToolDefinition[] {
    if (this.isInitialized && this.toolsCache.length > 0) {
      return this.toolsCache;
    }

    // Load from localStorage cache (last known Firestore state)
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

    this.isInitialized = true;

    // Start live Firestore listener in browser environment
    if (typeof window !== 'undefined' && !this.unsubscribeFirestore) {
      this.startFirestoreListener();
    }

    return this.toolsCache;
  }

  /**
   * Realtime Firestore listener — Firestore is the single source of truth.
   */
  private static startFirestoreListener() {
    try {
      const toolsCol = collection(db, 'tools');
      this.unsubscribeFirestore = onSnapshot(
        toolsCol,
        (snapshot) => {
          if (!snapshot.empty) {
            const firestoreTools: (ToolDefinition & { isDeleted?: boolean })[] = snapshot.docs.map((d) => d.data() as any);

            // Build tool map purely from Firestore — no static merge
            const toolMap = new Map<string, ToolDefinition>();
            firestoreTools.forEach((t) => {
              if (!t.isDeleted) {
                toolMap.set(t.id, t);
              }
            });

            const tools = Array.from(toolMap.values());
            this.toolsCache = tools;
            this.saveToStorage(tools);
            this.notifyListeners();
          }
          // If Firestore collection is empty, keep whatever is in localStorage cache
        },
        (error) => {
          console.warn('Firestore tools listener error:', error);
        }
      );
    } catch (e) {
      console.warn('Could not establish Firestore tools listener', e);
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
    const cleanSlug = slug.replace(/^\/+|\/+$/g, '');
    const segments = cleanSlug.split('/');
    const lastSegment = segments[segments.length - 1];

    // 1. Direct match on full cleanSlug (e.g., category/tool or tool)
    const directMatch = tools.find(
      (t) => t.slug === cleanSlug || t.id === cleanSlug || t.route === `/${cleanSlug}`
    );
    if (directMatch) return directMatch;

    // 2. Match by last segment (tool slug/id)
    const segmentMatch = tools.find(
      (t) => t.slug === lastSegment || t.id === lastSegment || t.route === `/${lastSegment}`
    );
    if (segmentMatch) return segmentMatch;

    // 3. Dynamic virtual generator fallbacks (target size & format converters)
    const targetSizeTool = parseTargetSizeRoute(cleanSlug) || parseTargetSizeRoute(lastSegment);
    if (targetSizeTool) return targetSizeTool;

    return parseConverterRoute(cleanSlug) || parseConverterRoute(lastSegment);
  }

  /**
   * Look up a tool by its exact route or hierarchical category route.
   */
  public static getToolByRoute(route: string): ToolDefinition | undefined {
    const clean = route.replace(/^\/+|\/+$/g, '');
    return this.getToolBySlug(clean);
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
      // All tools are Firestore-managed: hard delete the document
      await deleteDoc(doc(db, 'tools', toolId));
    } catch (e) {
      console.warn('Failed to delete tool from Firestore', e);
      throw e;
    }

    return this.toolsCache.length < prevLen;
  }

  /**
   * Batch-writes an array of tools to Firestore (used by admin import).
   */
  public static async syncToolsToFirestore(toolsToSync: ToolDefinition[]): Promise<number> {
    this.init();
    try {
      const chunkSize = 25;
      for (let i = 0; i < toolsToSync.length; i += chunkSize) {
        const chunk = toolsToSync.slice(i, i + chunkSize);
        const batch = writeBatch(db);
        chunk.forEach((tool) => {
          const docRef = doc(db, 'tools', tool.id);
          batch.set(docRef, { ...tool, isDeleted: false }, { merge: true });
        });
        await batch.commit();
      }
      await this.refreshFromFirestore();
      return toolsToSync.length;
    } catch (e) {
      console.error('Error syncing tools to Firestore', e);
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
        firestoreTools.forEach((t) => {
          if (!t.isDeleted) {
            toolMap.set(t.id, t);
          }
        });
        const tools = Array.from(toolMap.values());
        this.toolsCache = tools;
        this.saveToStorage(tools);
        this.notifyListeners();
      }
    } catch (e) {
      console.error('Error refreshing tools from Firestore', e);
      throw e;
    }
    return this.toolsCache;
  }
}
