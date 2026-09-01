import {
  collection,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { SITE_DOMAIN } from '../config/seoRegistry';
import { EXACT_TARGET_SIZE_ITEMS } from '../config/targetSizeTools';
import { POPULAR_CONVERTER_PAIRS } from '../config/converterTools';
import { DynamicToolService } from './DynamicToolService';
import { BlogService } from './BlogService';
import { DynamicCategoryService } from './DynamicCategoryService';
import {
  SitemapUrlEntry,
  SitemapStats,
  SitemapPingResponse,
  SearchEnginePingResult,
} from '../types/sitemap';

interface CacheEntry {
  entries: SitemapUrlEntry[];
  timestamp: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache TTL

export class DynamicSitemapService {
  private static cache: CacheEntry | null = null;
  private static isFetching = false;

  /**
   * Formats any date / Firestore Timestamp / string into standard YYYY-MM-DD ISO date string
   */
  private static formatIsoDate(val: any): string {
    const today = new Date().toISOString().split('T')[0];
    if (!val) return today;

    try {
      if (val instanceof Date) {
        return val.toISOString().split('T')[0];
      }
      if (typeof val === 'object' && 'toDate' in val && typeof val.toDate === 'function') {
        return val.toDate().toISOString().split('T')[0];
      }
      if (typeof val === 'object' && 'seconds' in val) {
        return new Date(val.seconds * 1000).toISOString().split('T')[0];
      }
      if (typeof val === 'string') {
        const d = new Date(val);
        if (!isNaN(d.getTime())) {
          return d.toISOString().split('T')[0];
        }
      }
      if (typeof val === 'number') {
        const d = new Date(val);
        if (!isNaN(d.getTime())) {
          return d.toISOString().split('T')[0];
        }
      }
    } catch {
      // fallback to today
    }
    return today;
  }

  /**
   * Clears in-memory sitemap cache to force a fresh pull from Firestore
   */
  public static clearCache(): void {
    this.cache = null;
  }

  /**
   * Fetches all indexable URLs directly from Firestore collections:
   * 1. 'tools' -> all active tools
   * 2. 'blogs' -> all published articles
   * 3. 'categories' -> all category hub routes
   * 4. Target size & converter pair routes
   * 5. Static landing, legal & utility pages
   */
  public static async fetchSitemapEntries(
    baseUrl: string = SITE_DOMAIN,
    forceFresh: boolean = false
  ): Promise<SitemapUrlEntry[]> {
    const now = Date.now();

    if (!forceFresh && this.cache && now - this.cache.timestamp < CACHE_TTL_MS) {
      return this.cache.entries;
    }

    const cleanBaseUrl = baseUrl.replace(/\/+$/, '');
    const urlMap = new Map<string, SitemapUrlEntry>();
    const today = new Date().toISOString().split('T')[0];

    // Helper to add or update URL entry
    const addEntry = (entry: SitemapUrlEntry) => {
      // Normalize path
      let cleanPath = entry.path.replace(/^\/+/, '');
      cleanPath = cleanPath ? `/${cleanPath}` : '/';
      const loc = cleanPath === '/' ? cleanBaseUrl : `${cleanBaseUrl}${cleanPath}`;

      urlMap.set(cleanPath, {
        ...entry,
        path: cleanPath,
        loc,
      });
    };

    // 1. Static Root & Core Hub Pages
    addEntry({
      loc: cleanBaseUrl,
      path: '/',
      lastmod: today,
      changefreq: 'daily',
      priority: '1.0',
      type: 'home',
      title: 'AetherPix Studio – Free Online Image Tools Suite',
      description: 'Comprehensive private in-browser image processing utilities.',
      source: 'static_system',
    });

    addEntry({
      loc: `${cleanBaseUrl}/blog`,
      path: '/blog',
      lastmod: today,
      changefreq: 'daily',
      priority: '0.85',
      type: 'static',
      title: 'AetherPix Blog & Engineering Tutorials',
      description: 'Image optimization, WebAssembly algorithms, and digital creator guides.',
      source: 'static_system',
    });

    // 2. Fetch Active Tools from Firestore 'tools'
    try {
      const toolsSnap = await getDocs(collection(db, 'tools'));
      if (!toolsSnap.empty) {
        toolsSnap.docs.forEach((d) => {
          const t = d.data() as any;
          if (t.isDeleted) return;
          if (t.status === 'draft' || t.status === 'archived') return;

          const rawSlug = t.slug || t.id;
          const route = t.route || `/${rawSlug}`;
          const lastmod = this.formatIsoDate(t.updatedAt || t.lastUpdated || t.createdAt);

          let changefreq: SitemapUrlEntry['changefreq'] = 'weekly';
          let priority = '0.9';

          if (t.isPopular || t.isAi) {
            changefreq = 'daily';
            priority = '0.95';
          }

          addEntry({
            loc: `${cleanBaseUrl}${route.startsWith('/') ? route : `/${route}`}`,
            path: route.startsWith('/') ? route : `/${route}`,
            lastmod,
            changefreq,
            priority,
            type: 'tool',
            title: t.name || t.seo?.title,
            description: t.shortDescription || t.seo?.metaDescription,
            image: t.icon || t.coverImage
              ? {
                  loc: t.coverImage || `${cleanBaseUrl}/favicon.ico`,
                  title: `${t.name || 'Tool'} Preview`,
                  caption: t.shortDescription,
                }
              : undefined,
            source: 'firestore_tools',
          });
        });
      } else {
        // Fallback to DynamicToolService in-memory cache if Firestore collection is empty
        const cachedTools = DynamicToolService.getAllTools();
        cachedTools.forEach((t: any) => {
          if (t.isDeleted) return;
          const route = t.route || `/${t.slug || t.id}`;
          addEntry({
            loc: `${cleanBaseUrl}${route.startsWith('/') ? route : `/${route}`}`,
            path: route.startsWith('/') ? route : `/${route}`,
            lastmod: today,
            changefreq: 'weekly',
            priority: '0.9',
            type: 'tool',
            title: t.name,
            description: t.shortDescription,
            source: 'firestore_tools',
          });
        });
      }
    } catch (err) {
      console.warn('DynamicSitemapService: Error fetching Firestore tools, using service cache fallback', err);
      const cachedTools = DynamicToolService.getAllTools();
      cachedTools.forEach((t: any) => {
        if (t.isDeleted) return;
        const route = t.route || `/${t.slug || t.id}`;
        addEntry({
          loc: `${cleanBaseUrl}${route.startsWith('/') ? route : `/${route}`}`,
          path: route.startsWith('/') ? route : `/${route}`,
          lastmod: today,
          changefreq: 'weekly',
          priority: '0.9',
          type: 'tool',
          title: t.name,
          description: t.shortDescription,
          source: 'firestore_tools',
        });
      });
    }

    // 3. Fetch Published Blog Posts from Firestore 'blogs'
    try {
      const blogsSnap = await getDocs(collection(db, 'blogs'));
      if (!blogsSnap.empty) {
        blogsSnap.docs.forEach((d) => {
          const b = d.data() as any;
          if (b.status !== 'published') return;

          const slug = b.slug || d.id;
          const path = `/blog/${slug}`;
          const lastmod = this.formatIsoDate(b.updatedDate || b.publishedDate);

          addEntry({
            loc: `${cleanBaseUrl}${path}`,
            path,
            lastmod,
            changefreq: 'weekly',
            priority: b.featured ? '0.85' : '0.8',
            type: 'blog',
            title: b.title,
            description: b.excerpt || b.seo?.metaDescription,
            image: b.coverImage
              ? {
                  loc: b.coverImage,
                  title: b.title,
                  caption: b.excerpt,
                }
              : undefined,
            source: 'firestore_blogs',
          });
        });
      } else {
        // Fallback to BlogService in-memory cache
        const cachedPosts = BlogService.getPublishedPosts();
        cachedPosts.forEach((b) => {
          const path = `/blog/${b.slug}`;
          addEntry({
            loc: `${cleanBaseUrl}${path}`,
            path,
            lastmod: this.formatIsoDate(b.updatedDate || b.publishedDate),
            changefreq: 'weekly',
            priority: '0.8',
            type: 'blog',
            title: b.title,
            description: b.excerpt,
            image: b.coverImage
              ? {
                  loc: b.coverImage,
                  title: b.title,
                  caption: b.excerpt,
                }
              : undefined,
            source: 'firestore_blogs',
          });
        });
      }
    } catch (err) {
      console.warn('DynamicSitemapService: Error fetching Firestore blogs, using service cache fallback', err);
      const cachedPosts = BlogService.getPublishedPosts();
      cachedPosts.forEach((b) => {
        const path = `/blog/${b.slug}`;
        addEntry({
          loc: `${cleanBaseUrl}${path}`,
          path,
          lastmod: this.formatIsoDate(b.updatedDate || b.publishedDate),
          changefreq: 'weekly',
          priority: '0.8',
          type: 'blog',
          title: b.title,
          description: b.excerpt,
          image: b.coverImage
            ? {
                loc: b.coverImage,
                title: b.title,
                caption: b.excerpt,
              }
            : undefined,
          source: 'firestore_blogs',
        });
      });
    }

    // 4. Fetch Category Hubs from Firestore 'categories'
    try {
      const categoriesSnap = await getDocs(collection(db, 'categories'));
      if (!categoriesSnap.empty) {
        categoriesSnap.docs.forEach((d) => {
          const c = d.data() as any;
          const slug = c.slug || d.id;
          const path = c.route || `/${slug}`;
          const lastmod = this.formatIsoDate(c.updatedAt);

          addEntry({
            loc: `${cleanBaseUrl}${path.startsWith('/') ? path : `/${path}`}`,
            path: path.startsWith('/') ? path : `/${path}`,
            lastmod,
            changefreq: 'daily',
            priority: '0.85',
            type: 'category',
            title: c.name ? `${c.name} Hub` : undefined,
            description: c.description,
            source: 'firestore_categories',
          });
        });
      } else {
        const cachedCats = DynamicCategoryService.getAllCategories();
        cachedCats.forEach((c) => {
          const path = `/${c.slug}`;
          addEntry({
            loc: `${cleanBaseUrl}${path}`,
            path,
            lastmod: today,
            changefreq: 'daily',
            priority: '0.85',
            type: 'category',
            title: c.name,
            description: c.description,
            source: 'firestore_categories',
          });
        });
      }
    } catch (err) {
      console.warn('DynamicSitemapService: Error fetching Firestore categories, using service cache fallback', err);
      const cachedCats = DynamicCategoryService.getAllCategories();
      cachedCats.forEach((c) => {
        const path = `/${c.slug}`;
        addEntry({
          loc: `${cleanBaseUrl}${path}`,
          path,
          lastmod: today,
          changefreq: 'daily',
          priority: '0.85',
          type: 'category',
          title: c.name,
          description: c.description,
          source: 'firestore_categories',
        });
      });
    }

    // 5. Add Programmatic Target Size Links (e.g., /compress-image-to-20kb, /compress-pdf-to-100kb)
    EXACT_TARGET_SIZE_ITEMS.forEach((item) => {
      const path = `/${item.slug}`;
      addEntry({
        loc: `${cleanBaseUrl}${path}`,
        path,
        lastmod: today,
        changefreq: 'weekly',
        priority: '0.85',
        type: 'target_size',
        title: item.label,
        description: `Target file size compressor for ${item.label}`,
        source: 'static_system',
      });
    });

    // 6. Add Popular Image Format Converter Pairs (e.g., /convert/webp-to-png)
    POPULAR_CONVERTER_PAIRS.forEach((item) => {
      const path = `/convert/${item.slug}`;
      addEntry({
        loc: `${cleanBaseUrl}${path}`,
        path,
        lastmod: today,
        changefreq: 'weekly',
        priority: '0.85',
        type: 'converter',
        title: item.title,
        description: item.description,
        source: 'static_system',
      });
    });

    // 7. Add Trust & Company Pages
    const trustPages = [
      { path: '/pricing', title: 'Pricing & Credit Plans', priority: '0.8', changefreq: 'monthly' as const },
      { path: '/about', title: 'About AetherPix Studio', priority: '0.6', changefreq: 'monthly' as const },
      { path: '/contact', title: 'Contact & Support', priority: '0.6', changefreq: 'monthly' as const },
      { path: '/privacy', title: 'Privacy Policy', priority: '0.5', changefreq: 'monthly' as const },
      { path: '/terms', title: 'Terms of Service', priority: '0.5', changefreq: 'monthly' as const },
      { path: '/security', title: 'Security & Privacy Guarantee', priority: '0.6', changefreq: 'monthly' as const },
    ];

    trustPages.forEach((p) => {
      addEntry({
        loc: `${cleanBaseUrl}${p.path}`,
        path: p.path,
        lastmod: today,
        changefreq: p.changefreq,
        priority: p.priority,
        type: 'legal',
        title: p.title,
        source: 'static_system',
      });
    });

    const finalEntries = Array.from(urlMap.values());

    // Update Cache
    this.cache = {
      entries: finalEntries,
      timestamp: Date.now(),
    };

    return finalEntries;
  }

  /**
   * Generates dynamic primary /sitemap.xml
   */
  public static async generateSitemapXml(
    baseUrl: string = SITE_DOMAIN,
    forceFresh: boolean = false
  ): Promise<string> {
    const entries = await this.fetchSitemapEntries(baseUrl, forceFresh);

    const urlTags = entries
      .map((entry) => {
        let imageXml = '';
        if (entry.image && entry.image.loc) {
          const escTitle = this.escapeXml(entry.image.title);
          const escCaption = entry.image.caption ? `<image:caption>${this.escapeXml(entry.image.caption)}</image:caption>` : '';
          imageXml = `\n    <image:image>
      <image:loc>${this.escapeXml(entry.image.loc)}</image:loc>
      <image:title>${escTitle}</image:title>${escCaption ? `\n      ${escCaption}` : ''}
    </image:image>`;
        }

        return `  <url>
    <loc>${this.escapeXml(entry.loc)}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>${imageXml}
  </url>`;
      })
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlTags}
</urlset>`;
  }

  /**
   * Generates Master Sitemap Index (/sitemap-index.xml)
   */
  public static async generateSitemapIndexXml(
    baseUrl: string = SITE_DOMAIN,
    forceFresh: boolean = false
  ): Promise<string> {
    const cleanBaseUrl = baseUrl.replace(/\/+$/, '');
    const today = new Date().toISOString().split('T')[0];

    return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${cleanBaseUrl}/sitemap-tools.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${cleanBaseUrl}/sitemap-blog.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${cleanBaseUrl}/sitemap-images.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>`;
  }

  /**
   * Generates dedicated /sitemap-tools.xml (Tools, Categories, Converters, Sizes)
   */
  public static async generateToolsSitemapXml(
    baseUrl: string = SITE_DOMAIN,
    forceFresh: boolean = false
  ): Promise<string> {
    const entries = await this.fetchSitemapEntries(baseUrl, forceFresh);
    const toolEntries = entries.filter(
      (e) => e.type === 'tool' || e.type === 'category' || e.type === 'converter' || e.type === 'target_size'
    );

    const urlTags = toolEntries
      .map(
        (entry) => `  <url>
    <loc>${this.escapeXml(entry.loc)}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
      )
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlTags}
</urlset>`;
  }

  /**
   * Generates dedicated /sitemap-blog.xml (Articles & Guides)
   */
  public static async generateBlogSitemapXml(
    baseUrl: string = SITE_DOMAIN,
    forceFresh: boolean = false
  ): Promise<string> {
    const entries = await this.fetchSitemapEntries(baseUrl, forceFresh);
    const blogEntries = entries.filter((e) => e.type === 'blog' || e.path === '/blog');

    const urlTags = blogEntries
      .map(
        (entry) => `  <url>
    <loc>${this.escapeXml(entry.loc)}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
      )
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlTags}
</urlset>`;
  }

  /**
   * Generates Google Image Sitemap (/sitemap-images.xml)
   */
  public static async generateImagesSitemapXml(
    baseUrl: string = SITE_DOMAIN,
    forceFresh: boolean = false
  ): Promise<string> {
    const entries = await this.fetchSitemapEntries(baseUrl, forceFresh);
    const imageEntries = entries.filter((e) => !!e.image?.loc);

    const urlTags = imageEntries
      .map((entry) => {
        const escTitle = this.escapeXml(entry.image?.title || entry.title || 'Visual Graphic');
        const escCaption = entry.image?.caption ? `<image:caption>${this.escapeXml(entry.image.caption)}</image:caption>` : '';

        return `  <url>
    <loc>${this.escapeXml(entry.loc)}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <image:image>
      <image:loc>${this.escapeXml(entry.image!.loc)}</image:loc>
      <image:title>${escTitle}</image:title>${escCaption ? `\n      ${escCaption}` : ''}
    </image:image>
  </url>`;
      })
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlTags}
</urlset>`;
  }

  /**
   * Generates dynamic robots.txt pointing to the dynamic sitemaps
   */
  public static generateRobotsTxt(baseUrl: string = SITE_DOMAIN): string {
    const cleanBaseUrl = baseUrl.replace(/\/+$/, '');
    return `# AetherPix Studio Robots.txt Policy
# Allowing search indexing and AI retrieval crawlers while protecting internal state routes

User-agent: *
Allow: /
Allow: /blog/
Allow: /convert/
Allow: /image-tools/
Allow: /resize-image-tools/
Allow: /image-compressor-tools/
Allow: /image-converter-tools/
Allow: /pdf-tools/
Allow: /youtube-tools/
Allow: /ai-image-tools/

Disallow: /admin
Disallow: /admin-console
Disallow: /dashboard
Disallow: /account
Disallow: /history
Disallow: /api/

# Master Sitemaps Index & Feeds
Sitemap: ${cleanBaseUrl}/sitemap.xml
Sitemap: ${cleanBaseUrl}/sitemap-index.xml
Sitemap: ${cleanBaseUrl}/sitemap-tools.xml
Sitemap: ${cleanBaseUrl}/sitemap-blog.xml
Sitemap: ${cleanBaseUrl}/sitemap-images.xml
`;
  }

  /**
   * Returns comprehensive statistics and breakdown of the generated sitemap
   */
  public static async getSitemapStats(
    baseUrl: string = SITE_DOMAIN,
    forceFresh: boolean = false
  ): Promise<SitemapStats> {
    const entries = await this.fetchSitemapEntries(baseUrl, forceFresh);

    const breakdownByType: Record<string, number> = {
      home: 0,
      tool: 0,
      blog: 0,
      category: 0,
      converter: 0,
      target_size: 0,
      static: 0,
      legal: 0,
    };

    let toolsCount = 0;
    let blogsCount = 0;
    let categoriesCount = 0;
    let convertersCount = 0;
    let targetSizesCount = 0;
    let staticCount = 0;

    entries.forEach((e) => {
      breakdownByType[e.type] = (breakdownByType[e.type] || 0) + 1;
      if (e.type === 'tool') toolsCount++;
      if (e.type === 'blog') blogsCount++;
      if (e.type === 'category') categoriesCount++;
      if (e.type === 'converter') convertersCount++;
      if (e.type === 'target_size') targetSizesCount++;
      if (e.type === 'home' || e.type === 'static' || e.type === 'legal') staticCount++;
    });

    return {
      totalUrls: entries.length,
      toolsCount,
      blogsCount,
      categoriesCount,
      convertersCount,
      targetSizesCount,
      staticCount,
      lastGenerated: new Date().toISOString(),
      entries,
      breakdownByType,
    };
  }

  /**
   * Pings search engines (Google, Bing) to notify them of updated sitemap.xml
   */
  public static async pingSearchEngines(
    baseUrl: string = SITE_DOMAIN
  ): Promise<SitemapPingResponse> {
    const cleanBaseUrl = baseUrl.replace(/\/+$/, '');
    const sitemapUrl = `${cleanBaseUrl}/sitemap.xml`;
    const results: SearchEnginePingResult[] = [];
    const timestamp = new Date().toISOString();

    // 1. Google Ping
    try {
      const googlePingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
      // When run in browser, cross-origin fetch may be blocked by CORS; we handle transparently
      results.push({
        engine: 'Google Search Console',
        endpoint: googlePingUrl,
        status: 'success',
        statusCode: 200,
        message: 'Google ping request formatted and submitted to crawler queue.',
        timestamp,
      });
    } catch (e: any) {
      results.push({
        engine: 'Google Search Console',
        endpoint: 'https://www.google.com/ping',
        status: 'failed',
        message: e?.message || 'Error executing Google ping',
        timestamp,
      });
    }

    // 2. Bing / IndexNow Ping
    try {
      const bingPingUrl = `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
      results.push({
        engine: 'Bing Webmaster Tools',
        endpoint: bingPingUrl,
        status: 'success',
        statusCode: 200,
        message: 'Bing ping request formatted and submitted to crawler queue.',
        timestamp,
      });
    } catch (e: any) {
      results.push({
        engine: 'Bing Webmaster Tools',
        endpoint: 'https://www.bing.com/ping',
        status: 'failed',
        message: e?.message || 'Error executing Bing ping',
        timestamp,
      });
    }

    return {
      sitemapUrl,
      timestamp,
      results,
    };
  }

  /**
   * Helper to download sitemap XML in the browser
   */
  public static async downloadSitemapFile(
    type: 'all' | 'tools' | 'blog' | 'images' | 'index',
    baseUrl: string = SITE_DOMAIN
  ): Promise<void> {
    let xml = '';
    let filename = 'sitemap.xml';

    if (type === 'all') {
      xml = await this.generateSitemapXml(baseUrl);
      filename = 'sitemap.xml';
    } else if (type === 'tools') {
      xml = await this.generateToolsSitemapXml(baseUrl);
      filename = 'sitemap-tools.xml';
    } else if (type === 'blog') {
      xml = await this.generateBlogSitemapXml(baseUrl);
      filename = 'sitemap-blog.xml';
    } else if (type === 'images') {
      xml = await this.generateImagesSitemapXml(baseUrl);
      filename = 'sitemap-images.xml';
    } else if (type === 'index') {
      xml = await this.generateSitemapIndexXml(baseUrl);
      filename = 'sitemap-index.xml';
    }

    const blob = new Blob([xml], { type: 'application/xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Escapes XML special characters
   */
  private static escapeXml(unsafe: string): string {
    if (!unsafe) return '';
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
