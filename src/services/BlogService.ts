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

// Rich seed blog posts for initial Firestore bootstrapping
export const SEED_BLOG_POSTS: BlogPostItem[] = [
  {
    id: 'how-to-compress-an-image',
    slug: 'how-to-compress-an-image',
    title: 'How to Compress an Image Without Losing Quality (2026 Guide)',
    excerpt: 'To compress an image without losing quality, choose WebP or target JPEG compression between 75%–85%. Use AetherPix Image Compressor to shrink file size by up to 90% right inside your browser.',
    contentHtml: `
      <p class="lead">To compress an image without losing quality, choose WebP or target JPEG compression between 75%–85%. Use AetherPix Image Compressor to shrink file size by up to 90% right inside your browser.</p>
      <h2>Understanding Image Lossy vs Lossless Compression</h2>
      <p>Image compression falls into two categories: Lossless (reduces file size without discarding visual pixels) and Lossy (selectively removes redundant high-frequency details).</p>
      <h2>Step-by-Step Compression Process</h2>
      <p>Follow these steps to minimize photo file size while maintaining pristine visual sharpness for web use.</p>
      <ol>
        <li>Upload your JPG or PNG image into the browser workspace.</li>
        <li>Select your compression level or target file size in KB/MB.</li>
        <li>Preview visual output and download the optimized asset instantly.</li>
      </ol>
      <h2>Recommended Web Formats in 2026</h2>
      <p>For modern web applications, WebP and AVIF provide up to 35% smaller file sizes than traditional JPEG at equivalent perceptual quality.</p>
    `,
    category: 'Format Guides',
    tags: ['image compression', 'reduce file size', 'webp converter', 'photo optimization'],
    author: {
      name: 'AetherPix Editorial Team',
      role: 'Digital Imaging Specialists',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    },
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    readTime: '4 min read',
    publishedDate: '2026-01-15',
    updatedDate: '2026-08-20',
    status: 'published',
    seo: {
      seoTitle: 'How to Compress an Image Without Losing Quality (2026 Guide)',
      metaDescription: 'Learn how to compress photos, PNGs, and JPEGs without quality loss using client-side WebAssembly tools.',
      h1Title: 'How to Compress an Image Without Losing Quality',
      canonicalUrl: 'https://aetherpix.studio/blog/how-to-compress-an-image',
    },
    views: 1420,
    featured: true,
    faqs: [
      {
        question: 'Does compression reduce photo resolution?',
        answer: 'Standard compression optimizes encoding algorithms and reduces byte size without changing pixel dimensions unless you also choose to resize.',
      },
      {
        question: 'Are my images uploaded to an external server?',
        answer: 'No. All AetherPix browser tools process images client-side directly on your device memory.',
      },
    ],
  },
  {
    id: 'how-to-convert-webp-to-png',
    slug: 'how-to-convert-webp-to-png',
    title: 'How to Convert WebP to PNG Images Online (Free & Instant)',
    excerpt: 'Convert WebP photos to transparent PNG or JPG format instantly using browser-based WebAssembly conversion.',
    contentHtml: `
      <p class="lead">Convert WebP photos to transparent PNG or JPG format instantly using browser-based WebAssembly conversion.</p>
      <h2>Why Convert WebP to PNG?</h2>
      <p>PNG offers universal support across legacy image editors, desktop graphic design suites, and printing platforms that do not natively handle WebP.</p>
      <h2>Preserving Alpha Transparency</h2>
      <p>When converting transparent WebP graphics, PNG-32 preserves 8-bit alpha channels for pixel-perfect transparency over any background.</p>
      <h2>Conversion Steps</h2>
      <p>Drop your WebP file into the converter, preserve alpha transparency, and download your standard PNG file in milliseconds.</p>
    `,
    category: 'Format Guides',
    tags: ['webp to png', 'convert image', 'image converter', 'transparency'],
    author: {
      name: 'AetherPix Editorial Team',
      role: 'Digital Imaging Specialists',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    },
    coverImage: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=1200&q=80',
    readTime: '3 min read',
    publishedDate: '2026-02-01',
    updatedDate: '2026-08-22',
    status: 'published',
    seo: {
      seoTitle: 'How to Convert WebP to PNG Images Online (Free & Instant)',
      metaDescription: 'Convert WebP to PNG online without losing transparency or image resolution.',
      h1Title: 'How to Convert WebP to PNG',
      canonicalUrl: 'https://aetherpix.studio/blog/how-to-convert-webp-to-png',
    },
    views: 980,
    featured: false,
    faqs: [
      {
        question: 'Will converting WebP to PNG increase file size?',
        answer: 'Yes, PNG files are typically larger because PNG uses lossless compression whereas WebP uses advanced predictive encoding.',
      },
    ],
  },
  {
    id: 'passport-photo-specifications-guide-2026',
    slug: 'passport-photo-specifications-guide-2026',
    title: 'Official Passport & Visa Photo Dimensions Guide (2026 Standards)',
    excerpt: 'Comprehensive guide to official passport, visa, and ID photo requirements for USA (2x2 in), India, Schengen, UK, and Canada.',
    contentHtml: `
      <p class="lead">Getting passport photos rejected due to lighting, background color, or wrong dimensions is common. Here is the verified dimension and composition standard for international travel credentials.</p>
      <h2>Key International Dimensions</h2>
      <ul>
        <li><strong>United States & India Visa:</strong> 2 x 2 inches (51 x 51 mm / 600 x 600 px at 300 DPI)</li>
        <li><strong>Schengen Visa & UK Passport:</strong> 35 x 45 mm</li>
        <li><strong>Canada Passport:</strong> 50 x 70 mm</li>
      </ul>
      <h2>Composition & Head Size Rules</h2>
      <p>The head must measure between 50% and 69% of the image total height from the bottom of the chin to the top of the head.</p>
    `,
    category: 'Government & ID',
    tags: ['passport photo', 'visa dimensions', 'photo maker', 'id photo'],
    author: {
      name: 'Elena Rostova',
      role: 'Compliance & Identity Specialist',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    },
    coverImage: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
    readTime: '5 min read',
    publishedDate: '2026-03-10',
    updatedDate: '2026-08-25',
    status: 'published',
    seo: {
      seoTitle: 'Passport & Visa Photo Dimensions (2026 Official Guide) | AetherPix',
      metaDescription: 'Complete international standards for 2x2 inch, 35x45mm, and official passport photo requirements.',
      h1Title: 'Official Passport & Visa Photo Dimensions Guide',
      canonicalUrl: 'https://aetherpix.studio/blog/passport-photo-specifications-guide-2026',
    },
    views: 1840,
    featured: false,
  }
];

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
          if (snapshot.empty) {
            // Collection is empty in Firestore; populate local cache with default articles
            // without attempting unauthenticated writes over the wire
            if (this.cachedPosts.length === 0) {
              this.cachedPosts = [...SEED_BLOG_POSTS];
              this.saveToLocalStorage(this.cachedPosts);
              this.notifyListeners();
            }
          } else {
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
        },
        (error) => {
          console.warn('Firestore onSnapshot listener note for blogs collection:', error);
          if (this.cachedPosts.length === 0) {
            this.cachedPosts = [...SEED_BLOG_POSTS];
            this.notifyListeners();
          }
        }
      );
    } catch (err) {
      console.warn('Failed to attach Firestore snapshot on blogs:', err);
    }
  }

  /**
   * Seed default blogs directly into Firestore (Admin action)
   */
  public static async seedInitialBlogsToFirestore(): Promise<boolean> {
    try {
      const batch = writeBatch(db);
      for (const post of SEED_BLOG_POSTS) {
        const postRef = doc(db, COLLECTION_NAME, post.id);
        batch.set(postRef, post, { merge: true });
      }
      await batch.commit();
      this.cachedPosts = [...SEED_BLOG_POSTS];
      this.saveToLocalStorage(this.cachedPosts);
      this.notifyListeners();
      return true;
    } catch (e) {
      console.warn('Failed to seed blogs to Firestore:', e);
      return false;
    }
  }

  private static loadFromLocalStorage(): void {
    if (typeof localStorage === 'undefined') {
      this.cachedPosts = [...SEED_BLOG_POSTS];
      return;
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.cachedPosts = parsed;
          return;
        }
      }
    } catch (e) {
      console.warn('Error reading blogs from localStorage:', e);
    }
    this.cachedPosts = [...SEED_BLOG_POSTS];
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
      } else {
        if (this.cachedPosts.length === 0) {
          this.cachedPosts = [...SEED_BLOG_POSTS];
          this.saveToLocalStorage(this.cachedPosts);
        }
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
