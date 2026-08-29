import { PlanConfig, PlanTier } from '../types/saas';

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
    maxResolutionMegapixels: 24, // 24 Megapixels (e.g. 6000x4000)
    maxProcessingTimeMs: 45000,
    aiRateLimitPerMin: 5,
    adsEnabled: true,
    allowPriorityQueue: false,
    allowBulkZip: true,
    allowServerEngines: false,
    priority: 1,
    features: [
      '50 Daily In-Browser Processings',
      'Batch processing up to 20 images',
      '30 Monthly AI & Neural Credits',
      'All 20+ Free Image & Creator Tools',
      'Up to 25MB file sizes',
      '100% In-Browser Privacy Protection',
      'Ad-Supported Free Tier',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro Studio',
    priceMonthly: 12,
    priceYearly: 115,
    currency: 'USD',
    monthlyCredits: 500,
    dailyImagesLimit: 500,
    maxFileSizeMB: 100,
    maxBatchSize: 100,
    maxResolutionMegapixels: 70, // 70 Megapixels
    maxProcessingTimeMs: 90000,
    aiRateLimitPerMin: 20,
    adsEnabled: false,
    allowPriorityQueue: true,
    allowBulkZip: true,
    allowServerEngines: true,
    priority: 2,
    features: [
      '100% Ad-Free Clean Studio Experience',
      '500 Daily Image Processings',
      'Large Batch Processing up to 100 images',
      '500 Monthly AI Super-Res & Background Credits',
      'Up to 100MB per image upload',
      'High-Resolution 70MP canvas exports',
      'Unlimited saved custom tool presets',
      'Priority processing queue',
    ],
  },
  business: {
    id: 'business',
    name: 'Enterprise Scale',
    priceMonthly: 39,
    priceYearly: 375,
    currency: 'USD',
    monthlyCredits: 2500,
    dailyImagesLimit: 2500,
    maxFileSizeMB: 500,
    maxBatchSize: 500,
    maxResolutionMegapixels: 200, // 200 Megapixels Ultra-HD
    maxProcessingTimeMs: 180000,
    aiRateLimitPerMin: 60,
    adsEnabled: false,
    allowPriorityQueue: true,
    allowBulkZip: true,
    allowServerEngines: true,
    priority: 3,
    features: [
      'Zero Ads & Maximum Processing Bandwidth',
      '2,500 Daily Image Processings',
      'Massive Batch Processing up to 500 images at once',
      '2,500 Monthly AI & Neural Super-Res Credits',
      'Up to 500MB RAW/High-Res uploads',
      'Ultra-HD 200MP processing canvas',
      'Shared tool presets & priority SLA',
      'Dedicated compliance and bulk cloud endpoints',
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
    userEmail?: string
  ): Promise<{ checkoutUrl: string; sessionId?: string }> {
    const simulatedSessionId = `cs_live_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return {
      checkoutUrl: `/dashboard?tab=subscription&checkout_success=true&plan=${planId}&interval=${billingInterval}&session_id=${simulatedSessionId}`,
      sessionId: simulatedSessionId,
    };
  }

  async openCustomerPortal(customerId: string): Promise<{ portalUrl: string }> {
    return {
      portalUrl: `/dashboard?tab=subscription&portal_simulated=true`,
    };
  }
}
