import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatFileSize } from '../engine/imageEngine';
import { DEFAULT_PLANS } from '../config/plans';
import { UserLayout } from '../components/layout/UserLayout';
import { DynamicIcon } from '../components/common/DynamicIcon';
import { DataTable, DataTableColumn, Input, Button } from '../components/ui';
import { SaaSDataService } from '../services/SaaSDataService';
import { useTranslation, SUPPORTED_LANGUAGES, SupportedLanguage } from '../i18n';
import {
  User,
  Zap,
  Clock,
  History,
  Heart,
  Bookmark,
  CreditCard,
  Settings,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Layers,
  ArrowRight,
  Download,
  Trash2,
  Lock,
  Plus,
  CheckCircle2,
  ExternalLink,
  Sliders,
  Crown,
  Globe,
  Image as ImageIcon,
  Check,
  Save,
  Shield,
  Palette,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const {
    user,
    userProfile,
    updateUserProfile,
    openAuthModal,
    logout,
    credits,
    activePlanConfig,
    creditLedger,
    processingJobs,
    presets,
    history,
    favorites,
    toggleFavorite,
    navigate,
    upgradePlan,
    showToast,
    savePreset,
    isAdmin,
    currentPath,
    tools,
  } = useApp();

  const { language, setLanguage, t } = useTranslation();

  // Local settings form state
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('en');
  const [telemetryOptIn, setTelemetryOptIn] = useState(true);
  const [autoPurgeHistoryMinutes, setAutoPurgeHistoryMinutes] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // Sync settings form state when userProfile or user changes
  useEffect(() => {
    if (userProfile || user) {
      setDisplayName(userProfile?.displayName || user?.displayName || '');
      setAvatarUrl(userProfile?.photoURL || userProfile?.avatar || user?.photoURL || '');
      setSelectedLanguage((userProfile?.preferredLanguage as SupportedLanguage) || language || 'en');
      setTelemetryOptIn(userProfile?.privacySettings?.telemetryOptIn ?? true);
      setAutoPurgeHistoryMinutes(userProfile?.privacySettings?.autoPurgeHistoryMinutes ?? 0);
    }
  }, [userProfile, user]);

  const creditBalance = typeof credits === 'number' ? credits : Math.max(0, (credits?.total ?? 0) - (credits?.used ?? 0));

  // Derive active tab from URL route path (e.g. /en/pricing -> 'subscription', /dashboard/credits -> 'credits')
  const getActiveTabFromRoute = (): 'overview' | 'usage' | 'credits' | 'history' | 'favorites' | 'presets' | 'subscription' | 'settings' => {
    const raw = (currentPath || window.location.pathname).split('?')[0].replace(/\/$/, '');
    const cleanPath = raw.replace(/^\/(en|hi|es|fr|de|pt|it|ja|ko|zh|ar)/i, '') || '/';

    const segments = cleanPath.split('/').filter(Boolean);
    const subRoute = segments[1] || '';

    const validTabs = ['overview', 'usage', 'credits', 'history', 'favorites', 'presets', 'subscription', 'settings'];

    if (subRoute && validTabs.includes(subRoute)) {
      return subRoute as any;
    }

    // Fallback query param tab check for legacy links
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam && validTabs.includes(tabParam)) {
      return tabParam as any;
    }

    return 'overview';
  };

  const activeTab = getActiveTabFromRoute();

  const handleTabChange = (tab: string) => {
    if (tab === 'overview') {
      navigate('/dashboard');
    } else {
      navigate(`/dashboard/${tab}`);
    }
  };

  if (!user) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 rounded-3xl border border-primary/20 bg-white dark:bg-slate-900 text-center space-y-6 shadow-xl">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
          <User className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Sign In to Access Your Creative Studio Dashboard
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Manage your AI credits ledger, processing history, custom tool presets, and subscription limits in one central place.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => openAuthModal('signin')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold shadow-md shadow-primary/20 transition-all cursor-pointer"
          >
            Sign In with Email / Google
          </button>
          <button
            onClick={() => openAuthModal('signup')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold transition-all cursor-pointer"
          >
            Create Free Account
          </button>
        </div>
      </div>
    );
  }

  const userUsage = userProfile?.usage || {
    todayProcessedCount: 0,
    todayAiCount: 0,
    monthProcessedCount: 0,
    monthAiCount: 0,
    totalProcessedCount: 0,
    lastActiveDate: '',
    currentMonth: '',
  };

  const historyList = history || [];
  const favoritesList = favorites || [];
  const presetsList = presets || [];
  const ledgerList = creditLedger || [];
  const jobsList = processingJobs || [];

  const favoriteTools = (tools || []).filter((t) => favoritesList.includes(t.id));

  return (
    <UserLayout
      activeTab={activeTab}
      onTabChange={handleTabChange}
    >
      <div className="space-y-8">
        {/* User Profile Header Card */}
        <div className="rounded-3xl border border-primary/20 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              {(userProfile?.photoURL || userProfile?.avatar || user.photoURL) ? (
                <img
                  src={userProfile?.photoURL || userProfile?.avatar || user.photoURL || ''}
                  alt="Profile"
                  className="h-16 w-16 rounded-2xl object-cover border-2 border-primary shadow-xs"
                />
              ) : (
                <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-2xl font-black shadow-md">
                  {((userProfile?.displayName || user.displayName || user.email || 'U')[0]).toUpperCase()}
                </div>
              )}
              <span
                className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900"
                title="Online & Synced to Firestore"
              />
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {userProfile?.displayName || user.displayName || user.email?.split('@')[0]}
                </h1>
                <span className="rounded-full bg-primary text-primary-foreground text-[10px] uppercase font-extrabold px-2.5 py-0.5 tracking-wider">
                  {activePlanConfig.name}
                </span>
                {isAdmin && (
                  <span className="rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] uppercase font-extrabold px-2 py-0.5">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">{user.email}</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Member since {new Date(userProfile?.createdAt || Date.now()).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Quick Balance & Actions */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-start md:justify-end">
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 p-3.5 flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Zap className="h-5 w-5 fill-primary text-primary" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Ledger Balance</span>
                <span className="text-base font-black text-slate-900 dark:text-white font-mono">
                  {creditBalance} / {activePlanConfig.monthlyCredits}
                </span>
              </div>
            </div>

            <button
              onClick={() => handleTabChange('subscription')}
              className="px-4 py-3 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-md shadow-primary/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CreditCard className="h-4 w-4" />
              <span>Manage Plan</span>
            </button>
          </div>
        </div>

        {/* Tab Panels */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Today's Jobs</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                  {userUsage.todayProcessedCount}
                </p>
              </div>
              <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Monthly Total</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                  {userUsage.monthProcessedCount}
                </p>
              </div>
              <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase">AI Executions</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                  {userUsage.monthAiCount}
                </p>
              </div>
              <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Total Lifetime</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                  {userUsage.totalProcessedCount}
                </p>
              </div>
            </div>

            {/* Favorite Quick Links */}
            <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Pinned Favorite Tools
                </h3>
                <button
                  onClick={() => navigate('/tools')}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Browse Catalog
                </button>
              </div>

              {favoriteTools.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No pinned tools yet. Click heart on any tool card to pin here.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {favoriteTools.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => navigate(`/${t.slug}`)}
                      className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:bg-primary/5 text-left transition-all group cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <DynamicIcon name={t.icon} className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-primary">
                          {t.name}
                        </p>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">{t.category}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Subscription Tab View */}
        {activeTab === 'subscription' && (
          <div className="space-y-6">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Subscription & Plan Tiers</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.values(DEFAULT_PLANS).map((plan) => {
                const isCurrent = plan.id === activePlanConfig.id;
                return (
                  <div
                    key={plan.id}
                    className={`p-6 rounded-3xl border ${
                      isCurrent
                        ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                    } flex flex-col justify-between space-y-6`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-black text-slate-900 dark:text-white">{plan.name}</h4>
                        {isCurrent && (
                          <span className="px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-extrabold uppercase">
                            Active Plan
                          </span>
                        )}
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                          ${plan.priceMonthly}
                        </span>
                        <span className="text-xs text-slate-400 font-semibold">/ month</span>
                      </div>
                    </div>

                    <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{plan.monthlyCredits} AI Credits per month</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{plan.maxBatchSize} max batch files</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>Up to {plan.maxFileSizeMB} MB per file size</span>
                      </li>
                    </ul>

                    <button
                      disabled={isCurrent}
                      onClick={async () => {
                        await upgradePlan(plan.id);
                        showToast(`Upgraded to ${plan.name} plan!`, 'success');
                      }}
                      className={`w-full py-3 rounded-2xl text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-default'
                          : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/25 cursor-pointer'
                      }`}
                    >
                      {isCurrent ? 'Current Tier' : `Switch to ${plan.name}`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Favorites Tab View */}
        {activeTab === 'favorites' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                  Your Pinned Favorite Tools
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Synced in real-time to your Firestore account across all your connected devices.
                </p>
              </div>
              <button
                onClick={() => navigate('/tools')}
                className="px-3.5 py-1.5 rounded-xl bg-primary/10 text-primary font-bold text-xs hover:bg-primary/20 transition-all cursor-pointer flex items-center gap-1"
              >
                <span>Browse All Tools</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {favoriteTools.length === 0 ? (
              <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mx-auto">
                  <Heart className="w-6 h-6" />
                </div>
                <div className="space-y-1 max-w-sm mx-auto">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">No Favorite Tools Saved Yet</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Click the heart icon on any tool card or tool page to pin your most-used utilities here.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/tools')}
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md shadow-primary/20 hover:bg-primary/90 transition-all cursor-pointer"
                >
                  Explore Tool Catalog
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {favoriteTools.map((tool) => (
                  <div
                    key={tool.id}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary/50 transition-all flex flex-col justify-between space-y-4 group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <DynamicIcon name={tool.icon} className="w-5 h-5" />
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleFavorite(tool.id);
                        }}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Remove from favorites"
                      >
                        <Heart className="w-4 h-4 fill-rose-500" />
                      </button>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                        {tool.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {tool.shortDescription}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        {tool.category}
                      </span>
                      <button
                        onClick={() => navigate(tool.route || `/${tool.slug}`)}
                        className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Open Tool</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Presets Tab View */}
        {activeTab === 'presets' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-primary" />
                Saved Tool Presets
              </h3>
            </div>

            {presetsList.length === 0 ? (
              <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                  <Bookmark className="w-6 h-6" />
                </div>
                <div className="space-y-1 max-w-sm mx-auto">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">No Presets Saved</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Save your custom compression ratios, dimensions, or export options while using any tool.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {presetsList.map((preset) => (
                  <div
                    key={preset.id}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{preset.title}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                        {preset.toolId}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono">
                      Created: {new Date(preset.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* AI Usage Tab View */}
        {activeTab === 'usage' && (
          <div className="space-y-6">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Processing Telemetry</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Today's Jobs</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                  {userUsage.todayProcessedCount}
                </p>
              </div>
              <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Monthly Total</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                  {userUsage.monthProcessedCount}
                </p>
              </div>
              <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase">AI Operations</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                  {userUsage.monthAiCount}
                </p>
              </div>
              <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase">All-Time Total</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                  {userUsage.totalProcessedCount}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Credits Ledger Tab View */}
        {activeTab === 'credits' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Credits Ledger</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Available Credits: <span className="font-bold text-primary">{creditBalance} AI Credits</span>
                </p>
              </div>
              <button
                onClick={() => handleTabChange('subscription')}
                className="px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-sm hover:bg-primary/90 transition-all cursor-pointer"
              >
                Get More Credits
              </button>
            </div>

            <DataTable
              data={ledgerList}
              keyExtractor={(item, index) => item.id || `ledger-${index}`}
              searchPlaceholder="Search credit transactions..."
              exportFileName="aetherpix_credits_ledger"
              defaultPageSize={10}
              columns={[
                {
                  id: 'description',
                  header: 'TRANSACTION',
                  accessorKey: 'description',
                  sortable: true,
                  cell: ({ row }) => (
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-xs">{row.description}</p>
                      <span className="text-[10px] text-slate-400 font-mono uppercase">{row.transactionType}</span>
                    </div>
                  ),
                },
                {
                  id: 'amount',
                  header: 'CREDITS',
                  accessorKey: 'amount',
                  sortable: true,
                  cell: ({ row }) => (
                    <span className={`font-mono text-xs font-bold ${row.amount >= 0 ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>
                      {row.amount > 0 ? `+${row.amount}` : row.amount}
                    </span>
                  ),
                },
                {
                  id: 'balanceAfter',
                  header: 'BALANCE AFTER',
                  accessorKey: 'balanceAfter',
                  sortable: true,
                  cell: ({ row }) => (
                    <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                      {row.balanceAfter}
                    </span>
                  ),
                },
                {
                  id: 'date',
                  header: 'DATE',
                  accessorKey: 'timestamp',
                  sortable: true,
                  cell: ({ row }) => (
                    <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                      {new Date(row.timestamp).toLocaleString()}
                    </span>
                  ),
                },
              ]}
            />
          </div>
        )}

        {/* History Tab View */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Recent Job History</h3>
            <DataTable
              data={historyList}
              keyExtractor={(item, index) => item.id || `hist-${index}`}
              searchPlaceholder="Search processing history by tool..."
              exportFileName="aetherpix_user_history"
              defaultPageSize={10}
              columns={[
                {
                  id: 'tool',
                  header: 'TOOL',
                  accessorKey: 'toolName',
                  sortable: true,
                  cell: ({ row }) => (
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                        <History className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-extrabold text-slate-900 dark:text-white">{row.toolName}</span>
                    </div>
                  ),
                },
                {
                  id: 'date',
                  header: 'DATE & TIME',
                  accessorKey: 'timestamp',
                  sortable: true,
                  cell: ({ row }) => (
                    <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                      {new Date(row.timestamp).toLocaleString()}
                    </span>
                  ),
                },
                {
                  id: 'status',
                  header: 'STATUS',
                  align: 'right',
                  sortable: false,
                  cell: () => (
                    <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-[10px] uppercase">
                      Completed
                    </span>
                  ),
                },
              ]}
            />
          </div>
        )}

        {/* Settings Tab View */}
        {activeTab === 'settings' && (
          <div className="space-y-8 max-w-3xl">
            {/* Main Profile Info Card */}
            <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Profile & Account Identity
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Manage your personal display name, avatar, and preferred interface settings synced with Firestore.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Firestore Synced</span>
                </div>
              </div>

              {/* Avatar Selection & Preview */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-primary" />
                  Profile Avatar
                </label>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Live Avatar Preview */}
                  <div className="relative shrink-0">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Avatar preview"
                        className="h-20 w-20 rounded-2xl object-cover border-2 border-primary shadow-md"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-3xl font-black shadow-md">
                        {((displayName || user.displayName || user.email || 'U')[0]).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Preset Avatar Selection */}
                  <div className="flex-1 space-y-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Choose an avatar preset or enter a custom image URL:
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      {[
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
                        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
                        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
                        'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
                      ].map((presetUrl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAvatarUrl(presetUrl)}
                          className={`relative h-10 w-10 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                            avatarUrl === presetUrl ? 'border-primary ring-2 ring-primary/30 scale-105' : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'
                          }`}
                        >
                          <img src={presetUrl} alt={`Preset ${idx + 1}`} className="h-full w-full object-cover" />
                          {avatarUrl === presetUrl && (
                            <div className="absolute inset-0 bg-primary/30 flex items-center justify-center text-white">
                              <Check className="h-4 w-4 stroke-[3]" />
                            </div>
                          )}
                        </button>
                      ))}
                      {avatarUrl && (
                        <button
                          type="button"
                          onClick={() => setAvatarUrl('')}
                          className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer"
                        >
                          Clear Avatar
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Custom Avatar URL input */}
                <div className="pt-1">
                  <Input
                    label="Custom Avatar Image URL"
                    type="url"
                    placeholder="https://example.com/avatar.jpg"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    helperText="Direct image URL (JPEG, PNG, WebP) to display as your user icon."
                  />
                </div>
              </div>

              {/* Display Name and Email Fields */}
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
            </div>

            {/* Language & Regional Settings Card */}
            <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-6 shadow-sm">
              <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  Preferred Language & Localization
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Choose your preferred workspace language. This setting is saved directly to your cloud profile.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {SUPPORTED_LANGUAGES.map((lang) => {
                  const isSelected = selectedLanguage === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => setSelectedLanguage(lang.code as SupportedLanguage)}
                      className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50'
                      }`}
                    >
                      <span className="text-2xl">{lang.flag}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {lang.nativeName}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {lang.name} ({lang.code.toUpperCase()})
                        </p>
                      </div>
                      {isSelected && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Privacy & Data Settings Card */}
            <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-6 shadow-sm">
              <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Privacy & Data Retention
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Configure anonymous telemetry and automated processing history cleanup.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      Anonymous Telemetry & Usage Analytics
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Share anonymous performance metrics to help optimize client-side canvas transformations.
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
                    <option value={0}>Never (Keep history indefinitely)</option>
                    <option value={60}>After 1 hour</option>
                    <option value={1440}>After 24 hours</option>
                    <option value={10080}>After 7 days</option>
                  </select>
                  <p className="text-[11px] text-slate-400">
                    Automatically clears browser local image transforms and thumbnails after the chosen interval.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Changes will be saved to Firestore and updated immediately across all your devices.
              </p>
              <Button
                onClick={async () => {
                  setIsSaving(true);
                  try {
                    const ok = await updateUserProfile({
                      displayName: displayName.trim(),
                      avatar: avatarUrl.trim(),
                      photoURL: avatarUrl.trim(),
                      preferredLanguage: selectedLanguage,
                      privacySettings: {
                        telemetryOptIn,
                        autoPurgeHistoryMinutes: Number(autoPurgeHistoryMinutes),
                      },
                    });
                    if (ok && selectedLanguage !== language) {
                      setLanguage(selectedLanguage);
                    }
                  } finally {
                    setIsSaving(false);
                  }
                }}
                disabled={isSaving}
                variant="primary"
                size="md"
              >
                <Save className="h-4 w-4 mr-1.5" />
                {isSaving ? 'Saving to Firestore...' : 'Save Preferences'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  );
};
