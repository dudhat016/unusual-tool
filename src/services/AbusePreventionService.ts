import { PlanConfig, AbuseRateLimitCheck } from '../types/saas';
import { DEFAULT_PLANS } from '../config/plans';

export class AbusePreventionService {
  // In-memory sliding window trackers for anonymous & authenticated operations
  private static recentCalls: { timestamp: number; key: string }[] = [];
  private static aiCalls: { timestamp: number; key: string }[] = [];

  /**
   * Validate upload file size against active plan limits
   */
  public static validateFileSize(fileSize: number, planConfig: PlanConfig): { allowed: boolean; message?: string } {
    const maxBytes = planConfig.maxFileSizeMB * 1024 * 1024;
    if (fileSize > maxBytes) {
      return {
        allowed: false,
        message: `File exceeds maximum allowed size of ${planConfig.maxFileSizeMB}MB for your ${planConfig.name}. Please compress or upgrade to Pro/Business.`,
      };
    }
    return { allowed: true };
  }

  /**
   * Validate batch size against active plan limits
   */
  public static validateBatchSize(itemCount: number, planConfig: PlanConfig): { allowed: boolean; message?: string } {
    if (itemCount > planConfig.maxBatchSize) {
      return {
        allowed: false,
        message: `Batch size (${itemCount} images) exceeds your plan limit of ${planConfig.maxBatchSize} images at a time.`,
      };
    }
    return { allowed: true };
  }

  /**
   * Validate image resolution against active plan limits
   */
  public static validateResolution(
    width: number,
    height: number,
    planConfig: PlanConfig
  ): { allowed: boolean; message?: string } {
    const megapixels = (width * height) / 1000000;
    if (megapixels > planConfig.maxResolutionMegapixels) {
      return {
        allowed: false,
        message: `Image resolution (${megapixels.toFixed(1)} Megapixels) exceeds your ${planConfig.name} limit (${planConfig.maxResolutionMegapixels} MP).`,
      };
    }
    return { allowed: true };
  }

  /**
   * AI Quota & Rate Limiter per minute
   */
  public static checkAiRateLimit(userKey: string, planConfig: PlanConfig): AbuseRateLimitCheck {
    const now = Date.now();
    const oneMinAgo = now - 60000;

    // Prune expired
    this.aiCalls = this.aiCalls.filter((c) => c.timestamp > oneMinAgo);

    const userCalls = this.aiCalls.filter((c) => c.key === userKey);
    if (userCalls.length >= planConfig.aiRateLimitPerMin) {
      return {
        allowed: false,
        reason: `AI Rate limit reached (${planConfig.aiRateLimitPerMin} requests/minute). Please wait 30 seconds or upgrade your plan.`,
        remainingCalls: 0,
        resetSeconds: 30,
      };
    }

    this.aiCalls.push({ timestamp: now, key: userKey });
    return {
      allowed: true,
      remainingCalls: planConfig.aiRateLimitPerMin - userCalls.length - 1,
    };
  }

  /**
   * General Request Rate Limiter (Prevent DDOS / spam clicks)
   */
  public static checkGeneralRateLimit(clientKey: string, maxCallsPerMin = 40): AbuseRateLimitCheck {
    const now = Date.now();
    const oneMinAgo = now - 60000;

    this.recentCalls = this.recentCalls.filter((c) => c.timestamp > oneMinAgo);
    const clientCalls = this.recentCalls.filter((c) => c.key === clientKey);

    if (clientCalls.length >= maxCallsPerMin) {
      return {
        allowed: false,
        reason: 'Too many requests in a short time. Please slow down.',
        resetSeconds: 15,
      };
    }

    this.recentCalls.push({ timestamp: now, key: clientKey });
    return { allowed: true };
  }
}
