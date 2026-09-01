import {
  collection,
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
  where,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { DEFAULT_PLANS } from '../config/plans';
import {
  CreditAnalyticsSummary,
  CreditCheckResult,
  CreditCostEstimate,
  CreditDailySpend,
  CreditToolSpend,
  CreditTopUpPackage,
  DEFAULT_CREDIT_PACKAGES,
  ConsumeCreditParams,
  GrantCreditParams,
  RefundCreditParams,
} from '../types/credits';
import {
  CreditLedgerRecord,
  PlanTier,
  TransactionType,
  UserProfile,
  UserUsageStats,
} from '../types/saas';

export class CreditManager {
  private static getTodayString(): string {
    return new Date().toISOString().split('T')[0];
  }

  private static getCurrentMonthString(): string {
    return new Date().toISOString().substring(0, 7);
  }

  /**
   * Real-time listener for user credit balance & usage telemetry from Firestore
   */
  public static subscribeToBalance(
    userId: string,
    callback: (data: {
      credits: number;
      usage: UserUsageStats;
      plan: PlanTier;
      updatedAt: number;
    } | null) => void
  ): () => void {
    if (!userId) {
      callback(null);
      return () => {};
    }

    const userRef = doc(db, 'users', userId);
    return onSnapshot(
      userRef,
      (snap) => {
        if (snap.exists()) {
          const u = snap.data() as UserProfile;
          callback({
            credits: typeof u.credits === 'number' ? u.credits : 0,
            usage: u.usage || {
              todayProcessedCount: 0,
              todayAiCount: 0,
              monthProcessedCount: 0,
              monthAiCount: 0,
              totalProcessedCount: 0,
              lastActiveDate: this.getTodayString(),
              currentMonth: this.getCurrentMonthString(),
            },
            plan: u.plan || 'free',
            updatedAt: u.updatedAt || Date.now(),
          });
        } else {
          callback(null);
        }
      },
      (error) => {
        console.warn('[CreditManager] Balance subscription error:', error);
      }
    );
  }

  /**
   * Real-time listener for user credit ledger transaction history from Firestore
   */
  public static subscribeToLedger(
    userId: string,
    callback: (records: CreditLedgerRecord[]) => void,
    limitCount = 100
  ): () => void {
    if (!userId) {
      callback([]);
      return () => {};
    }

    try {
      const q = query(
        collection(db, 'credit_ledger'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      return onSnapshot(
        q,
        (snap) => {
          const records = snap.docs.map((d) => d.data() as CreditLedgerRecord);
          callback(records);
        },
        (error) => {
          console.warn('[CreditManager] Ledger subscription fallback error:', error);
          // Fallback query if composite index is building
          const fallbackQ = query(
            collection(db, 'credit_ledger'),
            where('userId', '==', userId),
            limit(limitCount)
          );
          return onSnapshot(fallbackQ, (fSnap) => {
            const list = fSnap.docs.map((d) => d.data() as CreditLedgerRecord);
            list.sort((a, b) => b.timestamp - a.timestamp);
            callback(list);
          });
        }
      );
    } catch (err) {
      console.warn('[CreditManager] Could not establish ledger listener', err);
      return () => {};
    }
  }

  /**
   * Atomic credit consumption transaction
   * Validates sufficient balance, updates user credits and usage counters, and commits an immutable ledger log.
   */
  public static async consumeCredits(
    params: ConsumeCreditParams
  ): Promise<{ success: boolean; newBalance: number; transactionId?: string; error?: string }> {
    const {
      userId,
      amount,
      toolId,
      toolName = 'Tool Execution',
      jobId,
      description,
      isAi = false,
      userEmail,
      metadata = {},
    } = params;

    if (!userId) {
      return { success: false, newBalance: 0, error: 'User ID is required to consume credits.' };
    }

    if (amount <= 0) {
      // 0-cost standard processing does not require balance deduction
      const current = await this.getCurrentBalance(userId);
      return { success: true, newBalance: current };
    }

    const userRef = doc(db, 'users', userId);
    const today = this.getTodayString();
    const currentMonth = this.getCurrentMonthString();

    try {
      let finalBalance = 0;
      let generatedLedgerId = '';

      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) {
          throw new Error('User profile does not exist in Firestore.');
        }

        const userData = userDoc.data() as UserProfile;
        const currentBalance = typeof userData.credits === 'number' ? userData.credits : 0;

        if (currentBalance < amount) {
          throw new Error(
            `Insufficient credits. Required: ${amount}, Available: ${currentBalance}. Please upgrade or top up.`
          );
        }

        finalBalance = currentBalance - amount;

        // Maintain usage stats
        const usage: UserUsageStats = userData.usage || {
          todayProcessedCount: 0,
          todayAiCount: 0,
          monthProcessedCount: 0,
          monthAiCount: 0,
          totalProcessedCount: 0,
          lastActiveDate: today,
          currentMonth: currentMonth,
        };

        if (usage.lastActiveDate !== today) {
          usage.todayProcessedCount = 0;
          usage.todayAiCount = 0;
          usage.lastActiveDate = today;
        }

        if (usage.currentMonth !== currentMonth) {
          usage.monthProcessedCount = 0;
          usage.monthAiCount = 0;
          usage.currentMonth = currentMonth;
        }

        usage.todayProcessedCount += 1;
        usage.monthProcessedCount += 1;
        usage.totalProcessedCount += 1;
        if (isAi || toolId?.includes('ai') || toolId?.includes('upscaler') || toolId?.includes('eraser') || toolId?.includes('bg-remover')) {
          usage.todayAiCount += 1;
          usage.monthAiCount += 1;
        }

        // 1. Update user profile document
        transaction.update(userRef, {
          credits: finalBalance,
          usage,
          updatedAt: Date.now(),
        });

        // 2. Append immutable ledger transaction entry
        const ledgerRef = doc(collection(db, 'credit_ledger'));
        generatedLedgerId = ledgerRef.id;

        const ledgerRecord: CreditLedgerRecord = {
          id: ledgerRef.id,
          userId,
          transactionType: 'usage',
          amount: -amount,
          balanceAfter: finalBalance,
          toolId: toolId || undefined,
          jobId: jobId || undefined,
          description: description || `Used ${amount} credit${amount > 1 ? 's' : ''} for ${toolName}`,
          metadata: {
            ...metadata,
            toolName,
            isAi,
            userEmail: userEmail || userData.email || auth.currentUser?.email || undefined,
          },
          timestamp: Date.now(),
        };

        transaction.set(ledgerRef, ledgerRecord);
      });

      return {
        success: true,
        newBalance: finalBalance,
        transactionId: generatedLedgerId,
      };
    } catch (err: any) {
      console.error('[CreditManager] Credit consumption failed:', err);
      return {
        success: false,
        newBalance: 0,
        error: err.message || 'Transaction failed. Please try again.',
      };
    }
  }

  /**
   * Atomic credit grant (Purchases, Bonuses, Plan Renewals, Admin Adjustments)
   */
  public static async grantCredits(
    params: GrantCreditParams
  ): Promise<{ success: boolean; newBalance: number; transactionId?: string; error?: string }> {
    const {
      userId,
      amount,
      type,
      description,
      toolId,
      jobId,
      metadata = {},
      adminEmail,
    } = params;

    if (!userId) {
      return { success: false, newBalance: 0, error: 'User ID is required.' };
    }

    if (amount <= 0) {
      return { success: false, newBalance: 0, error: 'Grant amount must be greater than zero.' };
    }

    const userRef = doc(db, 'users', userId);

    try {
      let finalBalance = 0;
      let generatedLedgerId = '';

      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) {
          throw new Error('User profile not found.');
        }

        const userData = userDoc.data() as UserProfile;
        const currentBalance = typeof userData.credits === 'number' ? userData.credits : 0;
        finalBalance = currentBalance + amount;

        // 1. Update user profile credits
        transaction.update(userRef, {
          credits: finalBalance,
          updatedAt: Date.now(),
        });

        // 2. Append ledger log
        const ledgerRef = doc(collection(db, 'credit_ledger'));
        generatedLedgerId = ledgerRef.id;

        const ledgerRecord: CreditLedgerRecord = {
          id: ledgerRef.id,
          userId,
          transactionType: type,
          amount: amount,
          balanceAfter: finalBalance,
          toolId,
          jobId,
          description: description || `Granted +${amount} credits (${type})`,
          metadata: {
            ...metadata,
            adminEmail: adminEmail || auth.currentUser?.email || undefined,
          },
          timestamp: Date.now(),
        };

        transaction.set(ledgerRef, ledgerRecord);
      });

      return {
        success: true,
        newBalance: finalBalance,
        transactionId: generatedLedgerId,
      };
    } catch (err: any) {
      console.error('[CreditManager] Credit grant failed:', err);
      return {
        success: false,
        newBalance: 0,
        error: err.message || 'Failed to grant credits.',
      };
    }
  }

  /**
   * Atomic credit refund when a job execution fails
   */
  public static async refundCredits(
    params: RefundCreditParams
  ): Promise<{ success: boolean; newBalance: number; transactionId?: string; error?: string }> {
    const { userId, amount, jobId, toolId, reason, metadata = {} } = params;

    return this.grantCredits({
      userId,
      amount,
      type: 'refund',
      description: `Refund: ${reason || 'Failed processing job'}`,
      toolId,
      jobId,
      metadata: {
        ...metadata,
        reason,
        refundedAt: Date.now(),
      },
    });
  }

  /**
   * Pre-check credit balance before starting a job
   */
  public static async checkCreditAvailability(
    userId: string,
    requiredAmount: number
  ): Promise<CreditCheckResult> {
    if (!userId) {
      return {
        allowed: false,
        currentBalance: 0,
        requiredAmount,
        deficit: requiredAmount,
        userPlan: 'free',
      };
    }

    try {
      const userRef = doc(db, 'users', userId);
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        return {
          allowed: false,
          currentBalance: 0,
          requiredAmount,
          deficit: requiredAmount,
          userPlan: 'free',
        };
      }

      const userData = snap.data() as UserProfile;
      const currentBalance = typeof userData.credits === 'number' ? userData.credits : 0;
      const allowed = currentBalance >= requiredAmount;
      const deficit = allowed ? 0 : requiredAmount - currentBalance;

      return {
        allowed,
        currentBalance,
        requiredAmount,
        deficit,
        userPlan: userData.plan || 'free',
      };
    } catch (error) {
      console.warn('[CreditManager] checkCreditAvailability error:', error);
      return {
        allowed: false,
        currentBalance: 0,
        requiredAmount,
        deficit: requiredAmount,
        userPlan: 'free',
      };
    }
  }

  /**
   * Current balance helper
   */
  public static async getCurrentBalance(userId: string): Promise<number> {
    if (!userId) return 0;
    try {
      const userRef = doc(db, 'users', userId);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        return typeof data.credits === 'number' ? data.credits : 0;
      }
      return 0;
    } catch {
      return 0;
    }
  }

  /**
   * Top-up credit package purchase handler
   */
  public static async purchaseTopUpPackage(
    userId: string,
    packageId: string,
    paymentMethod = 'card_mock_saved'
  ): Promise<{ success: boolean; creditsAdded: number; newBalance: number; error?: string }> {
    let packages: CreditTopUpPackage[] = [];
    try {
      const snap = await getDocs(collection(db, 'credit_packages'));
      if (!snap.empty) {
        packages = snap.docs.map((d) => d.data() as CreditTopUpPackage);
      }
    } catch {}

    if (packages.length === 0) {
      packages = DEFAULT_CREDIT_PACKAGES;
    }

    const pack = packages.find((p) => p.id === packageId) || DEFAULT_CREDIT_PACKAGES.find((p) => p.id === packageId);
    if (!pack) {
      return { success: false, creditsAdded: 0, newBalance: 0, error: 'Credit package not found.' };
    }

    const totalCredits = pack.credits + pack.bonusCredits;
    const res = await this.grantCredits({
      userId,
      amount: totalCredits,
      type: 'purchase',
      description: `Purchased ${pack.name} (+${pack.credits} Credits${pack.bonusCredits > 0 ? ` + ${pack.bonusCredits} Bonus` : ''})`,
      metadata: {
        packageId: pack.id,
        packageName: pack.name,
        baseCredits: pack.credits,
        bonusCredits: pack.bonusCredits,
        pricePaid: pack.price,
        currency: pack.currency,
        paymentMethod,
        invoiceNumber: `INV-CREDIT-${Date.now().toString().slice(-6)}`,
      },
    });

    if (res.success) {
      return {
        success: true,
        creditsAdded: totalCredits,
        newBalance: res.newBalance,
      };
    }

    return {
      success: false,
      creditsAdded: 0,
      newBalance: 0,
      error: res.error || 'Failed to complete credit purchase.',
    };
  }

  /**
   * Dynamic Cost Calculation based on tool type, batch size, and resolution
   */
  public static calculateCost(
    toolId: string,
    options: {
      isAi?: boolean;
      batchSize?: number;
      resolutionMegapixels?: number;
    } = {}
  ): CreditCostEstimate {
    const { isAi = false, batchSize = 1, resolutionMegapixels = 2 } = options;

    let baseCost = 1;
    let aiSurcharge = 0;
    let resolutionSurcharge = 0;

    // AI Tools pricing logic
    if (isAi || toolId.includes('ai') || toolId.includes('upscaler') || toolId.includes('eraser') || toolId.includes('bg-remover')) {
      if (toolId.includes('upscaler') || toolId.includes('super-resolution')) {
        aiSurcharge = 2; // Total 3 credits per image
      } else if (toolId.includes('bg-remover') || toolId.includes('background')) {
        aiSurcharge = 1; // Total 2 credits per image
      } else if (toolId.includes('object-eraser') || toolId.includes('inpaint')) {
        aiSurcharge = 1; // Total 2 credits per image
      } else if (toolId.includes('colorizer') || toolId.includes('restoration')) {
        aiSurcharge = 1; // Total 2 credits per image
      } else {
        aiSurcharge = 1; // Standard AI tool
      }
    } else {
      // Standard client-side/Wasm tools (compress, resize, crop, filter, convert)
      baseCost = 1;
    }

    // High resolution bonus surcharge (e.g. Ultra HD 4K+ / 24MP+)
    if (resolutionMegapixels > 30) {
      resolutionSurcharge = 1;
    }

    const unitCost = baseCost + aiSurcharge + resolutionSurcharge;
    const batchMultiplier = Math.max(1, batchSize);
    const totalEstimatedCredits = unitCost * batchMultiplier;

    let explanation = `${unitCost} credit${unitCost > 1 ? 's' : ''} per image`;
    if (batchMultiplier > 1) {
      explanation += ` × ${batchMultiplier} images = ${totalEstimatedCredits} credits`;
    }

    return {
      baseCost,
      batchMultiplier,
      aiSurcharge,
      resolutionSurcharge,
      totalEstimatedCredits,
      explanation,
    };
  }

  /**
   * Aggregate user credit consumption analytics from history records
   */
  public static async getCreditAnalytics(
    userId: string,
    existingLedger?: CreditLedgerRecord[]
  ): Promise<CreditAnalyticsSummary> {
    let ledger = existingLedger;
    if (!ledger || ledger.length === 0) {
      ledger = await this.getUserLedger(userId, 500);
    }

    let currentBalance = 0;
    try {
      currentBalance = await this.getCurrentBalance(userId);
    } catch {
      currentBalance = ledger.length > 0 ? ledger[0].balanceAfter : 0;
    }

    let totalEarned = 0;
    let totalSpent = 0;
    let spentToday = 0;
    let spentThisMonth = 0;

    const todayStr = this.getTodayString();
    const thisMonthStr = this.getCurrentMonthString();

    const byToolBreakdown: Record<string, CreditToolSpend> = {};
    const byTypeBreakdown: Record<string, { count: number; totalAmount: number }> = {};
    const dailyMap: Record<string, { amount: number; count: number }> = {};

    for (const record of ledger) {
      const recDate = new Date(record.timestamp);
      const dateStr = recDate.toISOString().split('T')[0];
      const monthStr = dateStr.substring(0, 7);

      // By type breakdown
      if (!byTypeBreakdown[record.transactionType]) {
        byTypeBreakdown[record.transactionType] = { count: 0, totalAmount: 0 };
      }
      byTypeBreakdown[record.transactionType].count += 1;
      byTypeBreakdown[record.transactionType].totalAmount += Math.abs(record.amount);

      if (record.amount > 0) {
        totalEarned += record.amount;
      } else {
        const spentAmt = Math.abs(record.amount);
        totalSpent += spentAmt;

        if (dateStr === todayStr) {
          spentToday += spentAmt;
        }

        if (monthStr === thisMonthStr) {
          spentThisMonth += spentAmt;
        }

        // Daily spend breakdown
        if (!dailyMap[dateStr]) {
          dailyMap[dateStr] = { amount: 0, count: 0 };
        }
        dailyMap[dateStr].amount += spentAmt;
        dailyMap[dateStr].count += 1;

        // Tool breakdown
        const toolKey = record.toolId || 'other';
        const toolName = record.metadata?.toolName || record.description || 'General Operation';

        if (!byToolBreakdown[toolKey]) {
          byToolBreakdown[toolKey] = {
            toolId: toolKey,
            toolName,
            count: 0,
            creditsSpent: 0,
            lastUsedAt: record.timestamp,
          };
        }
        byToolBreakdown[toolKey].count += 1;
        byToolBreakdown[toolKey].creditsSpent += spentAmt;
        if (record.timestamp > byToolBreakdown[toolKey].lastUsedAt) {
          byToolBreakdown[toolKey].lastUsedAt = record.timestamp;
        }
      }
    }

    const dailySpendHistory: CreditDailySpend[] = Object.entries(dailyMap)
      .map(([date, val]) => ({ date, amount: val.amount, count: val.count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Calculate burn rate per day (last 14 days)
    const recentDays = dailySpendHistory.slice(-14);
    const avgDailySpend =
      recentDays.length > 0
        ? recentDays.reduce((acc, d) => acc + d.amount, 0) / recentDays.length
        : 0;

    const projectedRunwayDays =
      avgDailySpend > 0 ? Math.floor(currentBalance / avgDailySpend) : null;

    return {
      currentBalance,
      totalEarned,
      totalSpent,
      spentToday,
      spentThisMonth,
      transactionsCount: ledger.length,
      byToolBreakdown,
      byTypeBreakdown,
      dailySpendHistory,
      burnRatePerDay: Math.round(avgDailySpend * 10) / 10,
      projectedRunwayDays,
    };
  }

  /**
   * Direct fetch user ledger with limit
   */
  public static async getUserLedger(
    userId: string,
    limitCount = 100
  ): Promise<CreditLedgerRecord[]> {
    if (!userId) return [];
    try {
      const q = query(
        collection(db, 'credit_ledger'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data() as CreditLedgerRecord);
    } catch (err) {
      console.warn('[CreditManager] getUserLedger fallback query', err);
      try {
        const fallbackQ = query(
          collection(db, 'credit_ledger'),
          where('userId', '==', userId),
          limit(limitCount)
        );
        const fSnap = await getDocs(fallbackQ);
        const list = fSnap.docs.map((d) => d.data() as CreditLedgerRecord);
        list.sort((a, b) => b.timestamp - a.timestamp);
        return list;
      } catch {
        return [];
      }
    }
  }

  /**
   * Filtered Ledger records retrieval
   */
  public static async getFilteredLedger(
    userId: string,
    filters: {
      type?: TransactionType;
      startDate?: number;
      endDate?: number;
      toolId?: string;
      limitCount?: number;
    }
  ): Promise<CreditLedgerRecord[]> {
    const all = await this.getUserLedger(userId, filters.limitCount || 200);
    return all.filter((rec) => {
      if (filters.type && rec.transactionType !== filters.type) return false;
      if (filters.toolId && rec.toolId !== filters.toolId) return false;
      if (filters.startDate && rec.timestamp < filters.startDate) return false;
      if (filters.endDate && rec.timestamp > filters.endDate) return false;
      return true;
    });
  }

  /**
   * Admin manual adjustment
   */
  public static async adminAdjustCredits(
    adminUid: string,
    adminEmail: string,
    targetUserId: string,
    adjustmentAmount: number,
    reason: string
  ): Promise<{ success: boolean; newBalance: number; error?: string }> {
    if (adjustmentAmount === 0) {
      return { success: false, newBalance: 0, error: 'Adjustment amount cannot be zero.' };
    }

    if (adjustmentAmount > 0) {
      return this.grantCredits({
        userId: targetUserId,
        amount: adjustmentAmount,
        type: 'admin_adjustment',
        description: `Admin Credit Adjustment: ${reason}`,
        adminEmail,
        metadata: {
          adjustedByUid: adminUid,
          adjustedByEmail: adminEmail,
          reason,
        },
      });
    } else {
      // Negative deduction by admin
      return this.consumeCredits({
        userId: targetUserId,
        amount: Math.abs(adjustmentAmount),
        toolName: 'Admin Manual Deduction',
        description: `Admin Deduction: ${reason}`,
        metadata: {
          adjustedByUid: adminUid,
          adjustedByEmail: adminEmail,
          reason,
        },
      });
    }
  }
}
