export type ContentStatus = 'draft' | 'published' | 'unpublished';

export interface ToolFaqItem {
  id: string;
  question: string;
  answerHtml: string;
  order: number;
  enabled: boolean;
}

export interface ToolSeoMetadata {
  h1Title?: string;
  headerDescription?: string;
  seoTitle: string;
  metaDescription: string;
  slug: string;
  canonicalUrl?: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: 'summary' | 'summary_large_image';
}

export interface ToolContentMetrics {
  wordCount: number;
  characterCount: number;
  headingCount: number;
  faqCount: number;
  internalLinkCount: number;
}

export interface ToolSeoHealthWarning {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  recommendation: string;
}

export interface ToolDetailContent {
  id: string; // `${toolId}_${locale}`
  toolId: string;
  locale: string;
  status: ContentStatus;
  
  // SEO Metadata
  seo: ToolSeoMetadata;
  
  // Content Sections
  introHtml: string;
  contentHtml: string;
  tags: string[];
  relatedToolIds: string[];
  tocEnabled: boolean;
  
  // FAQs
  faqs: ToolFaqItem[];
  
  // Quality & System Metadata
  metrics: ToolContentMetrics;
  createdAt: number;
  updatedAt: number;
  publishedAt?: number;
  authorId?: string;
}

export interface TocHeadingItem {
  id: string;
  text: string;
  level: number; // 2 for h2, 3 for h3, 4 for h4
  children?: TocHeadingItem[];
}
