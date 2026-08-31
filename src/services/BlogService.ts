import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { BlogPostItem } from '../types/blog';

const COLLECTION_NAME = 'blogs';
const STORAGE_KEY = 'aetherpix_blog_posts_v2';

export class BlogService {
  private static cachedPosts: BlogPostItem[] = [];
  private static isInitialized = false;
  private static listeners: Set<(posts: BlogPostItem[]) => void> = new Set();
  private static unsubscribeSnapshot: (() => void) | null = null;

  /**
   * Initializes real-time listener on the 'blogs' collection in Firestore
   */
  public static init(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // First load from localStorage for zero-latency initial render
    this.loadFromLocalStorage();

    // Start live Firestore listener on 'blogs' collection
    try {
      const blogsColRef = collection(db, COLLECTION_NAME);
      this.unsubscribeSnapshot = onSnapshot(
        blogsColRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const firestorePosts: BlogPostItem[] = snapshot.docs.map((docSnap) => {
              const data = docSnap.data() as BlogPostItem;
              return {
                ...data,
                id: docSnap.id || data.id,
              };
            });

            // Sort by publishedDate descending
            firestorePosts.sort((a, b) => {
              const dateA = new Date(a.publishedDate || a.updatedDate || '').getTime();
              const dateB = new Date(b.publishedDate || b.updatedDate || '').getTime();
              return dateB - dateA;
            });

            this.cachedPosts = firestorePosts;
            this.saveToLocalStorage(firestorePosts);
            this.notifyListeners();
          }
          // If empty — keep localStorage cache, no static fallback
        },
        (error) => {
          console.warn('Firestore onSnapshot listener note for blogs collection:', error);
        }
      );
    } catch (err) {
      console.warn('Failed to attach Firestore snapshot on blogs:', err);
    }
  }

  /**
   * Seed provided blog posts into Firestore (Admin action)
   */
  public static async seedBlogsToFirestore(posts: BlogPostItem[]): Promise<boolean> {
    try {
      const batch = writeBatch(db);
      for (const post of posts) {
        const postRef = doc(db, COLLECTION_NAME, post.id);
        batch.set(postRef, post, { merge: true });
      }
      await batch.commit();
      return true;
    } catch (e) {
      console.warn('Failed to seed blogs to Firestore:', e);
      return false;
    }
  }

  private static loadFromLocalStorage(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.cachedPosts = parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading blogs from localStorage:', e);
    }
  }

  private static saveToLocalStorage(posts: BlogPostItem[]): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    } catch (e) {
      console.warn('Error saving blogs to localStorage:', e);
    }
  }

  private static notifyListeners(): void {
    const postsCopy = [...this.cachedPosts];
    this.listeners.forEach((listener) => {
      try {
        listener(postsCopy);
      } catch (err) {
        console.error('Error in blog subscriber:', err);
      }
    });
  }

  /**
   * Subscribe to all blog posts changes from Firestore
   */
  public static subscribeAllPosts(callback: (posts: BlogPostItem[]) => void): () => void {
    this.init();
    this.listeners.add(callback);
    // Immediately emit current cached state
    callback([...this.cachedPosts]);

    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Subscribe to published blog posts changes from Firestore
   */
  public static subscribePublishedPosts(callback: (posts: BlogPostItem[]) => void): () => void {
    this.init();
    const wrappedCallback = (allPosts: BlogPostItem[]) => {
      const published = allPosts.filter((p) => p.status === 'published');
      callback(published);
    };

    this.listeners.add(wrappedCallback);
    // Immediately emit current published posts
    const currentPublished = this.cachedPosts.filter((p) => p.status === 'published');
    callback(currentPublished);

    return () => {
      this.listeners.delete(wrappedCallback);
    };
  }

  /**
   * Direct async fetch from Firestore 'blogs' collection
   */
  public static async fetchBlogsFromFirestore(): Promise<BlogPostItem[]> {
    this.init();
    try {
      const blogsColRef = collection(db, COLLECTION_NAME);
      const snapshot = await getDocs(blogsColRef);
      if (!snapshot.empty) {
        const posts: BlogPostItem[] = snapshot.docs.map((docSnap) => ({
          ...(docSnap.data() as BlogPostItem),
          id: docSnap.id,
        }));
        posts.sort((a, b) => {
          const dateA = new Date(a.publishedDate || a.updatedDate || '').getTime();
          const dateB = new Date(b.publishedDate || b.updatedDate || '').getTime();
          return dateB - dateA;
        });
        this.cachedPosts = posts;
        this.saveToLocalStorage(posts);
        this.notifyListeners();
        return posts;
        return [...this.cachedPosts];
      }
    } catch (error) {
      console.warn('Error fetching blogs from Firestore:', error);
      return this.getAllPosts();
    }
  }

  /**
   * Fetch a single post by slug from Firestore 'blogs' collection
   */
  public static async fetchPostBySlug(slug: string): Promise<BlogPostItem | null> {
    this.init();
    const cleanSlug = slug.replace(/^blog\//, '').replace(/^guides\//, '').replace(/^\/+|\/+$/g, '').toLowerCase();

    // Check memory cache first
    const cached = this.getPostBySlug(cleanSlug);
    if (cached) return cached;

    try {
      // Query by slug field in Firestore 'blogs'
      const blogsColRef = collection(db, COLLECTION_NAME);
      const q = query(blogsColRef, where('slug', '==', cleanSlug));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        const post = { ...(docSnap.data() as BlogPostItem), id: docSnap.id };
        // Update local cache
        const index = this.cachedPosts.findIndex((p) => p.id === post.id);
        if (index >= 0) {
          this.cachedPosts[index] = post;
        } else {
          this.cachedPosts.push(post);
        }
        this.saveToLocalStorage(this.cachedPosts);
        this.notifyListeners();
        return post;
      }

      // Check by doc ID
      const directDoc = await getDoc(doc(db, COLLECTION_NAME, cleanSlug));
      if (directDoc.exists()) {
        const post = { ...(directDoc.data() as BlogPostItem), id: directDoc.id };
        return post;
      }
    } catch (e) {
      console.warn(`Error fetching blog post by slug ${slug} from Firestore:`, e);
    }

    return this.getPostBySlug(cleanSlug) || null;
  }

  /**
   * Synchronous cached getters
   */
  public static getAllPosts(): BlogPostItem[] {
    this.init();
    return [...this.cachedPosts];
  }

  public static getPublishedPosts(): BlogPostItem[] {
    this.init();
    return this.cachedPosts.filter((p) => p.status === 'published');
  }

  public static getPostBySlug(slug: string): BlogPostItem | undefined {
    this.init();
    const cleanSlug = slug.replace(/^blog\//, '').replace(/^guides\//, '').replace(/^\/+|\/+$/g, '').toLowerCase();
    return this.cachedPosts.find(
      (p) => p.slug.toLowerCase() === cleanSlug || p.id.toLowerCase() === cleanSlug
    );
  }

  /**
   * Save / Create a blog post in Firestore 'blogs' collection
   */
  public static async savePost(post: BlogPostItem): Promise<BlogPostItem> {
    this.init();
    const cleanId = post.id || `blog_${Date.now()}`;
    const updatedPost: BlogPostItem = {
      ...post,
      id: cleanId,
      updatedDate: new Date().toISOString().split('T')[0],
    };

    // Update in-memory and local storage immediately
    const existingIndex = this.cachedPosts.findIndex((p) => p.id === cleanId);
    if (existingIndex >= 0) {
      this.cachedPosts[existingIndex] = updatedPost;
    } else {
      this.cachedPosts.unshift(updatedPost);
    }
    this.saveToLocalStorage(this.cachedPosts);
    this.notifyListeners();

    // Persist to Firestore 'blogs' collection
    try {
      const docRef = doc(db, COLLECTION_NAME, cleanId);
      await setDoc(docRef, updatedPost, { merge: true });
    } catch (err) {
      console.error('Failed to write blog post to Firestore:', err);
    }

    return updatedPost;
  }

  /**
   * Delete a blog post from Firestore 'blogs' collection
   */
  public static async deletePost(id: string): Promise<boolean> {
    this.init();
    const prevLength = this.cachedPosts.length;
    this.cachedPosts = this.cachedPosts.filter((p) => p.id !== id);
    this.saveToLocalStorage(this.cachedPosts);
    this.notifyListeners();

    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
      return true;
    } catch (err) {
      console.error('Failed to delete blog post from Firestore:', err);
      return this.cachedPosts.length < prevLength;
    }
  }

  /**
   * Toggle publication status in Firestore 'blogs' collection
   */
  public static async toggleStatus(id: string): Promise<BlogPostItem | undefined> {
    this.init();
    const post = this.cachedPosts.find((p) => p.id === id);
    if (!post) return undefined;

    const newStatus = post.status === 'published' ? 'draft' : 'published';
    const updatedDate = new Date().toISOString().split('T')[0];
    post.status = newStatus;
    post.updatedDate = updatedDate;

    this.saveToLocalStorage(this.cachedPosts);
    this.notifyListeners();

    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        status: newStatus,
        updatedDate: updatedDate,
      });
    } catch (err) {
      console.error('Failed to update blog status in Firestore:', err);
    }

    return post;
  }

  /**
   * Increment view counter for an article
   */
  public static async incrementViews(id: string): Promise<void> {
    this.init();
    const post = this.cachedPosts.find((p) => p.id === id);
    if (post) {
      const newViews = (post.views || 0) + 1;
      post.views = newViews;
      this.saveToLocalStorage(this.cachedPosts);

      try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, { views: newViews });
      } catch {
        // Silently tolerate view counter errors
      }
    }
  }
}
