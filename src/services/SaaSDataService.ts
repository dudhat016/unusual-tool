import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  runTransaction,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  UserProfile,
  CreditLedgerRecord,
  TransactionType,
  ProcessingJobRecord,
  PlanTier,
  PlanConfig,
  SavedPreset,
  SystemErrorLog,
} from '../types/saas';
import {
  ToolAdminConfig,
  FeatureFlag,
  SystemSettings,
  AdminAuditLog,
} from '../types/admin';
import { AdSlotConfig } from '../types/ads';
import { DEFAULT_PLANS } from '../config/plans';
import { DEFAULT_SYSTEM_SETTINGS } from '../config/systemSettings';
import { DEFAULT_FEATURE_FLAGS } from '../config/featureFlags';
import { DEFAULT_AD_SLOTS } from '../config/adSlots';

export class SaaSDataService {
  private static getTodayString(): string {
    return new Date().toISOString().split('T')[0];
  }

  private static getCurrentMonthString(): string {
    return new Date().toISOString().substring(0, 7);
  }

  /**
   * Ensure user profile exists upon sign-in. If not, bootstrap with default Free plan & starter credits.
   */
  public static async getOrCreateUserProfile(
    uid: string,
    email: string | null,
    displayName: string | null,
    photoURL: string | null
  ): Promise<UserProfile> {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);

    const today = this.getTodayString();
    const thisMonth = this.getCurrentMonthString();

    if (snap.exists()) {
      const data = snap.data() as UserProfile;
      let needUpdate = false;
      const usage = data.usage || {
        todayProcessedCount: 0,
        todayAiCount: 0,
        monthProcessedCount: 0,
        monthAiCount: 0,
        totalProcessedCount: 0,
        lastActiveDate: today,
        currentMonth: thisMonth,
      };

      if (usage.lastActiveDate !== today) {
        usage.todayProcessedCount = 0;
        usage.todayAiCount = 0;
        usage.lastActiveDate = today;
        needUpdate = true;
      }

      if (usage.currentMonth !== thisMonth) {
        usage.monthProcessedCount = 0;
        usage.monthAiCount = 0;
        usage.currentMonth = thisMonth;
        needUpdate = true;
      }

      const isAdminEmail = email === 'unusualgamerz16@gmail.com';
      if (isAdminEmail && data.role !== 'admin') {
        data.role = 'admin';
        needUpdate = true;
      }

      if (needUpdate) {
        await updateDoc(userRef, { usage, role: data.role, updatedAt: Date.now() });
      }

      return { ...data, usage };
    }

    const isAdmin = email === 'unusualgamerz16@gmail.com';
    const initialCredits = DEFAULT_PLANS.free.monthlyCredits;

    const initialProfile: UserProfile = {
      uid,
      email,
      displayName: displayName || (email ? email.split('@')[0] : 'User'),
      photoURL,
      role: isAdmin ? 'admin' : 'user',
      plan: 'free',
      credits: initialCredits,
      usage: {
        todayProcessedCount: 0,
        todayAiCount: 0,
        monthProcessedCount: 0,
        monthAiCount: 0,
        totalProcessedCount: 0,
        lastActiveDate: today,
        currentMonth: thisMonth,
      },
      privacySettings: {
        telemetryOptIn: true,
        autoPurgeHistoryMinutes: 0,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await setDoc(userRef, initialProfile);

    await this.recordLedgerTransaction({
      userId: uid,
      transactionType: 'bonus',
      amount: initialCredits,
      description: 'Welcome Starter Credits (Free Tier)',
      balanceAfter: initialCredits,
    });

    return initialProfile;
  }

  /**
   * Atomic Credit Transaction Ledger
   */
  public static async executeCreditTransaction(
    userId: string,
    type: TransactionType,
    amount: number,
    description: string,
    toolId?: string,
    jobId?: string,
    metadata?: Record<string, any>
  ): Promise<{ success: boolean; newBalance: number; error?: string }> {
    const userRef = doc(db, 'users', userId);

    try {
      let finalBalance = 0;

      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) {
          throw new Error('User does not exist');
        }

        const userData = userDoc.data() as UserProfile;
        const currentBalance = userData.credits || 0;
        const newBalance = currentBalance + amount;

        if (newBalance < 0) {
          throw new Error(`Insufficient credits. Required: ${Math.abs(amount)}, Available: ${currentBalance}`);
        }

        finalBalance = newBalance;

        transaction.update(userRef, {
          credits: newBalance,
          updatedAt: Date.now(),
        });

        const ledgerRef = doc(collection(db, 'credit_ledger'));
        const ledgerItem: CreditLedgerRecord = {
          id: ledgerRef.id,
          userId,
          transactionType: type,
          amount,
          balanceAfter: newBalance,
          description,
          toolId,
          jobId,
          metadata,
          timestamp: Date.now(),
        };

        transaction.set(ledgerRef, ledgerItem);
      });

      return { success: true, newBalance: finalBalance };
    } catch (err: any) {
      return { success: false, newBalance: 0, error: err.message || 'Transaction failed' };
    }
  }

  public static async recordLedgerTransaction(data: Omit<CreditLedgerRecord, 'id' | 'timestamp'>) {
    const ledgerRef = doc(collection(db, 'credit_ledger'));
    const record: CreditLedgerRecord = {
      ...data,
      id: ledgerRef.id,
      timestamp: Date.now(),
    };
    await setDoc(ledgerRef, record);
    return record;
  }

  public static async logProcessingJob(
    userId: string,
    jobData: Omit<ProcessingJobRecord, 'id' | 'userId' | 'timestamp'>
  ): Promise<ProcessingJobRecord> {
    const jobRef = doc(collection(db, 'processing_jobs'));
    const jobRecord: ProcessingJobRecord = {
      ...jobData,
      id: jobRef.id,
      userId,
      timestamp: Date.now(),
    };

    await setDoc(jobRef, jobRecord);

    const userRef = doc(db, 'users', userId);
    try {
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const u = snap.data() as UserProfile;
        const usage = u.usage || {
          todayProcessedCount: 0,
          todayAiCount: 0,
          monthProcessedCount: 0,
          monthAiCount: 0,
          totalProcessedCount: 0,
          lastActiveDate: this.getTodayString(),
          currentMonth: this.getCurrentMonthString(),
        };

        usage.todayProcessedCount += 1;
        usage.monthProcessedCount += 1;
        usage.totalProcessedCount += 1;
        if (jobData.processorType === 'ai') {
          usage.todayAiCount += 1;
          usage.monthAiCount += 1;
        }

        await updateDoc(userRef, { usage, updatedAt: Date.now() });
      }
    } catch (e) {
      console.warn('Could not increment user usage count', e);
    }

    return jobRecord;
  }

  public static async getUserLedger(userId: string, limitCount = 50): Promise<CreditLedgerRecord[]> {
    try {
      const q = query(
        collection(db, 'credit_ledger'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data() as CreditLedgerRecord);
    } catch {
      return [];
    }
  }

  public static async getUserProcessingJobs(userId: string, limitCount = 50): Promise<ProcessingJobRecord[]> {
    try {
      const q = query(
        collection(db, 'processing_jobs'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data() as ProcessingJobRecord);
    } catch {
      return [];
    }
  }

  public static async updateUserPlan(
    userId: string,
    planId: PlanTier,
    provider: 'stripe' | 'lemonsqueezy' | 'paddle' | 'manual' = 'stripe',
    subscriptionId?: string
  ): Promise<boolean> {
    const userRef = doc(db, 'users', userId);
    const planConfig = DEFAULT_PLANS[planId] || DEFAULT_PLANS.free;

    const result = await this.executeCreditTransaction(
      userId,
      'subscription',
      planConfig.monthlyCredits,
      `Subscription Plan Update: ${planConfig.name} (${planConfig.monthlyCredits} credits)`
    );

    if (!result.success) return false;

    await updateDoc(userRef, {
      plan: planId,
      'subscription.status': 'active',
      'subscription.provider': provider,
      'subscription.subscriptionId': subscriptionId || `sub_${Date.now()}`,
      'subscription.currentPeriodEnd': Date.now() + 30 * 24 * 3600 * 1000,
      updatedAt: Date.now(),
    });

    return true;
  }

  // ================= PRESETS & WORKFLOWS ================= //

  public static async savePreset(userId: string, title: string, toolId: string, options: any): Promise<SavedPreset> {
    const pRef = doc(collection(db, 'presets'));
    const preset: SavedPreset = {
      id: pRef.id,
      userId,
      title,
      toolId,
      options,
      createdAt: Date.now(),
    };
    await setDoc(pRef, preset);
    return preset;
  }

  public static async getUserPresets(userId: string): Promise<SavedPreset[]> {
    try {
      const q = query(collection(db, 'presets'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data() as SavedPreset);
    } catch {
      return [];
    }
  }

  // ================= SYSTEM SETTINGS & FEATURE FLAGS ================= //

  public static async getSystemSettings(): Promise<SystemSettings> {
    try {
      const snap = await getDoc(doc(db, 'system_config', 'settings'));
      if (snap.exists()) {
        return { ...DEFAULT_SYSTEM_SETTINGS, ...snap.data() } as SystemSettings;
      }
    } catch (e) {
      console.warn('Using default system settings', e);
    }
    return DEFAULT_SYSTEM_SETTINGS;
  }

  public static async updateSystemSettings(settings: Partial<SystemSettings>, adminEmail = 'admin'): Promise<boolean> {
    try {
      await setDoc(doc(db, 'system_config', 'settings'), settings, { merge: true });
      await this.logAuditAction({
        adminEmail,
        action: 'UPDATE_SYSTEM_SETTINGS',
        targetType: 'settings',
        targetId: 'global',
        newValue: settings,
      });
      return true;
    } catch (e) {
      console.error('Failed to update system settings', e);
      return false;
    }
  }

  public static async getFeatureFlags(): Promise<FeatureFlag[]> {
    try {
      const snap = await getDocs(collection(db, 'feature_flags'));
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as FeatureFlag);
      }
    } catch {}
    return DEFAULT_FEATURE_FLAGS;
  }

  public static async updateFeatureFlag(flag: FeatureFlag, adminEmail = 'admin'): Promise<boolean> {
    try {
      await setDoc(doc(db, 'feature_flags', flag.key), flag);
      await this.logAuditAction({
        adminEmail,
        action: 'UPDATE_FEATURE_FLAG',
        targetType: 'feature_flag',
        targetId: flag.key,
        newValue: flag.status,
      });
      return true;
    } catch {
      return false;
    }
  }

  public static async getAdSlots(): Promise<AdSlotConfig[]> {
    try {
      const snap = await getDocs(collection(db, 'ad_slots'));
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as AdSlotConfig);
      }
    } catch {}
    return DEFAULT_AD_SLOTS;
  }

  public static async updateAdSlot(slot: AdSlotConfig, adminEmail = 'admin'): Promise<boolean> {
    try {
      await setDoc(doc(db, 'ad_slots', slot.id), slot);
      await this.logAuditAction({
        adminEmail,
        action: 'UPDATE_AD_SLOT',
        targetType: 'ads',
        targetId: slot.id,
        newValue: slot,
      });
      return true;
    } catch {
      return false;
    }
  }

  // ================= ADMIN & AUDIT ================= //

  public static async logAuditAction(action: Omit<AdminAuditLog, 'id' | 'timestamp'>): Promise<AdminAuditLog> {
    const logRef = doc(collection(db, 'admin_audit_logs'));
    const logItem: AdminAuditLog = {
      ...action,
      id: logRef.id,
      timestamp: Date.now(),
    };
    try {
      await setDoc(logRef, logItem);
    } catch {}
    return logItem;
  }

  public static async getAllAuditLogs(limitCount = 100): Promise<AdminAuditLog[]> {
    try {
      const q = query(collection(db, 'admin_audit_logs'), orderBy('timestamp', 'desc'), limit(limitCount));
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data() as AdminAuditLog);
    } catch {
      return [];
    }
  }

  public static async getAllUsers(limitCount = 100): Promise<UserProfile[]> {
    try {
      const q = query(collection(db, 'users'), limit(limitCount));
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data() as UserProfile);
    } catch {
      return [];
    }
  }

  public static async getAllJobs(limitCount = 100): Promise<ProcessingJobRecord[]> {
    try {
      const q = query(collection(db, 'processing_jobs'), orderBy('timestamp', 'desc'), limit(limitCount));
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data() as ProcessingJobRecord);
    } catch {
      return [];
    }
  }

  public static async getAllLedger(limitCount = 100): Promise<CreditLedgerRecord[]> {
    try {
      const q = query(collection(db, 'credit_ledger'), orderBy('timestamp', 'desc'), limit(limitCount));
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data() as CreditLedgerRecord);
    } catch {
      return [];
    }
  }

  public static async getAllErrorLogs(limitCount = 50): Promise<SystemErrorLog[]> {
    try {
      const q = query(collection(db, 'error_logs'), orderBy('timestamp', 'desc'), limit(limitCount));
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data() as SystemErrorLog);
    } catch {
      return [];
    }
  }

  public static async adminAdjustUserCredits(
    targetUserId: string,
    amount: number,
    reason: string,
    adminEmail = 'admin'
  ): Promise<{ success: boolean; newBalance: number; error?: string }> {
    const res = await this.executeCreditTransaction(
      targetUserId,
      amount >= 0 ? 'bonus' : 'refund',
      amount,
      `Admin Adjustment: ${reason}`
    );
    if (res.success) {
      await this.logAuditAction({
        adminEmail,
        action: 'ADJUST_CREDITS',
        targetType: 'credits',
        targetId: targetUserId,
        newValue: { amount, reason, newBalance: res.newBalance },
      });
    }
    return res;
  }

  public static async adminUpdateUserPlan(targetUserId: string, newPlan: PlanTier, adminEmail = 'admin'): Promise<void> {
    const userRef = doc(db, 'users', targetUserId);
    await updateDoc(userRef, {
      plan: newPlan,
      updatedAt: Date.now(),
    });
    await this.logAuditAction({
      adminEmail,
      action: 'UPDATE_USER_PLAN',
      targetType: 'plan',
      targetId: targetUserId,
      newValue: newPlan,
    });
  }

  public static async adminUpdateUserRole(targetUserId: string, newRole: 'user' | 'admin', adminEmail = 'admin'): Promise<void> {
    const userRef = doc(db, 'users', targetUserId);
    await updateDoc(userRef, {
      role: newRole,
      updatedAt: Date.now(),
    });
    await this.logAuditAction({
      adminEmail,
      action: 'UPDATE_USER_ROLE',
      targetType: 'user',
      targetId: targetUserId,
      newValue: newRole,
    });
  }

  public static async adminToggleUserSuspension(targetUserId: string, suspend: boolean, reason?: string, adminEmail = 'admin'): Promise<void> {
    const userRef = doc(db, 'users', targetUserId);
    await updateDoc(userRef, {
      isSuspended: suspend,
      suspensionReason: suspend ? reason || 'Administrative suspension' : null,
      updatedAt: Date.now(),
    });
    await this.logAuditAction({
      adminEmail,
      action: suspend ? 'SUSPEND_USER' : 'UNSUSPEND_USER',
      targetType: 'user',
      targetId: targetUserId,
      newValue: { isSuspended: suspend, reason },
    });
  }
}
