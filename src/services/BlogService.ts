import { BlogPostItem } from '../types/blog';

const STORAGE_KEY = 'aetherpix_blog_posts_v1';

// Seed blog posts directory
const SEED_BLOG_POSTS: BlogPostItem[] = [
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
    `,
    category: 'Format Guides',
    tags: ['image compression', 'reduce file size', 'webp converter'],
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
  },
  {
    id: 'how-to-convert-webp-to-png',
    slug: 'how-to-convert-webp-to-png',
    title: 'How to Convert WebP to PNG Images Online (Free & Instant)',
    excerpt: 'Convert WebP photos to transparent PNG or JPG format instantly using browser-based WebAssembly conversion.',
    contentHtml: `
      <p class="lead">Convert WebP photos to transparent PNG or JPG format instantly using browser-based WebAssembly conversion.</p>
      <h2>Why Convert WebP to PNG?</h2>
      <p>PNG offers universal support across legacy image editors, graphic design tools, and printing platforms that do not support WebP.</p>
    `,
    category: 'Format Guides',
    tags: ['webp to png', 'convert image', 'image converter'],
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
  }
];

export class BlogService {
  private static loadPosts(): BlogPostItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load blog posts from localStorage', e);
    }
    // Store seeds initially
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_BLOG_POSTS));
    return SEED_BLOG_POSTS;
  }

  private static saveToStorage(posts: BlogPostItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    } catch (e) {
      console.error('Failed to save blog posts to localStorage', e);
    }
  }

  public static getAllPosts(): BlogPostItem[] {
    return this.loadPosts();
  }

  public static getPublishedPosts(): BlogPostItem[] {
    return this.loadPosts().filter((p) => p.status === 'published');
  }

  public static getPostBySlug(slug: string): BlogPostItem | undefined {
    const cleanSlug = slug.replace(/^blog\//, '').replace(/^guides\//, '').replace(/^\/+|\/+$/g, '').toLowerCase();
    return this.loadPosts().find(
      (p) => p.slug.toLowerCase() === cleanSlug || p.id.toLowerCase() === cleanSlug
    );
  }

  public static savePost(post: BlogPostItem): BlogPostItem {
    const posts = this.loadPosts();
    const existingIdx = posts.findIndex((p) => p.id === post.id);

    const updatedPost: BlogPostItem = {
      ...post,
      updatedDate: new Date().toISOString().split('T')[0],
    };

    if (existingIdx >= 0) {
      posts[existingIdx] = updatedPost;
    } else {
      posts.unshift(updatedPost);
    }

    this.saveToStorage(posts);
    return updatedPost;
  }

  public static deletePost(id: string): boolean {
    let posts = this.loadPosts();
    const initialLen = posts.length;
    posts = posts.filter((p) => p.id !== id);
    this.saveToStorage(posts);
    return posts.length < initialLen;
  }

  public static toggleStatus(id: string): BlogPostItem | undefined {
    const posts = this.loadPosts();
    const post = posts.find((p) => p.id === id);
    if (post) {
      post.status = post.status === 'published' ? 'draft' : 'published';
      this.saveToStorage(posts);
      return post;
    }
    return undefined;
  }

  public static incrementViews(id: string): void {
    const posts = this.loadPosts();
    const post = posts.find((p) => p.id === id);
    if (post) {
      post.views = (post.views || 0) + 1;
      this.saveToStorage(posts);
    }
  }
}
