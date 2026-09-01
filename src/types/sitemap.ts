export type SitemapUrlType =
  | 'home'
  | 'tool'
  | 'blog'
  | 'category'
  | 'converter'
  | 'target_size'
  | 'static'
  | 'legal';

export interface SitemapImageInfo {
  loc: string;
  title: string;
  caption?: string;
  geo_location?: string;
}

export interface SitemapUrlEntry {
  loc: string;
  path: string;
  lastmod: string; // ISO Date YYYY-MM-DD
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: string; // '0.1' to '1.0'
  type: SitemapUrlType;
  title?: string;
  description?: string;
  image?: SitemapImageInfo;
  source: 'firestore_tools' | 'firestore_blogs' | 'firestore_categories' | 'static_system';
}

export interface SitemapStats {
  totalUrls: number;
  toolsCount: number;
  blogsCount: number;
  categoriesCount: number;
  convertersCount: number;
  targetSizesCount: number;
  staticCount: number;
  lastGenerated: string;
  entries: SitemapUrlEntry[];
  breakdownByType: Record<string, number>;
}

export interface SearchEnginePingResult {
  engine: string;
  endpoint: string;
  status: 'success' | 'failed' | 'queued';
  statusCode?: number;
  message: string;
  timestamp: string;
}

export interface SitemapPingResponse {
  sitemapUrl: string;
  timestamp: string;
  results: SearchEnginePingResult[];
}
