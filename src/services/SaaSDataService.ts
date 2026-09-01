import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore';
import { DEFAULT_AD_SLOTS } from '../config/adSlots';
import { DEFAULT_FEATURE_FLAGS } from '../config/featureFlags';
import { db } from '../config/firebase';
import { DEFAULT_PLANS } from '../config/plans';
import { DEFAULT_SYSTEM_SETTINGS } from '../config/systemSettings';
import { DEFAULT_CREDIT_PACKAGES, CreditTopUpPackage } from '../types/credits';
import {
  AdminAuditLog,
  FeatureFlag,
  SystemSettings,
  ToolUsageStatItem
} from '../types/admin';
import { AdSlotConfig } from '../types/ads';
import {
  CreditLedgerRecord,
  PlanConfig,
  PlanTier,
  ProcessingJobRecord,
  SavedPreset,
  SystemErrorLog,
  TransactionType,
  UserProfile
} from '../types/saas';

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

      const DEV_ADMIN_EMAILS = ['chintandudhat1286@gmail.com', 'unusualgamerz16@gmail.com'];
      const isAdminEmail = email ? DEV_ADMIN_EMAILS.includes(email.toLowerCase()) : false;

      if (isAdminEmail && data.role !== 'admin') {
        data.role = 'admin';
        needUpdate = true;
      }

      if (needUpdate) {
        await updateDoc(userRef, { usage, role: data.role, updatedAt: Date.now() });
      }

      return { ...data, usage };
    }

    const DEV_ADMIN_EMAILS = ['chintandudhat1286@gmail.com', 'unusualgamerz16@gmail.com'];
    const isAdminEmail = email ? DEV_ADMIN_EMAILS.includes(email.toLowerCase()) : false;
    const initialCredits = DEFAULT_PLANS.free.monthlyCredits;

    const initialProfile: UserProfile = {
      uid,
      email,
      displayName: displayName || (email ? email.split('@')[0] : 'User'),
      photoURL,
      role: isAdminEmail ? 'admin' : 'user',
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

    // Record tool usage stats in Firestore
    try {
      await this.recordToolUsage(
        jobData.toolId,
        jobData.toolName,
        jobData.processorType === 'ai' ? 'ai' : 'image',
        jobData.status !== 'failed',
        jobData.originalSize || 0,
        jobData.processingTimeMs || 300,
        jobData.processorType === 'ai'
      );
    } catch {
      // Non-blocking
    }

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
    try {
      const { SubscriptionManager } = await import('./SubscriptionManager');
      const res = await SubscriptionManager.changePlan({
        userId,
        targetPlanId: planId,
        provider,
      });
      return res.success;
    } catch {
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

  /**
   * Real-time listener for the 'system_settings' Firestore document ('global' document ID).
   * Automatically invokes the callback whenever settings change without requiring a page refresh.
   */
  public static subscribeToSystemSettings(
    callback: (settings: SystemSettings) => void
  ): () => void {
    try {
      const settingsDocRef = doc(db, 'system_settings', 'global');
      const unsubscribe = onSnapshot(
        settingsDocRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            const merged: SystemSettings = {
              ...DEFAULT_SYSTEM_SETTINGS,
              ...data,
            };
            callback(merged);
          } else {
            // If global doc does not exist yet, fallback to system_config/settings
            this.getSystemSettings().then(callback).catch(() => callback(DEFAULT_SYSTEM_SETTINGS));
          }
        },
        (error) => {
          console.warn('Real-time listener on system_settings/global encountered an issue:', error);
          // Fallback to one-time fetch
          this.getSystemSettings().then(callback).catch(() => callback(DEFAULT_SYSTEM_SETTINGS));
        }
      );
      return unsubscribe;
    } catch (err) {
      console.warn('Failed to attach real-time listener to system_settings:', err);
      return () => {};
    }
  }

  public static async getSystemSettings(): Promise<SystemSettings> {
    try {
      // First try system_settings/global document, with fallback to system_config/settings
      const snap = await getDoc(doc(db, 'system_settings', 'global'));
      if (snap.exists()) {
        return { ...DEFAULT_SYSTEM_SETTINGS, ...snap.data() } as SystemSettings;
      }
      const fallbackSnap = await getDoc(doc(db, 'system_config', 'settings'));
      if (fallbackSnap.exists()) {
        return { ...DEFAULT_SYSTEM_SETTINGS, ...fallbackSnap.data() } as SystemSettings;
      }
    } catch (e) {
      console.warn('Using default local system settings', e);
    }
    return DEFAULT_SYSTEM_SETTINGS;
  }

  public static async updateSystemSettings(settings: Partial<SystemSettings>, adminEmail = 'admin'): Promise<boolean> {
    try {
      // Save directly to the 'system_settings' Firestore document ('global' document id)
      await setDoc(doc(db, 'system_settings', 'global'), settings, { merge: true });
      // Keep system_config/settings synchronized
      try {
        await setDoc(doc(db, 'system_config', 'settings'), settings, { merge: true });
      } catch {
        // Non-blocking fallback sync
      }

      await this.logAuditAction({
        adminEmail,
        action: 'UPDATE_SYSTEM_SETTINGS',
        targetType: 'settings',
        targetId: 'global',
        newValue: settings,
      });
      return true;
    } catch (e) {
      console.error('Failed to update system settings in Firestore', e);
      return false;
    }
  }

  public static async getFeatureFlags(): Promise<FeatureFlag[]> {
    try {
      const snap = await getDocs(collection(db, 'feature_flags'));
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as FeatureFlag);
      } else {
        await this.seedFeatureFlagsIfEmpty();
      }
    } catch {}
    return DEFAULT_FEATURE_FLAGS;
  }

  public static subscribeToFeatureFlags(callback: (flags: FeatureFlag[]) => void): () => void {
    try {
      const colRef = collection(db, 'feature_flags');
      return onSnapshot(
        colRef,
        (snap) => {
          if (!snap.empty) {
            callback(snap.docs.map((d) => d.data() as FeatureFlag));
          } else {
            this.seedFeatureFlagsIfEmpty().then(() => callback(DEFAULT_FEATURE_FLAGS));
          }
        },
        (err) => {
          console.warn('Feature flags snapshot error:', err);
          callback(DEFAULT_FEATURE_FLAGS);
        }
      );
    } catch (e) {
      console.warn('Could not subscribe to feature flags in Firestore', e);
      callback(DEFAULT_FEATURE_FLAGS);
      return () => {};
    }
  }

  public static async updateFeatureFlag(flag: FeatureFlag, adminEmail = 'admin'): Promise<boolean> {
    try {
      await setDoc(doc(db, 'feature_flags', flag.key), flag, { merge: true });
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

  public static async deleteFeatureFlag(key: string, adminEmail = 'admin'): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'feature_flags', key));
      await this.logAuditAction({
        adminEmail,
        action: 'DELETE_FEATURE_FLAG',
        targetType: 'feature_flag',
        targetId: key,
      });
      return true;
    } catch {
      return false;
    }
  }

  public static async seedFeatureFlagsIfEmpty(): Promise<void> {
    try {
      const snap = await getDocs(collection(db, 'feature_flags'));
      if (snap.empty) {
        for (const flag of DEFAULT_FEATURE_FLAGS) {
          await setDoc(doc(db, 'feature_flags', flag.key), flag, { merge: true });
        }
      }
    } catch (e) {
      console.warn('Could not seed feature flags to Firestore', e);
    }
  }

  // ================= DYNAMIC CREDIT PACKAGES (FIRESTORE) ================= //

  public static async getCreditPackages(): Promise<CreditTopUpPackage[]> {
    try {
      const snap = await getDocs(collection(db, 'credit_packages'));
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as CreditTopUpPackage);
      } else {
        await this.seedCreditPackagesIfEmpty();
      }
    } catch (e) {
      console.warn('Could not fetch credit packages from Firestore:', e);
    }
    return DEFAULT_CREDIT_PACKAGES;
  }

  public static subscribeToCreditPackages(callback: (packages: CreditTopUpPackage[]) => void): () => void {
    try {
      const colRef = collection(db, 'credit_packages');
      return onSnapshot(
        colRef,
        (snap) => {
          if (!snap.empty) {
            callback(snap.docs.map((d) => d.data() as CreditTopUpPackage));
          } else {
            this.seedCreditPackagesIfEmpty().then(() => callback(DEFAULT_CREDIT_PACKAGES));
          }
        },
        (error) => {
          console.warn('Credit packages snapshot error:', error);
          callback(DEFAULT_CREDIT_PACKAGES);
        }
      );
    } catch (e) {
      console.warn('Could not subscribe to credit packages', e);
      callback(DEFAULT_CREDIT_PACKAGES);
      return () => {};
    }
  }

  public static async saveCreditPackage(pkg: CreditTopUpPackage, adminEmail = 'admin'): Promise<boolean> {
    try {
      const docRef = doc(db, 'credit_packages', pkg.id);
      await setDoc(docRef, pkg, { merge: true });
      await this.logAuditAction({
        adminEmail,
        action: 'UPDATE_CREDIT_PACKAGE',
        targetType: 'credit_package',
        targetId: pkg.id,
        newValue: pkg,
      });
      return true;
    } catch (e) {
      console.error('Failed to save credit package to Firestore', e);
      return false;
    }
  }

  public static async deleteCreditPackage(pkgId: string, adminEmail = 'admin'): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'credit_packages', pkgId));
      await this.logAuditAction({
        adminEmail,
        action: 'DELETE_CREDIT_PACKAGE',
        targetType: 'credit_package',
        targetId: pkgId,
      });
      return true;
    } catch (e) {
      console.error('Failed to delete credit package from Firestore', e);
      return false;
    }
  }

  public static async seedCreditPackagesIfEmpty(): Promise<void> {
    try {
      const snap = await getDocs(collection(db, 'credit_packages'));
      if (snap.empty) {
        for (const pkg of DEFAULT_CREDIT_PACKAGES) {
          await setDoc(doc(db, 'credit_packages', pkg.id), pkg, { merge: true });
        }
      }
    } catch (e) {
      console.warn('Could not seed credit packages to Firestore', e);
    }
  }

  // ================= DYNAMIC PLANS (FIRESTORE) ================= //

  public static async getPlans(): Promise<Record<string, PlanConfig>> {
    try {
      const snap = await getDocs(collection(db, 'plans'));
      if (!snap.empty) {
        const plansMap: Record<string, PlanConfig> = {};
        snap.docs.forEach((d) => {
          const plan = d.data() as PlanConfig;
          plansMap[plan.id] = plan;
        });
        return plansMap;
      } else {
        // Seed initial plans to Firestore
        await this.seedPlansIfEmpty();
      }
    } catch (e) {
      console.warn('Could not fetch plans from Firestore:', e);
    }
    return DEFAULT_PLANS;
  }

  public static subscribeToPlans(callback: (plans: Record<string, PlanConfig>) => void): () => void {
    try {
      const plansCol = collection(db, 'plans');
      return onSnapshot(
        plansCol,
        (snap) => {
          if (!snap.empty) {
            const plansMap: Record<string, PlanConfig> = {};
            snap.docs.forEach((d) => {
              const p = d.data() as PlanConfig;
              plansMap[p.id] = p;
            });
            callback(plansMap);
          } else {
            this.seedPlansIfEmpty().then(() => callback(DEFAULT_PLANS));
          }
        },
        (error) => {
          console.warn('Plans Firestore subscription notice:', error);
          callback(DEFAULT_PLANS);
        }
      );
    } catch (e) {
      console.warn('Could not subscribe to plans Firestore collection', e);
      callback(DEFAULT_PLANS);
      return () => {};
    }
  }

  public static async savePlan(plan: PlanConfig, adminEmail = 'admin'): Promise<boolean> {
    try {
      const docRef = doc(db, 'plans', plan.id);
      await setDoc(docRef, plan, { merge: true });
      await this.logAuditAction({
        adminEmail,
        action: 'UPDATE_PLAN',
        targetType: 'plan',
        targetId: plan.id,
        newValue: plan,
      });
      return true;
    } catch (e) {
      console.error('Failed to save plan to Firestore', e);
      return false;
    }
  }

  public static async seedPlansIfEmpty(): Promise<void> {
    try {
      const snap = await getDocs(collection(db, 'plans'));
      if (snap.empty) {
        for (const [key, plan] of Object.entries(DEFAULT_PLANS)) {
          const docRef = doc(db, 'plans', key);
          await setDoc(docRef, plan, { merge: true });
        }
      }
    } catch (e) {
      console.warn('Could not seed plans to Firestore', e);
    }
  }

  // ================= USER PROFILE & ACCOUNT SETTINGS (FIRESTORE) ================= //

  public static async getUserProfile(uid: string): Promise<UserProfile | null> {
    if (!uid) return null;
    try {
      const userRef = doc(db, 'users', uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        return snap.data() as UserProfile;
      }
      return null;
    } catch (e) {
      console.warn('Could not fetch user profile from Firestore', e);
      return null;
    }
  }

  public static subscribeToUserProfile(uid: string, callback: (profile: UserProfile | null) => void): () => void {
    if (!uid) {
      callback(null);
      return () => {};
    }
    try {
      const userRef = doc(db, 'users', uid);
      return onSnapshot(
        userRef,
        (snap) => {
          if (snap.exists()) {
            callback(snap.data() as UserProfile);
          } else {
            callback(null);
          }
        },
        (err) => {
          console.warn(`UserProfile snapshot error for ${uid}:`, err);
        }
      );
    } catch (e) {
      console.warn('Could not subscribe to user profile in Firestore', e);
      return () => {};
    }
  }

  public static async updateUserAccountSettings(uid: string, updates: Partial<UserProfile>): Promise<boolean> {
    if (!uid) return false;
    try {
      const userRef = doc(db, 'users', uid);
      const payload: Record<string, any> = {
        ...updates,
        updatedAt: Date.now(),
      };
      // Normalize avatar/photoURL aliases
      if (updates.avatar && !updates.photoURL) {
        payload.photoURL = updates.avatar;
      } else if (updates.photoURL && !updates.avatar) {
        payload.avatar = updates.photoURL;
      }

      await setDoc(userRef, payload, { merge: true });
      return true;
    } catch (e) {
      console.error('Failed to update user account settings in Firestore', e);
      return false;
    }
  }

  /**
   * Updates the user's theme preference in the 'users' Firestore document
   */
  public static async updateUserTheme(uid: string, theme: 'light' | 'dark' | 'system'): Promise<boolean> {
    if (!uid) return false;
    try {
      const userRef = doc(db, 'users', uid);
      await setDoc(
        userRef,
        {
          theme,
          themePreference: theme,
          updatedAt: Date.now(),
        },
        { merge: true }
      );
      return true;
    } catch (e) {
      console.warn('Failed to update user theme in Firestore', e);
      return false;
    }
  }

  // ================= USER FAVORITES (FIRESTORE 'favorites' COLLECTION) ================= //

  /**
   * Subscribe in real-time to the user's favorites from the 'favorites' Firestore collection
   */
  public static subscribeToUserFavorites(uid: string, callback: (favorites: string[]) => void): () => void {
    if (!uid) {
      callback([]);
      return () => {};
    }
    try {
      const favRef = doc(db, 'favorites', uid);
      return onSnapshot(
        favRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            const toolIds = Array.isArray(data.toolIds) ? data.toolIds : Array.isArray(data.favorites) ? data.favorites : [];
            callback(toolIds);
          } else {
            // Check fallback from user profile doc if favorites doc not yet created
            this.getUserProfile(uid).then((profile) => {
              if (profile && (profile as any).favoriteTools && Array.isArray((profile as any).favoriteTools)) {
                callback((profile as any).favoriteTools);
              } else {
                callback([]);
              }
            }).catch(() => callback([]));
          }
        },
        (error) => {
          console.warn('Firestore favorites listener error:', error);
          callback([]);
        }
      );
    } catch (e) {
      console.warn('Could not establish favorites subscription', e);
      callback([]);
      return () => {};
    }
  }

  /**
   * Fetch favorites for a user directly from the 'favorites' Firestore collection
   */
  public static async getUserFavorites(uid: string): Promise<string[]> {
    if (!uid) return [];
    try {
      const favRef = doc(db, 'favorites', uid);
      const favSnap = await getDoc(favRef);
      if (favSnap.exists()) {
        const data = favSnap.data();
        return Array.isArray(data.toolIds) ? data.toolIds : Array.isArray(data.favorites) ? data.favorites : [];
      }

      // Check legacy user document
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (Array.isArray(userData.favoriteTools)) {
          // Migrate to 'favorites' collection
          await setDoc(favRef, {
            id: uid,
            userId: uid,
            toolIds: userData.favoriteTools,
            updatedAt: Date.now(),
            createdAt: Date.now(),
          }, { merge: true });
          return userData.favoriteTools;
        }
      }
      return [];
    } catch (e) {
      console.warn('Failed to get user favorites from Firestore', e);
      return [];
    }
  }

  /**
   * Persist updated tool favorites into the 'favorites' Firestore collection
   */
  public static async updateUserFavorites(uid: string, favorites: string[]): Promise<boolean> {
    if (!uid) return false;
    try {
      const favRef = doc(db, 'favorites', uid);
      const now = Date.now();
      await setDoc(
        favRef,
        {
          id: uid,
          userId: uid,
          toolIds: favorites,
          updatedAt: now,
        },
        { merge: true }
      );

      // Also mirror to user profile document
      try {
        const userRef = doc(db, 'users', uid);
        await setDoc(
          userRef,
          {
            favoriteTools: favorites,
            updatedAt: now,
          },
          { merge: true }
        );
      } catch {}

      return true;
    } catch (e) {
      console.warn('Failed to update user favorites in Firestore favorites collection', e);
      return false;
    }
  }

  /**
   * Toggle a tool favorite in the 'favorites' collection and return the updated array
   */
  public static async toggleUserFavorite(uid: string, toolId: string, currentFavorites?: string[]): Promise<string[]> {
    if (!uid) return [];
    try {
      let existing = currentFavorites;
      if (!existing) {
        existing = await this.getUserFavorites(uid);
      }
      const nextFavorites = existing.includes(toolId)
        ? existing.filter((id) => id !== toolId)
        : [...existing, toolId];

      await this.updateUserFavorites(uid, nextFavorites);
      return nextFavorites;
    } catch (e) {
      console.warn('Error toggling user favorite in Firestore', e);
      return currentFavorites || [];
    }
  }

  // ================= PROCESSING JOBS / HISTORY (FIRESTORE) ================= //

  public static subscribeToUserJobs(uid: string, callback: (jobs: ProcessingJobRecord[]) => void): () => void {
    if (!uid) {
      callback([]);
      return () => {};
    }
    try {
      const q = query(
        collection(db, 'processing_jobs'),
        where('userId', '==', uid),
        orderBy('timestamp', 'desc'),
        limit(50)
      );
      return onSnapshot(
        q,
        (snap) => {
          const jobs = snap.docs.map((d) => d.data() as ProcessingJobRecord);
          callback(jobs);
        },
        (err) => {
          console.warn(`User jobs snapshot error for ${uid}:`, err);
          callback([]);
        }
      );
    } catch (e) {
      console.warn('Could not subscribe to user jobs in Firestore', e);
      return () => {};
    }
  }

  public static async deleteUserJob(uid: string, jobId: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'processing_jobs', jobId));
      return true;
    } catch (e) {
      console.error('Failed to delete processing job from Firestore', e);
      return false;
    }
  }

  public static async clearUserJobs(uid: string): Promise<boolean> {
    try {
      const q = query(collection(db, 'processing_jobs'), where('userId', '==', uid));
      const snap = await getDocs(q);
      const deletePromises = snap.docs.map((d) => deleteDoc(d.ref));
      await Promise.all(deletePromises);
      return true;
    } catch (e) {
      console.error('Failed to clear user jobs from Firestore', e);
      return false;
    }
  }

  // ================= CREDIT LEDGER (FIRESTORE) ================= //

  public static subscribeToUserLedger(uid: string, callback: (records: CreditLedgerRecord[]) => void): () => void {
    if (!uid) {
      callback([]);
      return () => {};
    }
    try {
      const q = query(
        collection(db, 'credit_ledger'),
        where('userId', '==', uid),
        orderBy('timestamp', 'desc'),
        limit(50)
      );
      return onSnapshot(
        q,
        (snap) => {
          const records = snap.docs.map((d) => d.data() as CreditLedgerRecord);
          callback(records);
        },
        (err) => {
          console.warn(`User ledger snapshot error for ${uid}:`, err);
          callback([]);
        }
      );
    } catch (e) {
      console.warn('Could not subscribe to user ledger in Firestore', e);
      return () => {};
    }
  }

  public static subscribeToToolUsageStats(callback: (stats: ToolUsageStatItem[]) => void): () => void {
    try {
      const statsCol = collection(db, 'tool_usage_stats');
      return onSnapshot(
        statsCol,
        (snap) => {
          if (!snap.empty) {
            callback(snap.docs.map((d) => d.data() as ToolUsageStatItem));
          } else {
            callback([]);
          }
        },
        (err) => {
          console.warn('Tool usage stats snapshot error:', err);
          callback([]);
        }
      );
    } catch (e) {
      console.warn('Could not subscribe to tool usage stats in Firestore', e);
      return () => {};
    }
  }

  public static async getAdSlots(): Promise<AdSlotConfig[]> {
    try {
      const snap = await getDocs(collection(db, 'ad_slots'));
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as AdSlotConfig);
      } else {
        await this.seedAdSlotsIfEmpty();
      }
    } catch {}
    return DEFAULT_AD_SLOTS;
  }

  public static subscribeToAdSlots(callback: (slots: AdSlotConfig[]) => void): () => void {
    try {
      const colRef = collection(db, 'ad_slots');
      return onSnapshot(
        colRef,
        (snap) => {
          if (!snap.empty) {
            callback(snap.docs.map((d) => d.data() as AdSlotConfig));
          } else {
            this.seedAdSlotsIfEmpty().then(() => callback(DEFAULT_AD_SLOTS));
          }
        },
        (err) => {
          console.warn('Ad slots snapshot error:', err);
          callback(DEFAULT_AD_SLOTS);
        }
      );
    } catch (e) {
      console.warn('Could not subscribe to ad slots in Firestore', e);
      callback(DEFAULT_AD_SLOTS);
      return () => {};
    }
  }

  public static async updateAdSlot(slot: AdSlotConfig, adminEmail = 'admin'): Promise<boolean> {
    try {
      await setDoc(doc(db, 'ad_slots', slot.id), slot, { merge: true });
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

  public static async deleteAdSlot(slotId: string, adminEmail = 'admin'): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'ad_slots', slotId));
      await this.logAuditAction({
        adminEmail,
        action: 'DELETE_AD_SLOT',
        targetType: 'ads',
        targetId: slotId,
      });
      return true;
    } catch {
      return false;
    }
  }

  public static async seedAdSlotsIfEmpty(): Promise<void> {
    try {
      const snap = await getDocs(collection(db, 'ad_slots'));
      if (snap.empty) {
        for (const slot of DEFAULT_AD_SLOTS) {
          await setDoc(doc(db, 'ad_slots', slot.id), slot, { merge: true });
        }
      }
    } catch (e) {
      console.warn('Could not seed ad slots to Firestore', e);
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

  public static subscribeToAllUsers(callback: (users: UserProfile[]) => void, limitCount = 150): () => void {
    try {
      const q = query(collection(db, 'users'), limit(limitCount));
      return onSnapshot(
        q,
        (snap) => {
          if (!snap.empty) {
            callback(snap.docs.map((d) => d.data() as UserProfile));
          } else {
            callback([]);
          }
        },
        (err) => {
          console.warn('All users snapshot error:', err);
          callback([]);
        }
      );
    } catch (e) {
      console.warn('Could not subscribe to users in Firestore', e);
      return () => {};
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

  public static subscribeToAllJobs(callback: (jobs: ProcessingJobRecord[]) => void, limitCount = 200): () => void {
    try {
      const q = query(collection(db, 'processing_jobs'), orderBy('timestamp', 'desc'), limit(limitCount));
      return onSnapshot(
        q,
        (snap) => {
          if (!snap.empty) {
            callback(snap.docs.map((d) => d.data() as ProcessingJobRecord));
          } else {
            callback([]);
          }
        },
        (err) => {
          console.warn('All jobs snapshot error:', err);
          callback([]);
        }
      );
    } catch (e) {
      console.warn('Could not subscribe to processing_jobs in Firestore', e);
      return () => {};
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

  public static subscribeToAllLedger(callback: (records: CreditLedgerRecord[]) => void, limitCount = 200): () => void {
    try {
      const q = query(collection(db, 'credit_ledger'), orderBy('timestamp', 'desc'), limit(limitCount));
      return onSnapshot(
        q,
        (snap) => {
          if (!snap.empty) {
            callback(snap.docs.map((d) => d.data() as CreditLedgerRecord));
          } else {
            callback([]);
          }
        },
        (err) => {
          console.warn('All ledger snapshot error:', err);
          callback([]);
        }
      );
    } catch (e) {
      console.warn('Could not subscribe to credit_ledger in Firestore', e);
      return () => {};
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

  public static subscribeToAllErrorLogs(callback: (logs: SystemErrorLog[]) => void, limitCount = 100): () => void {
    try {
      const q = query(collection(db, 'error_logs'), orderBy('timestamp', 'desc'), limit(limitCount));
      return onSnapshot(
        q,
        (snap) => {
          if (!snap.empty) {
            callback(snap.docs.map((d) => d.data() as SystemErrorLog));
          } else {
            callback([]);
          }
        },
        (err) => {
          console.warn('All error logs snapshot error:', err);
          callback([]);
        }
      );
    } catch (e) {
      console.warn('Could not subscribe to error_logs in Firestore', e);
      return () => {};
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

  // ================= TOOL USAGE ANALYTICS ================= //

  public static async recordToolUsage(
    toolId: string,
    toolName: string,
    category: string,
    success = true,
    bytesProcessed = 0,
    durationMs = 250,
    isAi = false
  ): Promise<void> {
    try {
      const docRef = doc(db, 'tool_usage_stats', toolId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as ToolUsageStatItem;
        const prevUsage = data.usageCount || 0;
        const nextUsage = prevUsage + 1;
        const prevDuration = data.avgDurationMs || 250;
        const newAvgDuration = Math.round((prevDuration * prevUsage + durationMs) / nextUsage);

        await updateDoc(docRef, {
          usageCount: nextUsage,
          successCount: (data.successCount || 0) + (success ? 1 : 0),
          failureCount: (data.failureCount || 0) + (success ? 0 : 1),
          totalBytesProcessed: (data.totalBytesProcessed || 0) + bytesProcessed,
          avgDurationMs: newAvgDuration,
          lastUsedAt: Date.now(),
          toolName: toolName || data.toolName,
          category: category || data.category,
          isAi: isAi ?? data.isAi,
        });
      } else {
        const newStat: ToolUsageStatItem = {
          id: toolId,
          toolId,
          toolName: toolName || toolId,
          category: category || 'general',
          usageCount: 1,
          successCount: success ? 1 : 0,
          failureCount: success ? 0 : 1,
          totalBytesProcessed: bytesProcessed,
          avgDurationMs: durationMs,
          lastUsedAt: Date.now(),
          isAi,
        };
        await setDoc(docRef, newStat);
      }
    } catch (e) {
      console.warn('Could not record tool usage in Firestore', e);
    }
  }

  public static async getToolUsageStats(): Promise<ToolUsageStatItem[]> {
    try {
      const snap = await getDocs(collection(db, 'tool_usage_stats'));
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as ToolUsageStatItem);
      }
    } catch (e) {
      console.warn('Could not fetch tool usage stats from Firestore', e);
    }
    return [];
  }
}
