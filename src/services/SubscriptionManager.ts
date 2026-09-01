import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { DEFAULT_PLANS } from '../config/plans';
import {
  BillingCycle,
  InvoiceItem,
  PaymentProvider,
  PlanConfig,
  PlanTier,
  SubscriptionStatus,
  UserProfile,
  UserSubscriptionRecord,
} from '../types/saas';
import { SaaSDataService } from './SaaSDataService';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error in SubscriptionManager:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface ChangePlanParams {
  userId: string;
  targetPlanId: PlanTier;
  billingCycle?: BillingCycle;
  provider?: PaymentProvider;
  paymentMethod?: {
    brand?: string;
    last4?: string;
    expMonth?: number;
    expYear?: number;
  };
  userEmail?: string | null;
}

export class SubscriptionManager {
  // ================= PLANS COLLECTION (/plans/{planId}) ================= //

  /**
   * Fetch all SaaS subscription plans configured in the top-level 'plans' Firestore collection.
   * Auto-seeds DEFAULT_PLANS if the collection is empty.
   */
  public static async getPlans(): Promise<Record<string, PlanConfig>> {
    const path = 'plans';
    try {
      const snap = await getDocs(collection(db, path));
      if (!snap.empty) {
        const plansMap: Record<string, PlanConfig> = {};
        snap.docs.forEach((docSnap) => {
          const plan = docSnap.data() as PlanConfig;
          plansMap[plan.id] = plan;
        });
        return plansMap;
      }
      // Seed default plans if empty
      await this.seedPlansIfEmpty();
      return DEFAULT_PLANS;
    } catch (error) {
      console.warn('SubscriptionManager: using fallback default plans due to error:', error);
      return DEFAULT_PLANS;
    }
  }

  /**
   * Subscribe to live real-time updates of all subscription plans in Firestore.
   */
  public static subscribeToPlans(callback: (plans: Record<string, PlanConfig>) => void): () => void {
    const path = 'plans';
    try {
      const plansCol = collection(db, path);
      return onSnapshot(
        plansCol,
        (snap) => {
          if (!snap.empty) {
            const plansMap: Record<string, PlanConfig> = {};
            snap.docs.forEach((docSnap) => {
              const p = docSnap.data() as PlanConfig;
              plansMap[p.id] = p;
            });
            callback(plansMap);
          } else {
            this.seedPlansIfEmpty().then(() => callback(DEFAULT_PLANS));
          }
        },
        (error) => {
          console.warn('SubscriptionManager: plans real-time listener notice:', error);
          callback(DEFAULT_PLANS);
        }
      );
    } catch (err) {
      console.warn('SubscriptionManager: could not attach listener to plans collection:', err);
      callback(DEFAULT_PLANS);
      return () => {};
    }
  }

  /**
   * Get a single plan by its ID from Firestore or default configuration.
   */
  public static async getPlanById(planId: string): Promise<PlanConfig> {
    const path = `plans/${planId}`;
    try {
      const snap = await getDoc(doc(db, 'plans', planId));
      if (snap.exists()) {
        return snap.data() as PlanConfig;
      }
    } catch (error) {
      console.warn(`Could not get plan ${planId} from Firestore:`, error);
    }
    return DEFAULT_PLANS[planId] || DEFAULT_PLANS.free;
  }

  /**
   * Admin-only: Save or update a subscription plan in the 'plans' collection.
   */
  public static async savePlan(plan: PlanConfig, adminEmail = 'admin'): Promise<boolean> {
    const path = `plans/${plan.id}`;
    try {
      await setDoc(doc(db, 'plans', plan.id), plan, { merge: true });
      await SaaSDataService.logAuditAction({
        adminEmail,
        action: 'UPDATE_PLAN',
        targetType: 'plan',
        targetId: plan.id,
        newValue: plan,
      });
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  /**
   * Seed DEFAULT_PLANS into Firestore 'plans' collection if not already created.
   */
  public static async seedPlansIfEmpty(): Promise<void> {
    const path = 'plans';
    try {
      const snap = await getDocs(collection(db, path));
      if (snap.empty) {
        for (const [key, plan] of Object.entries(DEFAULT_PLANS)) {
          const docRef = doc(db, path, key);
          await setDoc(docRef, plan, { merge: true });
        }
      }
    } catch (error) {
      console.warn('SubscriptionManager: unable to seed default plans:', error);
    }
  }

  // ================= USER SUBSCRIPTIONS SUB-COLLECTION (/users/{userId}/subscriptions/{subscriptionId}) ================= //

  /**
   * Fetch all subscription history documents for a user from `/users/{userId}/subscriptions`.
   */
  public static async getUserSubscriptions(userId: string): Promise<UserSubscriptionRecord[]> {
    if (!userId) return [];
    const path = `users/${userId}/subscriptions`;
    try {
      const subCol = collection(db, 'users', userId, 'subscriptions');
      const q = query(subCol, orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data() as UserSubscriptionRecord);
    } catch (error) {
      console.warn(`Could not fetch subscriptions for user ${userId}:`, error);
      return [];
    }
  }

  /**
   * Real-time subscription listener for a user's subscriptions sub-collection.
   */
  public static subscribeToUserSubscriptions(
    userId: string,
    callback: (subs: UserSubscriptionRecord[]) => void
  ): () => void {
    if (!userId) {
      callback([]);
      return () => {};
    }
    const path = `users/${userId}/subscriptions`;
    try {
      const subCol = collection(db, 'users', userId, 'subscriptions');
      const q = query(subCol, orderBy('createdAt', 'desc'));
      return onSnapshot(
        q,
        (snap) => {
          const subs = snap.docs.map((d) => d.data() as UserSubscriptionRecord);
          callback(subs);
        },
        (error) => {
          console.warn(`User subscriptions snapshot error for ${userId}:`, error);
          callback([]);
        }
      );
    } catch (err) {
      console.warn(`Could not attach listener to subscriptions for ${userId}:`, err);
      callback([]);
      return () => {};
    }
  }

  /**
   * Get the active subscription for a user from their sub-collection.
   */
  public static async getActiveSubscription(userId: string): Promise<UserSubscriptionRecord | null> {
    if (!userId) return null;
    try {
      const subs = await this.getUserSubscriptions(userId);
      const active = subs.find((s) => s.status === 'active' || s.status === 'trialing');
      return active || subs[0] || null;
    } catch (error) {
      console.warn('Error fetching active subscription:', error);
      return null;
    }
  }

  /**
   * Upgrade or downgrade a user's plan.
   * 1. Creates/updates a subscription contract in `/users/{userId}/subscriptions/{subscriptionId}`.
   * 2. Updates the user profile doc `/users/{userId}` with new plan & subscription metadata.
   * 3. Executes credit transaction and logs credit ledger record.
   * 4. Adds invoice item to the subscription's invoice history.
   */
  public static async changePlan(params: ChangePlanParams): Promise<{
    success: boolean;
    subscription?: UserSubscriptionRecord;
    error?: string;
  }> {
    const {
      userId,
      targetPlanId,
      billingCycle = 'monthly',
      provider = 'stripe',
      paymentMethod = { brand: 'Visa', last4: '4242', expMonth: 12, expYear: 2028 },
      userEmail,
    } = params;

    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    const plans = await this.getPlans();
    const targetPlan = plans[targetPlanId] || DEFAULT_PLANS[targetPlanId] || DEFAULT_PLANS.free;

    const isFree = targetPlanId === 'free';
    const pricePaid = isFree
      ? 0
      : billingCycle === 'yearly'
      ? targetPlan.priceYearly
      : targetPlan.priceMonthly;

    const now = Date.now();
    const periodDuration = isFree
      ? 365 * 24 * 3600 * 1000
      : billingCycle === 'yearly'
      ? 365 * 24 * 3600 * 1000
      : 30 * 24 * 3600 * 1000;

    const currentPeriodStart = now;
    const currentPeriodEnd = now + periodDuration;
    const subscriptionDocId = `sub_${targetPlanId}_${Date.now()}`;
    const invoiceId = `inv_${Date.now().toString(36).toUpperCase()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const invoice: InvoiceItem = {
      id: invoiceId,
      subscriptionId: subscriptionDocId,
      amount: pricePaid,
      currency: targetPlan.currency || 'USD',
      date: now,
      status: 'paid',
      planName: targetPlan.name,
      billingCycle,
      description: isFree
        ? `Free Plan Activation (${targetPlan.monthlyCredits} starter credits)`
        : `${targetPlan.name} (${billingCycle === 'yearly' ? 'Annual' : 'Monthly'} Subscription)`,
      paymentMethod: isFree ? 'Free Tier' : `${paymentMethod.brand || 'Card'} •••• ${paymentMethod.last4 || '4242'}`,
    };

    const newSubscriptionRecord: UserSubscriptionRecord = {
      id: subscriptionDocId,
      userId,
      planId: targetPlanId,
      planName: targetPlan.name,
      billingCycle,
      status: 'active',
      provider,
      subscriptionId: subscriptionDocId,
      customerId: `cus_${userId.substring(0, 8)}`,
      pricePaid,
      currency: targetPlan.currency || 'USD',
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: false,
      canceledAt: null,
      monthlyCreditsAllotted: targetPlan.monthlyCredits,
      paymentMethodSummary: isFree ? undefined : paymentMethod,
      invoiceHistory: [invoice],
      createdAt: now,
      updatedAt: now,
    };

    const userRef = doc(db, 'users', userId);
    const subRef = doc(db, 'users', userId, 'subscriptions', subscriptionDocId);

    try {
      // 1. Write the new subscription record to the user's subscriptions subcollection
      await setDoc(subRef, newSubscriptionRecord);

      // 2. Grant credits for the updated tier
      const creditGrantAmount = targetPlan.monthlyCredits;
      await SaaSDataService.executeCreditTransaction(
        userId,
        'subscription',
        creditGrantAmount,
        `Plan Subscription: ${targetPlan.name} (${billingCycle.toUpperCase()}) - ${creditGrantAmount} credits granted`
      );

      // 3. Update the root user profile document
      await updateDoc(userRef, {
        plan: targetPlanId,
        subscription: {
          status: 'active',
          provider,
          subscriptionId: subscriptionDocId,
          customerId: `cus_${userId.substring(0, 8)}`,
          billingCycle,
          currentPeriodStart,
          currentPeriodEnd,
          cancelAtPeriodEnd: false,
        },
        updatedAt: now,
      });

      return {
        success: true,
        subscription: newSubscriptionRecord,
      };
    } catch (error) {
      console.error('SubscriptionManager.changePlan error:', error);
      handleFirestoreError(error, OperationType.WRITE, `users/${userId}/subscriptions/${subscriptionDocId}`);
    }
  }

  /**
   * Cancel an active subscription (either at period end or immediately).
   */
  public static async cancelSubscription(
    userId: string,
    subscriptionId: string,
    cancelAtPeriodEnd = true
  ): Promise<boolean> {
    if (!userId || !subscriptionId) return false;
    const path = `users/${userId}/subscriptions/${subscriptionId}`;
    const now = Date.now();

    try {
      const subRef = doc(db, 'users', userId, 'subscriptions', subscriptionId);
      const userRef = doc(db, 'users', userId);

      const status: SubscriptionStatus = cancelAtPeriodEnd ? 'active' : 'canceled';

      await updateDoc(subRef, {
        cancelAtPeriodEnd,
        status,
        canceledAt: now,
        updatedAt: now,
      });

      await updateDoc(userRef, {
        'subscription.cancelAtPeriodEnd': cancelAtPeriodEnd,
        'subscription.status': status,
        updatedAt: now,
      });

      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }

  /**
   * Resume a scheduled-for-cancellation subscription.
   */
  public static async resumeSubscription(userId: string, subscriptionId: string): Promise<boolean> {
    if (!userId || !subscriptionId) return false;
    const path = `users/${userId}/subscriptions/${subscriptionId}`;
    const now = Date.now();

    try {
      const subRef = doc(db, 'users', userId, 'subscriptions', subscriptionId);
      const userRef = doc(db, 'users', userId);

      await updateDoc(subRef, {
        cancelAtPeriodEnd: false,
        status: 'active',
        canceledAt: null,
        updatedAt: now,
      });

      await updateDoc(userRef, {
        'subscription.cancelAtPeriodEnd': false,
        'subscription.status': 'active',
        updatedAt: now,
      });

      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }

  /**
   * Update payment method for active subscription.
   */
  public static async updatePaymentMethod(
    userId: string,
    subscriptionId: string,
    paymentMethod: { brand: string; last4: string; expMonth: number; expYear: number }
  ): Promise<boolean> {
    if (!userId || !subscriptionId) return false;
    const path = `users/${userId}/subscriptions/${subscriptionId}`;
    try {
      const subRef = doc(db, 'users', userId, 'subscriptions', subscriptionId);
      await updateDoc(subRef, {
        paymentMethodSummary: paymentMethod,
        updatedAt: Date.now(),
      });
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }

  /**
   * Aggregate all billing invoice items across user subscriptions and ledger.
   */
  public static async getInvoices(userId: string): Promise<InvoiceItem[]> {
    if (!userId) return [];
    try {
      const subs = await this.getUserSubscriptions(userId);
      const allInvoices: InvoiceItem[] = [];

      subs.forEach((sub) => {
        if (sub.invoiceHistory && Array.isArray(sub.invoiceHistory)) {
          allInvoices.push(...sub.invoiceHistory);
        }
      });

      // Sort by date desc
      return allInvoices.sort((a, b) => b.date - a.date);
    } catch (error) {
      console.warn('Error fetching invoices:', error);
      return [];
    }
  }
}
