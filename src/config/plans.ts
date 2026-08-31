import { PlanConfig, PlanTier } from '../types/saas';

// Dynamic plans are stored and fetched live from Firestore 'plans' collection (SaaSDataService)
export const DEFAULT_PLANS: Record<string, PlanConfig> = {
  free: {
    id: 'free',
    name: 'Free Creator',
    priceMonthly: 0,
    priceYearly: 0,
    currency: 'USD',
    monthlyCredits: 30,
    dailyImagesLimit: 50,
    maxFileSizeMB: 25,
    maxBatchSize: 20,
    maxResolutionMegapixels: 24,
    maxProcessingTimeMs: 45000,
    aiRateLimitPerMin: 5,
    adsEnabled: true,
    allowPriorityQueue: false,
    allowBulkZip: true,
    allowServerEngines: false,
    priority: 1,
    features: ['50 Daily Processings', '30 Monthly Credits', 'Free Tools Suite'],
  },
};

/**
 * Payment Provider Interface - allows pluggable integration for Stripe, LemonSqueezy, Paddle, PayPal
 */
export interface IPaymentProvider {
  providerName: 'stripe' | 'lemonsqueezy' | 'paddle' | 'manual';
  createCheckoutSession(planId: string, billingInterval: 'monthly' | 'yearly', userId: string, userEmail?: string): Promise<{ checkoutUrl: string; sessionId?: string }>;
  openCustomerPortal(customerId: string): Promise<{ portalUrl: string }>;
}

export class MockPaymentProviderAdapter implements IPaymentProvider {
  providerName: 'stripe' = 'stripe';

  async createCheckoutSession(
    planId: string,
    billingInterval: 'monthly' | 'yearly',
    userId: string,
    _userEmail?: string
  ): Promise<{ checkoutUrl: string; sessionId?: string }> {
    const simulatedSessionId = `cs_live_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return {
      checkoutUrl: `/dashboard?tab=subscription&checkout_success=true&plan=${planId}&interval=${billingInterval}&session_id=${simulatedSessionId}`,
      sessionId: simulatedSessionId,
    };
  }

  async openCustomerPortal(_customerId: string): Promise<{ portalUrl: string }> {
    return {
      portalUrl: `/dashboard?tab=subscription&portal_simulated=true`,
    };
  }
}
