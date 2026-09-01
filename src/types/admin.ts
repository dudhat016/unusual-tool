import { PlanTier } from './saas';

export interface ToolAdminConfig {
  toolId: string;
  name: string;
  route: string;
  category: string;
  enabled: boolean;
  isPublic: boolean;
  isFree: boolean;
  isPremiumOnly: boolean;
  batchEnabled: boolean;
  maxFilesLimit: number;
  maxFileSizeMB: number;
  dailyUsageLimit: number;
  monthlyUsageLimit: number;
  aiCreditCost: number;
  processingTimeoutMs: number;
  concurrencyLimit: number;
  adsEnabled: boolean;
  seoIndexable: boolean;
  featured: boolean;
  popular: boolean;
  trending: boolean;
  maintenanceMode: boolean;
}

export type FeatureFlagStatus = 'enabled' | 'disabled' | 'premium_only' | 'free' | 'coming_soon';

export interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  status: FeatureFlagStatus;
  category: 'core' | 'ai' | 'batch' | 'export' | 'storage';
  updatedAt: number;
}

export interface SystemSettings {
  siteName: string;
  siteUrl: string;
  supportEmail: string;
  logoUrl?: string;
  faviconUrl?: string;
  brandTagline?: string;
  defaultCurrency: string;
  defaultPlan: PlanTier;
  anonymousDailyLimit: number;
  registeredFreeDailyLimit: number;
  anonymousMaxFileSizeMB: number;
  anonymousMaxBatch: number;
  maintenanceMode: boolean;
  maintenanceNotice: string;
  allowedMaintenanceToolIds: string[];
  emergencyAiDisabled: boolean;
  emergencyBatchDisabled: boolean;
  emergencyLimitsReduced: boolean;
  rateLimitNormalReqPerMin: number;
  rateLimitHeavyReqPerMin: number;
  rateLimitAiReqPerMin: number;
  googleAdsClient?: string;
  googleAnalyticsId?: string;
  adBlockNoticeEnabled: boolean;
  theme?: 'light' | 'dark' | 'system';
  primaryColor?: string;
  accentColor?: string;
  radius?: number;
  sidebarTheme?: 'default' | 'dark' | 'light' | 'gradient';
  fontFamily?: string;
  fontDisplay?: string;
  fontMono?: string;
  fontScale?: number;
  customCss?: string;
}

export interface AdminAuditLog {
  id: string;
  adminEmail: string;
  action: string;
  targetType: 'tool' | 'plan' | 'user' | 'credits' | 'credit_package' | 'ads' | 'workflow' | 'feature_flag' | 'settings' | 'mockup_template';
  targetId: string;
  previousValue?: any;
  newValue?: any;
  timestamp: number;
  ip?: string;
}

export interface ToolUsageStatItem {
  id: string;
  toolId: string;
  toolName: string;
  category: string;
  usageCount: number;
  successCount: number;
  failureCount: number;
  totalBytesProcessed: number;
  avgDurationMs: number;
  lastUsedAt: number;
  isAi?: boolean;
}

export interface TrafficAnalyticsSnapshot {
  timestamp: number;
  period: 'today' | '7d' | '30d';
  pageViews: number;
  uniqueVisitors: number;
  toolStarts: number;
  successfulJobs: number;
  failedJobs: number;
  totalDownloads: number;
  totalDataProcessedBytes: number;
  adImpressionsEstimated: number;
  topLandingPages: { route: string; views: number; starts: number }[];
  topTools: { toolId: string; toolName: string; jobsCount: number; failureRate: number }[];
  conversionFunnel: {
    views: number;
    uploads: number;
    processingStarted: number;
    processingCompleted: number;
    downloads: number;
  };
}
