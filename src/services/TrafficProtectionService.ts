import { PlanConfig, UserProfile } from '../types/saas';
import { SystemSettings } from '../types/admin';
import { DEFAULT_SYSTEM_SETTINGS } from '../config/systemSettings';

export interface RateLimitCheckResult {
  allowed: boolean;
  reason?: string;
  remainingDaily?: number;
  remainingRateLimit?: number;
  isAnonymousLimitReached?: boolean;
}

export class TrafficProtectionService {
  private static readonly ANON_SESSION_KEY = 'aetherpix_anon_session_id';
  private static readonly ANON_USAGE_KEY = 'aetherpix_anon_daily_usage';
  private static readonly RATE_LIMIT_BUCKET_KEY = 'aetherpix_rate_bucket';

  /**
   * Returns or initializes the persistent anonymous guest session ID
   */
  public static getAnonymousSessionId(): string {
    try {
      let anonId = localStorage.getItem(this.ANON_SESSION_KEY);
      if (!anonId) {
        anonId = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
        localStorage.setItem(this.ANON_SESSION_KEY, anonId);
      }
      return anonId;
    } catch {
      return `anon_${Date.now()}_temp`;
    }
  }

  /**
   * Get today's ISO date string
   */
  private static getTodayString(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Get anonymous guest usage count for today
   */
  public static getAnonymousDailyUsage(): number {
    try {
      const raw = localStorage.getItem(this.ANON_USAGE_KEY);
      if (!raw) return 0;
      const parsed = JSON.parse(raw);
      if (parsed.date !== this.getTodayString()) {
        localStorage.removeItem(this.ANON_USAGE_KEY);
        return 0;
      }
      return parsed.count || 0;
    } catch {
      return 0;
    }
  }

  /**
   * Increment anonymous guest daily usage
   */
  public static recordAnonymousUsage(count = 1): number {
    try {
      const current = this.getAnonymousDailyUsage();
      const nextCount = current + count;
      localStorage.setItem(
        this.ANON_USAGE_KEY,
        JSON.stringify({ date: this.getTodayString(), count: nextCount })
      );
      return nextCount;
    } catch {
      return count;
    }
  }

  /**
   * Check if user/guest is permitted to run image operations based on daily limits, file sizes, and emergency flags
   */
  public static validateExecution(
    user: UserProfile | null,
    planConfig: PlanConfig,
    systemSettings: SystemSettings = DEFAULT_SYSTEM_SETTINGS,
    requestedFileCount = 1,
    isAiOperation = false
  ): RateLimitCheckResult {
    // 1. Emergency Kill Switches
    if (systemSettings.emergencyAiDisabled && isAiOperation) {
      return {
        allowed: false,
        reason: 'AI super-resolution models are currently undergoing temporary cloud maintenance. Please try again shortly.',
      };
    }

    if (systemSettings.emergencyBatchDisabled && requestedFileCount > 1) {
      return {
        allowed: false,
        reason: 'Batch queues are temporarily limited to 1 file during high-traffic load balancing.',
      };
    }

    // 2. Anonymous Guest Verification
    if (!user) {
      const currentAnonUsage = this.getAnonymousDailyUsage();
      const limit = systemSettings.anonymousDailyLimit || 15;

      if (currentAnonUsage + requestedFileCount > limit) {
        return {
          allowed: false,
          isAnonymousLimitReached: true,
          remainingDaily: Math.max(0, limit - currentAnonUsage),
          reason: `You have reached your daily guest limit of ${limit} free images. Create a free account to get 50 daily processings and cloud presets!`,
        };
      }

      return {
        allowed: true,
        remainingDaily: Math.max(0, limit - (currentAnonUsage + requestedFileCount)),
      };
    }

    // 3. Registered User Account Verification
    if (user.isSuspended) {
      return {
        allowed: false,
        reason: `Account suspended: ${user.suspensionReason || 'Contact support for assistance.'}`,
      };
    }

    const todayUsage = user.usage?.todayProcessedCount || 0;
    const dailyCap = planConfig.dailyImagesLimit || 50;

    if (todayUsage + requestedFileCount > dailyCap && planConfig.id === 'free') {
      return {
        allowed: false,
        remainingDaily: Math.max(0, dailyCap - todayUsage),
        reason: `You have reached today's Free Tier limit of ${dailyCap} images. Upgrade to Pro for 500 images/day or wait until tomorrow!`,
      };
    }

    return {
      allowed: true,
      remainingDaily: Math.max(0, dailyCap - (todayUsage + requestedFileCount)),
    };
  }

  /**
   * In-memory sliding window rate limiter to protect client and proxy servers from script abuse
   */
  public static checkSlidingWindowRate(type: 'normal' | 'heavy' | 'ai'): { allowed: boolean; retryAfterMs?: number } {
    try {
      const now = Date.now();
      const raw = sessionStorage.getItem(`${this.RATE_LIMIT_BUCKET_KEY}_${type}`);
      const timestamps: number[] = raw ? JSON.parse(raw) : [];

      // Filter out timestamps older than 60 seconds
      const oneMinuteAgo = now - 60000;
      const validTimestamps = timestamps.filter((t) => t > oneMinuteAgo);

      const maxPerMinute = type === 'ai' ? 10 : type === 'heavy' ? 25 : 80;

      if (validTimestamps.length >= maxPerMinute) {
        const oldest = validTimestamps[0];
        const retryAfterMs = Math.max(1000, 60000 - (now - oldest));
        return { allowed: false, retryAfterMs };
      }

      validTimestamps.push(now);
      sessionStorage.setItem(`${this.RATE_LIMIT_BUCKET_KEY}_${type}`, JSON.stringify(validTimestamps));
      return { allowed: true };
    } catch {
      return { allowed: true };
    }
  }
}
