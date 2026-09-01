import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  Edit3,
  ExternalLink,
  Flame,
  Globe,
  HelpCircle,
  History,
  Info,
  Lock,
  PackageCheck,
  RefreshCw,
  RotateCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User as UserIcon,
  X,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DEFAULT_PLANS } from '../../config/plans';
import { BillingCycle, InvoiceItem, PlanConfig, PlanTier, UserSubscriptionRecord } from '../../types/saas';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { CreditManagementView } from '../credits/CreditManagementView';
import { DarkModeToggle } from '../common/DarkModeToggle';

interface AccountSettingsProps {
  initialTab?: 'subscription' | 'credits' | 'billing' | 'profile' | 'privacy';
  hideTabBar?: boolean;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
];

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English (US)', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
];

export const AccountSettings: React.FC<AccountSettingsProps> = ({
  initialTab = 'subscription',
  hideTabBar = false,
}) => {
  const {
    user,
    userProfile,
    plans,
    activePlanConfig,
    userSubscriptions,
    activeSubscription,
    invoices,
    credits,
    changePlan,
    cancelSubscription,
    resumeSubscription,
    updatePaymentMethod,
    updateUserProfile,
    updateUserPreferences,
    openAuthModal,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'subscription' | 'credits' | 'billing' | 'profile' | 'privacy'>(initialTab);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(
    activeSubscription?.billingCycle || 'monthly'
  );

  // Upgrade/Downgrade Modal State
  const [selectedPlanForChange, setSelectedPlanForChange] = useState<PlanConfig | null>(null);
  const [isChangingPlan, setIsChangingPlan] = useState(false);

  // Cancel Modal State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  // Payment Method Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [isUpdatingCard, setIsUpdatingCard] = useState(false);

  // Receipt Modal State
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);

  // Profile Form State
  const [displayName, setDisplayName] = useState(userProfile?.displayName || user?.displayName || '');
  const [avatarUrl, setAvatarUrl] = useState(userProfile?.photoURL || userProfile?.avatar || '');
  const [selectedLanguage, setSelectedLanguage] = useState(userProfile?.preferredLanguage || 'en');
  const [telemetryOptIn, setTelemetryOptIn] = useState(
    userProfile?.privacySettings?.telemetryOptIn ?? true
  );
  const [autoPurgeHistoryMinutes, setAutoPurgeHistoryMinutes] = useState(
    userProfile?.privacySettings?.autoPurgeHistoryMinutes ?? 0
  );
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 text-center space-y-6">
        <div className="h-16 w-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto text-primary">
          <Lock className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Sign In to Access Account & Subscription Settings
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-sm">
            Manage your active subscription plan, billing invoices, remaining AI credits, and account preferences.
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <Button onClick={() => openAuthModal('signin')} variant="primary" className="px-6 py-2.5 rounded-xl font-bold">
            Sign In
          </Button>
          <Button onClick={() => openAuthModal('signup')} variant="outline" className="px-6 py-2.5 rounded-xl font-bold">
            Create Account
          </Button>
        </div>
      </div>
    );
  }

  const currentPlanTier: PlanTier = userProfile?.plan || 'free';
  const isCanceledAtPeriodEnd =
    activeSubscription?.cancelAtPeriodEnd || userProfile?.subscription?.cancelAtPeriodEnd;
  const renewalTimestamp =
    activeSubscription?.currentPeriodEnd || userProfile?.subscription?.currentPeriodEnd || Date.now() + 30 * 24 * 3600 * 1000;
  const renewalDateStr = new Date(renewalTimestamp).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const availablePlansList: PlanConfig[] = Object.values(plans).length > 0
    ? Object.values(plans).sort((a, b) => (a.priority || 0) - (b.priority || 0))
    : Object.values(DEFAULT_PLANS).sort((a, b) => (a.priority || 0) - (b.priority || 0));

  // Handler: Execute Plan Change (Upgrade / Downgrade)
  const handleConfirmPlanChange = async () => {
    if (!selectedPlanForChange) return;
    setIsChangingPlan(true);
    try {
      const ok = await changePlan({
        targetPlanId: selectedPlanForChange.id as PlanTier,
        billingCycle,
        provider: 'stripe',
        paymentMethod: {
          brand: 'Visa',
          last4: '4242',
          expMonth: 12,
          expYear: 2028,
        },
      });
      if (ok) {
        setSelectedPlanForChange(null);
      }
    } finally {
      setIsChangingPlan(false);
    }
  };

  // Handler: Cancel Subscription
  const handleConfirmCancel = async () => {
    setIsCanceling(true);
    try {
      const ok = await cancelSubscription(activeSubscription?.id, true);
      if (ok) {
        setIsCancelModalOpen(false);
      }
    } finally {
      setIsCanceling(false);
    }
  };

  // Handler: Resume Subscription
  const handleResumeSubscription = async () => {
    await resumeSubscription(activeSubscription?.id);
  };

  // Handler: Update Payment Method
  const handleSavePaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 4) {
      showToast('Please enter a valid card number', 'error');
      return;
    }
    setIsUpdatingCard(true);
    try {
      const last4 = cardNumber.replace(/\s/g, '').slice(-4);
      const [expM, expY] = cardExp.includes('/') ? cardExp.split('/') : ['12', '28'];
      const ok = await updatePaymentMethod(
        {
          brand: 'Visa',
          last4: last4 || '4242',
          expMonth: parseInt(expM, 10) || 12,
          expYear: 2000 + (parseInt(expY, 10) || 28),
        },
        activeSubscription?.id
      );
      if (ok) {
        setIsPaymentModalOpen(false);
        setCardNumber('');
        setCardExp('');
        setCardCvc('');
      }
    } finally {
      setIsUpdatingCard(false);
    }
  };

  // Handler: Save Profile & Privacy Settings
  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      await updateUserPreferences({
        displayName,
        photoURL: avatarUrl,
        avatar: avatarUrl,
        preferredLanguage: selectedLanguage,
        privacySettings: {
          telemetryOptIn,
          autoPurgeHistoryMinutes,
        },
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Navigation Sub-Tabs */}
      {!hideTabBar && (
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-px overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('subscription')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'subscription'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Zap className="h-4 w-4" />
            Subscription & Plans
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('credits')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'credits'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Sparkles className="h-4 w-4 text-amber-500" />
            AI Credits & Ledger
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-primary/10 text-primary">
              {userProfile?.credits ?? 0}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('billing')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'billing'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <CreditCard className="h-4 w-4" />
            Billing & Invoices
            {invoices.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {invoices.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <UserIcon className="h-4 w-4" />
            Profile Settings
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'privacy'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Shield className="h-4 w-4" />
            Privacy & Data Retention
          </button>
        </div>
      )}

      {/* ================= TAB 1: SUBSCRIPTION & PLANS ================= */}
      {activeTab === 'subscription' && (
        <div className="space-y-8">
          {/* Active Subscription Status Banner */}
          <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">
                    Current Active Plan: {activePlanConfig.name}
                  </h2>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${
                      isCanceledAtPeriodEnd
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        : currentPlanTier !== 'free'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {isCanceledAtPeriodEnd ? (
                      <>
                        <Clock className="h-3 w-3" /> Canceling at Period End
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3 w-3" /> Active Plan
                      </>
                    )}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {currentPlanTier === 'free'
                    ? 'You are currently enjoying the Free Creator tier. Upgrade anytime to unlock higher file sizes, fast-track queues, and monthly AI credits.'
                    : isCanceledAtPeriodEnd
                    ? `Your subscription will remain active until ${renewalDateStr}. After this date, your workspace will return to the Free tier.`
                    : `Your plan automatically renews on ${renewalDateStr} (${activeSubscription?.billingCycle === 'yearly' ? 'Yearly' : 'Monthly'} cycle).`}
                </p>
              </div>

              {/* Status Action Buttons */}
              <div className="flex items-center gap-2.5 flex-wrap">
                {currentPlanTier !== 'free' && isCanceledAtPeriodEnd && (
                  <Button
                    onClick={handleResumeSubscription}
                    variant="primary"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Resume Auto-Renewal
                  </Button>
                )}
                {currentPlanTier !== 'free' && !isCanceledAtPeriodEnd && (
                  <Button
                    onClick={() => setIsCancelModalOpen(true)}
                    variant="outline"
                    className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-800 rounded-xl px-4 py-2"
                  >
                    Cancel Subscription
                  </Button>
                )}
                <Button
                  onClick={() => setIsPaymentModalOpen(true)}
                  variant="outline"
                  className="flex items-center gap-1.5 text-xs font-bold rounded-xl px-4 py-2"
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  Update Payment Method
                </Button>
              </div>
            </div>

            {/* Plan Quotas & Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Monthly Credits
                </span>
                <p className="text-xl font-black text-slate-900 dark:text-white">
                  {activePlanConfig.monthlyCredits}
                </p>
                <span className="text-[11px] text-slate-500">Auto-replenished</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Max Upload Size
                </span>
                <p className="text-xl font-black text-slate-900 dark:text-white">
                  {activePlanConfig.maxFileSizeMB} MB
                </p>
                <span className="text-[11px] text-slate-500">Per individual image</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Batch Processing
                </span>
                <p className="text-xl font-black text-slate-900 dark:text-white">
                  {activePlanConfig.maxBatchSize} Files
                </p>
                <span className="text-[11px] text-slate-500">Simultaneous queue</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Max Resolution
                </span>
                <p className="text-xl font-black text-slate-900 dark:text-white">
                  {activePlanConfig.maxResolutionMegapixels} MP
                </p>
                <span className="text-[11px] text-slate-500">Ultra-HD Canvas</span>
              </div>
            </div>
          </div>

          {/* Upgrade / Downgrade Plans Selector Grid */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Explore & Change Subscription Plans
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Select a tier below to upgrade or downgrade. Changes are committed directly to your Firestore subscriptions sub-collection.
                </p>
              </div>

              {/* Billing Cycle Toggle */}
              <div className="inline-flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 self-start">
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    billingCycle === 'monthly'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Monthly Billing
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('yearly')}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    billingCycle === 'yearly'
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Annual Billing
                  <span className="px-1.5 py-0.2 rounded-md bg-amber-400 text-slate-950 text-[10px] font-black uppercase">
                    Save 25%
                  </span>
                </button>
              </div>
            </div>

            {/* Plan Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {availablePlansList.map((p) => {
                const isCurrent = currentPlanTier === p.id;
                const isFeatured = p.id === 'pro';
                const price = billingCycle === 'yearly' ? p.priceYearly : p.priceMonthly;
                const priceDisplay = price === 0 ? 'Free' : `$${price}`;
                const periodDisplay = price === 0 ? 'forever' : billingCycle === 'yearly' ? '/year' : '/month';

                return (
                  <div
                    key={p.id}
                    className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 ${
                      isCurrent
                        ? 'border-2 border-primary bg-primary/5 dark:bg-primary/10 shadow-lg shadow-primary/5 ring-4 ring-primary/10'
                        : isFeatured
                        ? 'border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-md'
                        : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs'
                    }`}
                  >
                    {isFeatured && !isCurrent && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-md">
                        Most Popular
                      </div>
                    )}
                    {isCurrent && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-md flex items-center gap-1">
                        <Check className="h-3 w-3 stroke-[3]" /> Current Tier
                      </div>
                    )}

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h4 className="text-xl font-black text-slate-900 dark:text-white flex items-center justify-between">
                          {p.name}
                        </h4>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                            {priceDisplay}
                          </span>
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            {periodDisplay}
                          </span>
                        </div>
                        {billingCycle === 'yearly' && price > 0 && (
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                            Billed annually (~${Math.round(price / 12)}/month)
                          </p>
                        )}
                      </div>

                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Included Capabilities:
                        </p>
                        <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                          {(p.features || []).map((feat, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-8 mt-6 border-t border-slate-100 dark:border-slate-800">
                      {isCurrent ? (
                        <button
                          disabled
                          className="w-full py-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-black uppercase tracking-wider cursor-default flex items-center justify-center gap-1.5"
                        >
                          <Check className="h-4 w-4" />
                          Currently Active
                        </button>
                      ) : (
                        <Button
                          onClick={() => setSelectedPlanForChange(p)}
                          variant={isFeatured ? 'primary' : 'outline'}
                          className="w-full py-3 rounded-2xl font-black text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-1.5"
                        >
                          {p.id === 'free'
                            ? 'Downgrade to Free'
                            : currentPlanTier === 'free'
                            ? `Upgrade to ${p.name}`
                            : `Switch to ${p.name}`}
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: AI CREDITS & LEDGER ================= */}
      {activeTab === 'credits' && (
        <CreditManagementView onUpgradeClick={() => setActiveTab('subscription')} />
      )}

      {/* ================= TAB 3: BILLING & INVOICES ================= */}
      {activeTab === 'billing' && (
        <div className="space-y-8">
          {/* Payment Method Card */}
          <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-0.5">
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Active Payment Method
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Primary payment card stored securely for subscription auto-renewal.
                </p>
              </div>
              <Button
                onClick={() => setIsPaymentModalOpen(true)}
                variant="outline"
                className="text-xs font-bold rounded-xl px-3.5 py-1.5"
              >
                Change Card
              </Button>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 max-w-md">
              <div className="h-12 w-16 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black tracking-widest text-xs shadow-xs">
                {activeSubscription?.paymentMethodSummary?.brand || 'VISA'}
              </div>
              <div className="space-y-0.5 flex-1">
                <p className="text-sm font-black text-slate-900 dark:text-white">
                  •••• •••• •••• {activeSubscription?.paymentMethodSummary?.last4 || '4242'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Expires {activeSubscription?.paymentMethodSummary?.expMonth || '12'}/
                  {activeSubscription?.paymentMethodSummary?.expYear || '2028'}
                </p>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 rounded-md">
                Default
              </span>
            </div>
          </div>

          {/* Invoices History Table */}
          <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
            <div className="pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" />
                  Billing & Invoice History
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  All past subscription charges recorded in your sub-collection with instant receipt download.
                </p>
              </div>
            </div>

            {invoices.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                  <CreditCard className="h-6 w-6" />
                </div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  No Billing Invoices Found
                </p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  When you upgrade to a paid tier or renew your plan, detailed receipts and PDF statements will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-3 px-2">Invoice ID</th>
                      <th className="pb-3 px-2">Date</th>
                      <th className="pb-3 px-2">Plan & Cycle</th>
                      <th className="pb-3 px-2">Amount</th>
                      <th className="pb-3 px-2">Status</th>
                      <th className="pb-3 px-2 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-2 font-mono font-bold text-slate-900 dark:text-white">
                          {inv.id}
                        </td>
                        <td className="py-3.5 px-2 text-slate-600 dark:text-slate-300">
                          {new Date(inv.date).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="py-3.5 px-2 font-semibold text-slate-900 dark:text-white">
                          {inv.planName} ({inv.billingCycle})
                        </td>
                        <td className="py-3.5 px-2 font-black text-slate-900 dark:text-white">
                          ${inv.amount.toFixed(2)} {inv.currency}
                        </td>
                        <td className="py-3.5 px-2">
                          <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-2 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedInvoice(inv)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-primary hover:bg-primary/10 font-bold transition-colors cursor-pointer"
                          >
                            <Download className="h-3.5 w-3.5" />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 3: PROFILE SETTINGS ================= */}
      {activeTab === 'profile' && (
        <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
          <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-primary" />
              Public Profile & Identity
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage your display name, creator avatar, and regional preferences.
            </p>
          </div>

          <div className="space-y-6">
            {/* Avatar Selector */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Profile Avatar
              </label>
              <div className="flex items-center gap-4 flex-wrap">
                <img
                  src={
                    avatarUrl ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || 'User')}&background=6366f1&color=fff&bold=true`
                  }
                  alt="Avatar"
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-primary/20"
                />
                <div className="space-y-1.5 flex-1">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Choose from preset avatars or enter custom image URL below:
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {AVATAR_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAvatarUrl(preset)}
                        className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                          avatarUrl === preset ? 'border-primary scale-105 ring-2 ring-primary/30' : 'border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <img src={preset} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setAvatarUrl('')}
                        className="px-2 py-1 text-xs text-slate-500 hover:text-slate-700 font-semibold"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <Input
                label="Custom Avatar URL"
                type="url"
                placeholder="https://example.com/avatar.jpg"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                helperText="Direct image URL (JPEG, PNG, WebP) to display as your user icon."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Display Name"
                type="text"
                placeholder="Your Name or Studio Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                helperText="Visible in tool processing logs, exports, and shared headers."
              />

              <Input
                label="Account Email"
                type="email"
                disabled
                value={user.email || ''}
                helperText="Primary email linked to your Firebase account."
              />
            </div>

            {/* Language Selector */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Preferred Language & Localization
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setSelectedLanguage(lang.code)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedLanguage === lang.code
                        ? 'border-primary bg-primary/5 ring-1 ring-primary text-primary font-bold'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span className="text-xs truncate">{lang.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Global Theme & Appearance */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Interface Theme & Display Mode
              </label>
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    Cloud-Synced Dark Mode
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Switch between Light and Dark aesthetics. Preferences are saved to your Firestore account.
                  </p>
                </div>
                <DarkModeToggle id="account-settings-dark-mode-toggle" variant="segmented" showSyncStatus />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <Button
                onClick={handleSaveProfile}
                disabled={isSavingProfile}
                variant="primary"
                className="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider"
              >
                {isSavingProfile ? 'Saving...' : 'Save Profile Changes'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: PRIVACY & DATA RETENTION ================= */}
      {activeTab === 'privacy' && (
        <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
          <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Privacy, Telemetry & Auto-Purge
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Control client-side data retention and performance analytics.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  Anonymous Performance Telemetry
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Share anonymous transformation benchmarks to optimize local client canvas algorithms.
                </p>
              </div>
              <input
                type="checkbox"
                checked={telemetryOptIn}
                onChange={(e) => setTelemetryOptIn(e.target.checked)}
                className="h-5 w-5 rounded-md border-slate-300 text-primary focus:ring-primary cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
              <label className="text-sm font-bold text-slate-900 dark:text-white block">
                Auto-Purge Processing History
              </label>
              <select
                value={autoPurgeHistoryMinutes}
                onChange={(e) => setAutoPurgeHistoryMinutes(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-primary focus:outline-hidden"
              >
                <option value={0}>Never (Keep history in browser local cache)</option>
                <option value={60}>After 1 hour</option>
                <option value={1440}>After 24 hours</option>
                <option value={10080}>After 7 days</option>
              </select>
              <p className="text-[11px] text-slate-400">
                Automatically purges cached image thumbnails and canvas transformations after the designated period.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <Button
                onClick={handleSaveProfile}
                disabled={isSavingProfile}
                variant="primary"
                className="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider"
              >
                {isSavingProfile ? 'Saving...' : 'Save Privacy Preferences'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CHANGE / UPGRADE PLAN ================= */}
      {selectedPlanForChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-0.5">
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Confirm Plan Switch
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Target Tier: {selectedPlanForChange.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPlanForChange(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-primary/5 dark:bg-primary/10 border border-primary/20 space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  {selectedPlanForChange.name} ({billingCycle.toUpperCase()})
                </span>
                <span className="text-xl font-black text-primary">
                  {selectedPlanForChange.id === 'free'
                    ? 'Free'
                    : `$${billingCycle === 'yearly' ? selectedPlanForChange.priceYearly : selectedPlanForChange.priceMonthly} ${selectedPlanForChange.currency || 'USD'}`}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Grants {selectedPlanForChange.monthlyCredits} monthly AI credits, {selectedPlanForChange.maxFileSizeMB}MB max file size, and priority queue benefits.
              </p>
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <p className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                Updated in Firestore <code className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">/users/{user.uid}/subscriptions</code>
              </p>
              <p className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                Credits granted immediately and logged in immutable ledger
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                onClick={() => setSelectedPlanForChange(null)}
                variant="outline"
                className="flex-1 py-2.5 rounded-xl font-bold text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmPlanChange}
                disabled={isChangingPlan}
                variant="primary"
                className="flex-1 py-2.5 rounded-xl font-bold text-xs"
              >
                {isChangingPlan ? 'Updating...' : 'Confirm Plan Update'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CANCEL SUBSCRIPTION ================= */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-0.5">
                <h3 className="text-lg font-black text-red-600 dark:text-red-400 flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5" />
                  Cancel Subscription
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {activePlanConfig.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 space-y-2 text-xs text-red-800 dark:text-red-300">
              <p className="font-bold">
                Are you sure you want to cancel auto-renewal?
              </p>
              <p>
                You will retain full access to all <strong>{activePlanConfig.name}</strong> perks and remaining AI credits until <strong>{renewalDateStr}</strong>.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                onClick={() => setIsCancelModalOpen(false)}
                variant="outline"
                className="flex-1 py-2.5 rounded-xl font-bold text-xs"
              >
                Keep Plan
              </Button>
              <Button
                onClick={handleConfirmCancel}
                disabled={isCanceling}
                variant="danger"
                className="flex-1 py-2.5 rounded-xl font-bold text-xs"
              >
                {isCanceling ? 'Canceling...' : 'Confirm Cancel'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: UPDATE PAYMENT METHOD ================= */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <form
            onSubmit={handleSavePaymentMethod}
            className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-0.5">
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Update Payment Card
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Directly updates your subscription sub-collection record.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <Input
                label="Cardholder Name"
                type="text"
                placeholder="Jane Doe"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                required
              />

              <Input
                label="Card Number"
                type="text"
                placeholder="4242 4242 4242 4242"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Expires (MM/YY)"
                  type="text"
                  placeholder="12/28"
                  value={cardExp}
                  onChange={(e) => setCardExp(e.target.value)}
                  required
                />
                <Input
                  label="CVC"
                  type="text"
                  placeholder="123"
                  value={cardCvc}
                  onChange={(e) => setCardCvc(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                variant="outline"
                className="flex-1 py-2.5 rounded-xl font-bold text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdatingCard}
                variant="primary"
                className="flex-1 py-2.5 rounded-xl font-bold text-xs"
              >
                {isUpdatingCard ? 'Saving...' : 'Save Card'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ================= MODAL: INVOICE RECEIPT ================= */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-0.5">
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <PackageCheck className="h-5 w-5 text-emerald-500" />
                  Invoice Receipt
                </h3>
                <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                  {selectedInvoice.id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Date</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {new Date(selectedInvoice.date).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Description</span>
                <span className="font-bold text-slate-900 dark:text-white text-right">
                  {selectedInvoice.description}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Payment Method</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {selectedInvoice.paymentMethod || 'Credit Card'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Status</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 uppercase">
                  {selectedInvoice.status}
                </span>
              </div>
              <div className="flex justify-between py-3 text-sm font-black bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
                <span>Total Amount Paid</span>
                <span className="text-primary">
                  ${selectedInvoice.amount.toFixed(2)} {selectedInvoice.currency}
                </span>
              </div>
            </div>

            <Button
              onClick={() => {
                showToast(`Receipt ${selectedInvoice.id} downloaded!`, 'success');
                setSelectedInvoice(null);
              }}
              variant="primary"
              className="w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Statement PDF
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
export default AccountSettings;
