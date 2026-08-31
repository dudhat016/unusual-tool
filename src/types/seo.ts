export type SearchIntentType = 'transactional' | 'informational' | 'commercial' | 'navigational';

export type SchemaTypeEnum =
  | 'SoftwareApplication'
  | 'WebApplication'
  | 'WebPage'
  | 'Article'
  | 'HowTo'
  | 'FAQPage'
  | 'CollectionPage'
  | 'Organization';

export interface ToolFormatSpecs {
  inputFormats: string[];
  outputFormats: string[];
  maxFileSizeMB: number;
  processingMethod: '100% Client-Side (WebAssembly/Canvas)' | 'Server-Side Cloud API' | 'Neural AI Model';
  privacyGuarantee: string;
  offlineSupported: boolean;
  requiresRegistration: boolean;
  pricing: 'Free ($0.00)' | 'Freemium (Free Credits Available)';
}

export interface SeoFaqItem {
  question: string;
  answer: string;
}

export interface SeoStepItem {
  step: number;
  title: string;
  description: string;
}

export interface SeoBreadcrumbItem {
  name: string;
  url: string;
}

export interface ToolSeoEntry {
  id: string;
  name: string;
  slug: string;
  category: string;
  categoryName: string;
  categorySlug: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  searchIntent: SearchIntentType;
  title: string;
  metaDescription: string;
  h1: string;
  shortDescription: string;
  longDescription: string;
  quickAnswer: string;
  howItWorks: SeoStepItem[];
  useCases: string[];
  faq: SeoFaqItem[];
  relatedTools: string[]; // Slugs or IDs of related tools
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage?: string;
  schemaType: SchemaTypeEnum;
  indexable: boolean;
  aiSearchDescription: string;
  formatSpecs: ToolFormatSpecs;
  targetQueryCoverage: {
    primaryQuery: string;
    longTailQueries: string[];
    questionQueries: string[];
    problemQueries: string[];
  };
}

export interface CategorySeoEntry {
  id: string;
  slug: string;
  name: string;
  title: string;
  metaDescription: string;
  h1: string;
  description: string;
  quickAnswer: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  toolSlugs: string[];
  keyWorkflows: string[];
  faq: SeoFaqItem[];
  indexable: boolean;
  matchingCategories?: string[];
}

export interface GuideArticleEntry {
  id: string;
  slug: string;
  title: string;
  metaDescription: string;
  h1: string;
  category: string;
  readTime: string;
  publishedDate: string;
  updatedDate: string;
  author: {
    name: string;
    role: string;
  };
  quickAnswer: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  relatedToolSlug: string;
  sections: {
    heading: string;
    content: string;
    bullets?: string[];
  }[];
  faq: SeoFaqItem[];
  indexable: boolean;
}

export interface SeoAuditIssue {
  type: 'error' | 'warning' | 'info';
  category: 'metadata' | 'canonical' | 'sitemap' | 'schema' | 'links' | 'content';
  route: string;
  message: string;
  recommendation: string;
}

export interface SeoScoreBreakdown {
  technicalSeoScore: number; // 0-100
  contentQualityScore: number; // 0-100
  aeoScore: number; // 0-100
  aiDiscoverabilityScore: number; // 0-100
  internalLinkScore: number; // 0-100
  overallScore: number; // 0-100
}

export interface SeoAuditReport {
  timestamp: string;
  totalRoutes: number;
  indexableRoutesCount: number;
  noindexRoutesCount: number;
  totalToolsCount: number;
  totalCategoriesCount: number;
  totalGuidesCount: number;
  sitemapUrlCount: number;
  missingTitlesCount: number;
  duplicateTitlesCount: number;
  missingDescriptionsCount: number;
  duplicateDescriptionsCount: number;
  missingH1Count: number;
  missingCanonicalsCount: number;
  orphanPagesCount: number;
  brokenLinksCount: number;
  structuredDataCoveragePercent: number;
  scores: SeoScoreBreakdown;
  issues: SeoAuditIssue[];
}
