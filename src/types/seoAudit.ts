export type FirestoreAuditItemType = 'tool' | 'blog';

export type AuditIssueSeverity = 'critical' | 'warning' | 'info' | 'passed';

export type AuditCategory =
  | 'meta_description'
  | 'social_tags'
  | 'content_quality'
  | 'headings'
  | 'faq'
  | 'keywords'
  | 'canonical'
  | 'title';

export interface AuditIssue {
  id: string;
  severity: AuditIssueSeverity;
  category: AuditCategory;
  field: string;
  message: string;
  recommendation: string;
  impact: 'high' | 'medium' | 'low';
}

export interface AuditSocialStatus {
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
  hasOgTitle: boolean;
  hasOgDescription: boolean;
  hasOgImage: boolean;
  hasTwitterCard: boolean;
  score: number; // 0-100
}

export interface AuditMetaStatus {
  metaTitle: string;
  titleLength: number;
  metaDescription: string;
  metaDescriptionLength: number;
  hasMetaDescription: boolean;
  metaDescriptionStatus: 'missing' | 'too_short' | 'too_long' | 'optimal';
  canonicalUrl: string;
  hasCanonical: boolean;
  primaryKeyword: string;
  hasKeyword: boolean;
  score: number; // 0-100
}

export interface AuditContentStatus {
  wordCount: number;
  isThinContent: boolean;
  readingTimeMinutes: number;
  headingCount: number;
  faqCount: number;
  hasHowToSteps: boolean;
  stepCount: number;
  hasFeatures: boolean;
  hasPlaceholderText: boolean;
  contentScore: number; // 0-100
  score?: number; // alias for 0-100 score
}

export interface FirestoreAuditItem {
  id: string;
  type: FirestoreAuditItemType;
  collection: 'tools' | 'blogs';
  name: string;
  slug: string;
  route: string;
  status: 'published' | 'draft';
  overallScore: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  metaStatus: AuditMetaStatus;
  socialStatus: AuditSocialStatus;
  contentStatus: AuditContentStatus;
  issues: AuditIssue[];
  rawDoc: any;
}

export interface FirestoreAuditSummary {
  scannedAt: string;
  totalScanned: number;
  toolsCount: number;
  blogsCount: number;
  overallHealthScore: number;
  criticalIssuesCount: number;
  warningsCount: number;
  optimizedCount: number;
  missingMetaDescCount: number;
  missingSocialTagsCount: number;
  thinContentCount: number;
  missingFaqsCount: number;
  items: FirestoreAuditItem[];
}
