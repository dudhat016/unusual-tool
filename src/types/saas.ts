export type PlanTier = 'free' | 'pro' | 'business' | string;

export type UserRole = 'user' | 'admin' | 'moderator';

export interface PlanConfig {
  id: PlanTier;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  monthlyCredits: number;
  dailyImagesLimit: number;
  maxFileSizeMB: number;
  maxBatchSize: number;
  maxResolutionMegapixels: number; // e.g. 24MP for Free, 70MP for Pro, 200MP for Business
  maxProcessingTimeMs: number; // e.g. 45000ms
  aiRateLimitPerMin: number;
  adsEnabled: boolean; // Free has ads, Pro/Business ad-free
  allowPriorityQueue: boolean;
  allowBulkZip: boolean;
  allowServerEngines: boolean;
  priority: number;
  disabled?: boolean;
  features: string[];
}

export type TransactionType = 'purchase' | 'usage' | 'refund' | 'bonus' | 'subscription' | 'admin_adjustment';

export interface CreditLedgerRecord {
  id: string;
  userId: string;
  transactionType: TransactionType;
  amount: number; // positive for credit, negative for debit
  balanceAfter: number;
  toolId?: string;
  jobId?: string;
  description: string;
  metadata?: Record<string, any>;
  timestamp: number;
}

export interface UserUsageStats {
  todayProcessedCount: number;
  todayAiCount: number;
  monthProcessedCount: number;
  monthAiCount: number;
  totalProcessedCount: number;
  lastActiveDate: string; // YYYY-MM-DD
  currentMonth: string; // YYYY-MM
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  plan: PlanTier;
  credits: number;
  usage: UserUsageStats;
  isSuspended?: boolean;
  suspensionReason?: string;
  subscription?: {
    status: 'active' | 'canceled' | 'past_due' | 'trialing';
    provider: 'stripe' | 'lemonsqueezy' | 'paddle' | 'manual';
    subscriptionId?: string;
    customerId?: string;
    currentPeriodEnd?: number;
    cancelAtPeriodEnd?: boolean;
  };
  privacySettings: {
    telemetryOptIn: boolean;
    autoPurgeHistoryMinutes: number; // 0 for persistent
  };
  preferredLanguage?: string;
  createdAt: number;
  updatedAt: number;
}

export interface ProcessingJobRecord {
  id: string;
  userId: string;
  userEmail?: string;
  toolId: string;
  toolName: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'canceled';
  processorType: 'browser' | 'server' | 'ai';
  fileName: string;
  originalSize: number;
  resultSize?: number;
  originalWidth?: number;
  originalHeight?: number;
  resultWidth?: number;
  resultHeight?: number;
  processingTimeMs?: number;
  creditsCharged: number;
  errorMessage?: string;
  timestamp: number;
}

export interface SavedPreset {
  id: string;
  userId: string;
  title: string;
  toolId: string;
  options: Record<string, any>;
  isPublic?: boolean;
  createdAt: number;
}

export interface SystemErrorLog {
  id: string;
  userId?: string;
  userEmail?: string;
  toolId?: string;
  errorMessage: string;
  errorStack?: string;
  timestamp: number;
  clientInfo?: {
    userAgent: string;
    viewport: string;
  };
}

export interface AbuseRateLimitCheck {
  allowed: boolean;
  reason?: string;
  remainingCalls?: number;
  resetSeconds?: number;
}
