import React, { useState, useEffect, useMemo } from 'react';
import {
  Zap,
  CreditCard,
  TrendingUp,
  History,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Calculator,
  Download,
  Filter,
  Search,
  Plus,
  HelpCircle,
  Flame,
  Calendar,
  ChevronRight,
  Sliders,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CreditManager } from '../../services/CreditManager';
import {
  CreditAnalyticsSummary,
  CreditLedgerRecord,
  CreditToolSpend,
  CreditTopUpPackage,
  DEFAULT_CREDIT_PACKAGES,
  TransactionType,
} from '../../types/credits';
import { DataTable, DataTableColumn, Button, Input } from '../ui';

interface CreditManagementViewProps {
  onUpgradeClick?: () => void;
}

export const CreditManagementView: React.FC<CreditManagementViewProps> = ({ onUpgradeClick }) => {
  const {
    user,
    userProfile,
    activePlanConfig,
    creditLedger,
    creditPackages,
    refreshLedger,
    showToast,
    navigate,
    openAuthModal,
  } = useApp();

  // State
  const [activeSubTab, setActiveSubTab] = useState<'ledger' | 'topup' | 'analytics' | 'calculator'>('ledger');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [analytics, setAnalytics] = useState<CreditAnalyticsSummary | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState<string | null>(null);
  const [purchaseSuccessPack, setPurchaseSuccessPack] = useState<CreditTopUpPackage | null>(null);

  // Cost Calculator State
  const [calcTool, setCalcTool] = useState<string>('ai-upscaler');
  const [calcBatchSize, setCalcBatchSize] = useState<number>(1);
  const [calcResolution, setCalcResolution] = useState<number>(12); // Megapixels

  const currentBalance = typeof userProfile?.credits === 'number' ? userProfile.credits : 0;
  const totalMonthlyCredits = activePlanConfig.monthlyCredits || 30;
  const usedCredits = Math.max(0, totalMonthlyCredits - currentBalance);
  const usedPercentage = Math.min(100, Math.round((currentBalance / totalMonthlyCredits) * 100));

  // Compute analytics from ledger records
  useEffect(() => {
    if (!user?.uid) return;
    setIsLoadingAnalytics(true);
    CreditManager.getCreditAnalytics(user.uid, creditLedger)
      .then((data) => {
        setAnalytics(data);
      })
      .catch((err) => {
        console.warn('Analytics calculation error:', err);
      })
      .finally(() => {
        setIsLoadingAnalytics(false);
      });
  }, [user?.uid, creditLedger, currentBalance]);

  // Filtered ledger records
  const filteredLedger = useMemo(() => {
    if (typeFilter === 'all') return creditLedger;
    return creditLedger.filter((item) => item.transactionType === typeFilter);
  }, [creditLedger, typeFilter]);

  // Cost estimate calculation
  const calculatedEstimate = useMemo(() => {
    const isAi = calcTool.includes('ai') || calcTool.includes('upscaler') || calcTool.includes('eraser') || calcTool.includes('bg-remover');
    return CreditManager.calculateCost(calcTool, {
      isAi,
      batchSize: calcBatchSize,
      resolutionMegapixels: calcResolution,
    });
  }, [calcTool, calcBatchSize, calcResolution]);

  const hasEnoughForCalc = currentBalance >= calculatedEstimate.totalEstimatedCredits;

  // Handle Top-Up Purchase
  const handleBuyPackage = async (pack: CreditTopUpPackage) => {
    if (!user) {
      showToast('Please sign in to purchase credits.', 'info');
      openAuthModal('signin');
      return;
    }

    setIsPurchasing(pack.id);
    try {
      const res = await CreditManager.purchaseTopUpPackage(user.uid, pack.id);
      if (res.success) {
        setPurchaseSuccessPack(pack);
        showToast(`Successfully added ${res.creditsAdded} credits to your account!`, 'success');
        refreshLedger();
      } else {
        showToast(res.error || 'Failed to complete credit purchase.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'An error occurred during purchase.', 'error');
    } finally {
      setIsPurchasing(null);
    }
  };

  // Transaction type badge helper
  const renderTypeBadge = (type: TransactionType) => {
    switch (type) {
      case 'usage':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <ArrowDownLeft className="w-3 h-3" />
            Usage
          </span>
        );
      case 'purchase':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <ArrowUpRight className="w-3 h-3" />
            Top-Up
          </span>
        );
      case 'subscription':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
            <Sparkles className="w-3 h-3" />
            Plan Grant
          </span>
        );
      case 'bonus':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Sparkles className="w-3 h-3" />
            Bonus
          </span>
        );
      case 'refund':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
            <RefreshCw className="w-3 h-3" />
            Refund
          </span>
        );
      case 'admin_adjustment':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <ShieldCheck className="w-3 h-3" />
            Adjustment
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {type}
          </span>
        );
    }
  };

  const ledgerColumns: DataTableColumn<CreditLedgerRecord>[] = [
    {
      id: 'type',
      header: 'TYPE',
      accessorKey: 'transactionType',
      sortable: true,
      cell: ({ row }) => renderTypeBadge(row.transactionType),
    },
    {
      id: 'description',
      header: 'ACTIVITY & DESCRIPTION',
      accessorKey: 'description',
      sortable: true,
      cell: ({ row }) => (
        <div className="space-y-0.5 max-w-md">
          <p className="font-bold text-slate-900 dark:text-white text-xs leading-snug">
            {row.description}
          </p>
          {row.toolId && (
            <p className="text-[10px] font-mono text-slate-400">
              Tool: <span className="text-primary font-bold">{row.toolId}</span>
              {row.jobId && ` • Job: ${row.jobId.slice(0, 8)}`}
            </p>
          )}
        </div>
      ),
    },
    {
      id: 'amount',
      header: 'CREDIT DELTA',
      accessorKey: 'amount',
      sortable: true,
      cell: ({ row }) => {
        const isPositive = row.amount > 0;
        return (
          <div className="flex items-center gap-1 font-mono text-xs font-black">
            <span
              className={
                isPositive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-900 dark:text-slate-200'
              }
            >
              {isPositive ? `+${row.amount}` : row.amount}
            </span>
            <span className="text-[10px] font-normal text-slate-400">credits</span>
          </div>
        );
      },
    },
    {
      id: 'balanceAfter',
      header: 'BALANCE AFTER',
      accessorKey: 'balanceAfter',
      sortable: true,
      cell: ({ row }) => (
        <div className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300">
          {row.balanceAfter}{' '}
          <span className="text-[10px] font-normal text-slate-400">credits</span>
        </div>
      ),
    },
    {
      id: 'timestamp',
      header: 'TIMESTAMP',
      accessorKey: 'timestamp',
      sortable: true,
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <p className="font-mono text-xs text-slate-600 dark:text-slate-400">
            {new Date(row.timestamp).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
          <p className="font-mono text-[10px] text-slate-400">
            {new Date(row.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner: Real-Time Credit Balance & Quota Card */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-linear-to-br from-slate-900 via-slate-900 to-slate-950 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-primary/20 text-primary border border-primary/30 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 fill-primary" />
                {activePlanConfig.name} Plan
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Firestore Live Synced
              </span>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Available AI & High-Res Processing Credits
              </p>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-4xl sm:text-5xl font-black text-white tracking-tight font-mono">
                  {currentBalance.toLocaleString()}
                </span>
                <span className="text-sm font-bold text-slate-400">
                  / {totalMonthlyCredits.toLocaleString()} monthly allocation
                </span>
              </div>
            </div>

            {/* Credit progress meter */}
            <div className="w-full max-w-md space-y-1.5">
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    usedPercentage > 50
                      ? 'bg-linear-to-r from-emerald-500 to-primary'
                      : usedPercentage > 20
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.max(5, usedPercentage)}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>{usedPercentage}% capacity remaining</span>
                <span>{usedCredits} credits used this billing cycle</span>
              </div>
            </div>
          </div>

          {/* Quick Action CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveSubTab('topup')}
              className="px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-extrabold text-sm shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Buy Top-Up Pack</span>
            </button>

            <button
              onClick={() => {
                if (onUpgradeClick) {
                  onUpgradeClick();
                } else {
                  navigate('/pricing');
                }
              }}
              className="px-5 py-3 rounded-2xl bg-white/10 text-white font-bold text-sm hover:bg-white/20 border border-white/15 transition-all cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Upgrade Tier</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold">Spent Today</span>
            <Clock className="w-4 h-4 text-primary" />
          </div>
          <p className="text-xl font-black text-slate-900 dark:text-white font-mono">
            {analytics ? analytics.spentToday : userProfile?.usage?.todayAiCount || 0}
          </p>
          <p className="text-[10px] text-slate-400">Credits consumed</p>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold">Spent This Month</span>
            <Calendar className="w-4 h-4 text-primary" />
          </div>
          <p className="text-xl font-black text-slate-900 dark:text-white font-mono">
            {analytics ? analytics.spentThisMonth : userProfile?.usage?.monthAiCount || 0}
          </p>
          <p className="text-[10px] text-slate-400">Credits consumed</p>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold">Daily Burn Rate</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl font-black text-slate-900 dark:text-white font-mono">
            {analytics ? analytics.burnRatePerDay : 0} <span className="text-xs font-normal">/ day</span>
          </p>
          <p className="text-[10px] text-slate-400">14-day rolling average</p>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold">Projected Runway</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl font-black text-slate-900 dark:text-white font-mono">
            {analytics?.projectedRunwayDays !== null && analytics?.projectedRunwayDays !== undefined
              ? `${analytics.projectedRunwayDays} days`
              : 'Unlimited'}
          </p>
          <p className="text-[10px] text-slate-400">At current pace</p>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 w-fit">
        <button
          onClick={() => setActiveSubTab('ledger')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'ledger'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Ledger History ({creditLedger.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('topup')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'topup'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Top-Up Packs</span>
        </button>

        <button
          onClick={() => setActiveSubTab('calculator')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'calculator'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Cost Estimator</span>
        </button>

        <button
          onClick={() => setActiveSubTab('analytics')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'analytics'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Consumption Insights</span>
        </button>
      </div>

      {/* TAB 1: LEDGER HISTORY */}
      {activeSubTab === 'ledger' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Immutable Credit Ledger Logs
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Audited real-time Firestore collection logging every credit consumption, grant, top-up, and refund.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: 'All Events' },
                { id: 'usage', label: 'Usage Debits' },
                { id: 'purchase', label: 'Top-Ups' },
                { id: 'subscription', label: 'Plan Grants' },
                { id: 'bonus', label: 'Bonuses' },
                { id: 'refund', label: 'Refunds' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setTypeFilter(f.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    typeFilter === f.id
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <DataTable
            data={filteredLedger}
            keyExtractor={(item, index) => item.id || `ledger-${index}`}
            searchPlaceholder="Search credit history by tool or description..."
            exportFileName="aetherpix_credit_ledger"
            defaultPageSize={10}
            columns={ledgerColumns}
            emptyMessage="No credit transactions found for the selected filter."
          />
        </div>
      )}

      {/* TAB 2: TOP-UP PACKAGES */}
      {activeSubTab === 'topup' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Instant Credit Top-Up Packages
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              One-time credit boosts that never expire. Instantly added to your Firestore account.
            </p>
          </div>

          {/* Success Banner if just bought */}
          {purchaseSuccessPack && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <div>
                  <p className="text-xs font-bold">Top-Up Successful!</p>
                  <p className="text-xs">
                    Added +{purchaseSuccessPack.credits + purchaseSuccessPack.bonusCredits} credits to your account.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPurchaseSuccessPack(null)}
                className="text-xs font-bold underline cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(creditPackages && creditPackages.length > 0 ? creditPackages : DEFAULT_CREDIT_PACKAGES).map((pack) => {
              const totalCredits = pack.credits + pack.bonusCredits;
              const isSelected = isPurchasing === pack.id;

              return (
                <div
                  key={pack.id}
                  className={`relative p-6 sm:p-7 rounded-3xl border bg-white dark:bg-slate-900 flex flex-col justify-between space-y-6 transition-all ${
                    pack.popular
                      ? 'border-primary ring-2 ring-primary/20 shadow-xl shadow-primary/5'
                      : 'border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {pack.badge && (
                    <div className="absolute -top-3 left-6">
                      <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-wider shadow-md">
                        {pack.badge}
                      </span>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-black text-slate-900 dark:text-white">{pack.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{pack.description}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                          +{totalCredits.toLocaleString()}
                        </span>
                        <span className="text-xs font-bold text-primary">Credits</span>
                      </div>
                      {pack.bonusCredits > 0 && (
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                          Includes {pack.bonusCredits} free bonus credits
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Never expires</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Works on all AI & Server engines</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Instant delivery to credit ledger</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-black text-slate-900 dark:text-white">
                        ${pack.price}
                      </span>
                      <span className="text-xs text-slate-400">One-time payment</span>
                    </div>

                    <Button
                      onClick={() => handleBuyPackage(pack)}
                      disabled={isSelected || isPurchasing !== null}
                      variant={pack.popular ? 'primary' : 'outline'}
                      size="lg"
                      className="w-full"
                    >
                      {isSelected ? 'Authorizing Firestore...' : `Buy ${pack.name}`}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: COST ESTIMATOR CALCULATOR */}
      {activeSubTab === 'calculator' && (
        <div className="max-w-3xl space-y-6">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Dynamic Tool Cost Calculator
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Estimate credit consumption based on tool type, batch size, and target image resolution.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-6 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Tool Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Select Tool or Engine
                </label>
                <select
                  value={calcTool}
                  onChange={(e) => setCalcTool(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-hidden"
                >
                  <option value="ai-upscaler">AI Super-Resolution Upscaler (4x)</option>
                  <option value="ai-bg-remover">AI Background Remover</option>
                  <option value="ai-object-eraser">AI Object Eraser & Inpainting</option>
                  <option value="ai-colorizer">AI Photo Colorizer</option>
                  <option value="compress-image">Image Compressor (Standard)</option>
                  <option value="resize-image">Image Resizer (Standard)</option>
                  <option value="convert-format">Format Converter (WebP, PNG, AVIF)</option>
                </select>
              </div>

              {/* Batch Size */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Batch Size (Images)
                  </label>
                  <span className="text-xs font-mono font-bold text-primary">{calcBatchSize} images</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={50}
                  value={calcBatchSize}
                  onChange={(e) => setCalcBatchSize(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>
            </div>

            {/* Resolution Megapixels */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Target Resolution Megapixels
                </label>
                <span className="text-xs font-mono font-bold text-slate-500">
                  {calcResolution} MP {calcResolution > 30 ? '(Ultra HD 4K+)' : '(Standard)'}
                </span>
              </div>
              <input
                type="range"
                min={2}
                max={50}
                value={calcResolution}
                onChange={(e) => setCalcResolution(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
            </div>

            {/* Calculated Breakdown Card */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Cost Breakdown
                </span>
                <span className="text-xs font-mono text-slate-400">{calculatedEstimate.explanation}</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Base Tool Cost</span>
                  <span className="font-mono">{calculatedEstimate.baseCost} credit</span>
                </div>
                {calculatedEstimate.aiSurcharge > 0 && (
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>AI Neural Model Engine Surcharge</span>
                    <span className="font-mono">+{calculatedEstimate.aiSurcharge} credits</span>
                  </div>
                )}
                {calculatedEstimate.resolutionSurcharge > 0 && (
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Ultra HD 4K+ Surcharge</span>
                    <span className="font-mono">+{calculatedEstimate.resolutionSurcharge} credits</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Batch Multiplier</span>
                  <span className="font-mono">× {calculatedEstimate.batchMultiplier} images</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500">Total Required Credits</p>
                  <p className="text-2xl font-black text-primary font-mono">
                    {calculatedEstimate.totalEstimatedCredits} Credits
                  </p>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase ${
                      hasEnoughForCalc
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {hasEnoughForCalc ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Sufficient Balance
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3.5 h-3.5" /> Deficit: {calculatedEstimate.totalEstimatedCredits - currentBalance}
                      </>
                    )}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Available: {currentBalance} credits
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CONSUMPTION INSIGHTS */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Credit Consumption Breakdown
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Aggregated analytics tracking where your credits are invested across tools and categories.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Consuming Tools */}
            <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-sm">
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                Top Consuming Tools
              </h4>

              {analytics && Object.keys(analytics.byToolBreakdown).length > 0 ? (
                <div className="space-y-3">
                  {(Object.values(analytics.byToolBreakdown) as CreditToolSpend[])
                    .sort((a, b) => b.creditsSpent - a.creditsSpent)
                    .slice(0, 5)
                    .map((t) => {
                      const pct = analytics.totalSpent > 0 ? Math.round((t.creditsSpent / analytics.totalSpent) * 100) : 0;
                      return (
                        <div key={t.toolId} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-900 dark:text-white">{t.toolName}</span>
                            <span className="font-mono text-slate-500">
                              {t.creditsSpent} credits ({pct}%)
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(4, pct)}%` }} />
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  No tool consumption records yet. Run your first tool job to see insights!
                </div>
              )}
            </div>

            {/* Transaction Types Distribution */}
            <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-sm">
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" />
                Ledger Transaction Types
              </h4>

              {analytics && Object.keys(analytics.byTypeBreakdown).length > 0 ? (
                <div className="space-y-3">
                  {(Object.entries(analytics.byTypeBreakdown) as [string, { count: number; totalAmount: number }][]).map(([tType, val]) => (
                    <div
                      key={tType}
                      className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                    >
                      <div className="flex items-center gap-2">
                        {renderTypeBadge(tType as TransactionType)}
                        <span className="text-xs text-slate-500">{val.count} transaction{val.count > 1 ? 's' : ''}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                        {val.totalAmount} credits
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  No transaction breakdown data available.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
