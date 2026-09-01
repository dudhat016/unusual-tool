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
    features: [
      '50 Daily Image Transforms',
      '30 Monthly AI Credits',
      'Standard Browser Processing',
      'Up to 25MB File Size',
      'Max 20 Files per Batch',
      'Community Support'
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro Creator',
    priceMonthly: 12,
    priceYearly: 99,
    currency: 'USD',
    monthlyCredits: 300,
    dailyImagesLimit: 500,
    maxFileSizeMB: 100,
    maxBatchSize: 50,
    maxResolutionMegapixels: 70,
    maxProcessingTimeMs: 90000,
    aiRateLimitPerMin: 20,
    adsEnabled: false,
    allowPriorityQueue: true,
    allowBulkZip: true,
    allowServerEngines: true,
    priority: 2,
    features: [
      '500 Daily Image Transforms',
      '300 Monthly AI Credits',
      '100% Ad-Free Experience',
      'Priority Fast-Track Queue',
      'Up to 100MB File Size',
      'Max 50 Files per Batch',
      'High-Resolution AI Enhancer',
      'Priority Email Support'
    ],
  },
  business: {
    id: 'business',
    name: 'Studio & Business',
    priceMonthly: 29,
    priceYearly: 249,
    currency: 'USD',
    monthlyCredits: 1500,
    dailyImagesLimit: 5000,
    maxFileSizeMB: 500,
    maxBatchSize: 150,
    maxResolutionMegapixels: 200,
    maxProcessingTimeMs: 180000,
    aiRateLimitPerMin: 60,
    adsEnabled: false,
    allowPriorityQueue: true,
    allowBulkZip: true,
    allowServerEngines: true,
    priority: 3,
    features: [
      'Unlimited / 5,000 Daily Transforms',
      '1,500 Monthly AI Credits',
      '100% Ad-Free Experience',
      'Dedicated Server AI Engines',
      'Up to 500MB File Size',
      'Max 150 Files per Batch',
      'Ultra HD 200MP Processing',
      'Custom Presets & Team Workflows',
      '24/7 Dedicated Support'
    ],
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
      checkoutUrl: `/dashboard/subscription?checkout_success=true&plan=${planId}&interval=${billingInterval}&session_id=${simulatedSessionId}`,
      sessionId: simulatedSessionId,
    };
  }

  async openCustomerPortal(_customerId: string): Promise<{ portalUrl: string }> {
    return {
      portalUrl: `/dashboard/subscription?portal_simulated=true`,
    };
  }
}
