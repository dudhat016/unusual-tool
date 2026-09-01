import { SITE_DOMAIN, getAllIndexableRoutes } from '../config/seoRegistry';

export interface SitemapUrlEntry {
  url: string;
  lastMod?: string;
  changeFreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

/**
 * Generates dynamic XML Sitemap content for Google & Bing Search Indexing.
 */
export function generateXmlSitemap(): string {
  const routes = getAllIndexableRoutes();
  const today = new Date().toISOString().split('T')[0];

  const entries: SitemapUrlEntry[] = routes.map((route) => {
    const isHome = route === '/';
    const isCategory = route.includes('-tools') || route.includes('category');
    
    let priority = 0.7;
    let changeFreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never' = 'weekly';

    if (isHome) {
      priority = 1.0;
      changeFreq = 'daily';
    } else if (isCategory) {
      priority = 0.9;
      changeFreq = 'daily';
    } else if (route.includes('privacy') || route.includes('terms') || route.includes('about')) {
      priority = 0.3;
      changeFreq = 'monthly';
    }

    const fullUrl = `${SITE_DOMAIN}${route.startsWith('/') ? route : `/${route}`}`;

    return {
      url: fullUrl,
      lastMod: today,
      changeFreq,
      priority,
    };
  });

  const xmlLines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map(
      (entry) => `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastMod}</lastmod>
    <changefreq>${entry.changeFreq}</changefreq>
    <priority>${entry.priority?.toFixed(1)}</priority>
  </url>`
    ),
    '</urlset>',
  ];

  return xmlLines.join('\n');
}
