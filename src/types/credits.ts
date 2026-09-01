import { PlanTier, TransactionType, CreditLedgerRecord } from './saas';

export type { TransactionType, CreditLedgerRecord };

export interface ConsumeCreditParams {
  userId: string;
  amount: number;
  toolId?: string;
  toolName?: string;
  jobId?: string;
  description?: string;
  isAi?: boolean;
  userEmail?: string;
  metadata?: Record<string, any>;
}

export interface GrantCreditParams {
  userId: string;
  amount: number;
  type: TransactionType;
  description: string;
  toolId?: string;
  jobId?: string;
  metadata?: Record<string, any>;
  adminEmail?: string;
}

export interface RefundCreditParams {
  userId: string;
  amount: number;
  jobId?: string;
  toolId?: string;
  reason: string;
  metadata?: Record<string, any>;
}

export interface CreditCheckResult {
  allowed: boolean;
  currentBalance: number;
  requiredAmount: number;
  deficit: number;
  userPlan: PlanTier;
}

export interface CreditToolSpend {
  toolId: string;
  toolName: string;
  count: number;
  creditsSpent: number;
  lastUsedAt: number;
}

export interface CreditDailySpend {
  date: string; // YYYY-MM-DD
  amount: number;
  count: number;
}

export interface CreditAnalyticsSummary {
  currentBalance: number;
  totalEarned: number;
  totalSpent: number;
  spentToday: number;
  spentThisMonth: number;
  transactionsCount: number;
  byToolBreakdown: Record<string, CreditToolSpend>;
  byTypeBreakdown: Record<string, { count: number; totalAmount: number }>;
  dailySpendHistory: CreditDailySpend[];
  burnRatePerDay: number;
  projectedRunwayDays: number | null; // null if infinite or 0 burn
}

export interface CreditCostEstimate {
  baseCost: number;
  batchMultiplier: number;
  aiSurcharge: number;
  resolutionSurcharge: number;
  totalEstimatedCredits: number;
  explanation: string;
}

export interface CreditTopUpPackage {
  id: string;
  name: string;
  credits: number;
  bonusCredits: number;
  price: number;
  currency: string;
  stripePriceId?: string;
  popular?: boolean;
  badge?: string;
  description?: string;
}

export const DEFAULT_CREDIT_PACKAGES: CreditTopUpPackage[] = [
  {
    id: 'pack_starter',
    name: 'Starter Boost',
    credits: 100,
    bonusCredits: 10,
    price: 4.99,
    currency: 'USD',
    description: 'Perfect for quick project processing and high-res upscaling.',
  },
  {
    id: 'pack_creator',
    name: 'Creator Pack',
    credits: 500,
    bonusCredits: 100,
    price: 19.99,
    currency: 'USD',
    popular: true,
    badge: 'Best Value (+20% Bonus)',
    description: 'Ideal for power creators processing heavy AI batches daily.',
  },
  {
    id: 'pack_studio',
    name: 'Studio Master',
    credits: 2000,
    bonusCredits: 500,
    price: 59.99,
    currency: 'USD',
    badge: '+25% Extra Credits',
    description: 'Bulk capacity for agencies, studios, and high-throughput pipelines.',
  },
];
