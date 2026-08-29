import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatFileSize } from '../engine/imageEngine';
import { DEFAULT_PLANS } from '../config/plans';
import { UserLayout } from '../components/layout/UserLayout';
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
} from 'lucide-react';
import { ALL_TOOLS } from '../config/tools';

export const DashboardPage: React.FC = () => {
  const {
    user,
    userProfile,
    openAuthModal,
    logout,
    credits,
    activePlanConfig,
    creditLedger,
    processingJobs,
    presets,
    history,
    favorites,
    navigate,
    upgradePlan,
    showToast,
    savePreset,
    isAdmin,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'usage' | 'credits' | 'history' | 'favorites' | 'presets' | 'subscription' | 'settings'
  >('overview');

  const creditBalance = typeof credits === 'number' ? credits : Math.max(0, (credits?.total ?? 0) - (credits?.used ?? 0));

  // URL tab sync
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (
      tabParam &&
      ['overview', 'usage', 'credits', 'history', 'favorites', 'presets', 'subscription', 'settings'].includes(
        tabParam
      )
    ) {
      setActiveTab(tabParam as any);
    }
  }, []);

  if (!user) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 rounded-3xl border border-purple-200 dark:border-purple-900/40 bg-white dark:bg-slate-900 text-center space-y-6 shadow-xl">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25">
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
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold shadow-md shadow-purple-500/20 transition-all"
          >
            Sign In with Email / Google
          </button>
          <button
            onClick={() => openAuthModal('signup')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold transition-all"
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

  const favoriteTools = ALL_TOOLS.filter((t) => favoritesList.includes(t.id));

  return (
    <UserLayout
      activeTab={activeTab}
      onTabChange={(tab) => {
        setActiveTab(tab);
        const url = new URL(window.location.href);
        url.searchParams.set('tab', tab);
        window.history.pushState({}, '', url.toString());
      }}
    >
      <div className="space-y-8">
        {/* User Profile Header Card */}
        <div className="rounded-3xl border border-purple-200 dark:border-purple-900/40 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="h-16 w-16 rounded-2xl object-cover border-2 border-purple-500"
                />
              ) : (
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-md">
                  {(user.displayName || user.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <span
                className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900"
                title="Online"
              />
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {user.displayName || user.email?.split('@')[0]}
                </h1>
                <span className="rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] uppercase font-extrabold px-2.5 py-0.5 tracking-wider">
                  {activePlanConfig.name}
                </span>
                {isAdmin && (
                  <span className="rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800 text-[10px] uppercase font-extrabold px-2 py-0.5">
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
              <div className="h-9 w-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Zap className="h-5 w-5 fill-purple-600" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Ledger Balance</span>
                <span className="text-base font-black text-slate-900 dark:text-white font-mono">
                  {creditBalance} / {activePlanConfig.monthlyCredits}
                </span>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('subscription')}
              className="px-4 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition-all flex items-center gap-1.5"
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
                <span className="text-xs font-bold text-slate-400 uppercase">Monthly Processed</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                  {userUsage.monthProcessedCount} / {activePlanConfig.dailyImagesLimit * 30}
                </p>
              </div>
              <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Saved Presets</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                  {presetsList.length}
                </p>
              </div>
              <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Favorite Tools</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                  {favoritesList.length}
                </p>
              </div>
            </div>

            {/* Favorite Tools Grid */}
            <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500" /> Favorite Tools Shortcuts
              </h3>
              {favoriteTools.length === 0 ? (
                <p className="text-xs text-slate-400 py-4">No tools saved as favorite yet. Click the heart icon on any tool card to pin it here.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {favoriteTools.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => navigate(`/${t.slug}`)}
                      className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-purple-500/50 hover:bg-purple-500/5 text-left transition-all group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                        {React.createElement(t.icon, { className: 'w-5 h-5' })}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400">
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
                        ? 'border-purple-500 bg-purple-500/5 dark:bg-purple-950/20 shadow-lg shadow-purple-500/10'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                    } flex flex-col justify-between space-y-6`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-black text-slate-900 dark:text-white">{plan.name}</h4>
                        {isCurrent && (
                          <span className="px-2.5 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-extrabold uppercase">
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
                          : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/25'
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

        {/* History Tab View */}
        {activeTab === 'history' && (
          <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Recent Job History</h3>
            {historyList.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No processing history recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {historyList.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                        <History className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{item.toolName}</p>
                        <span className="text-[10px] text-slate-400">
                          {new Date(item.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-[10px]">
                      Completed
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Settings Tab View */}
        {activeTab === 'settings' && (
          <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-6 max-w-2xl">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Account Preferences</h3>
            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Display Name</label>
                <input
                  type="text"
                  defaultValue={user.displayName || ''}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  defaultValue={user.email || ''}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60 text-slate-500 cursor-not-allowed font-mono"
                />
              </div>
              <button
                onClick={() => showToast('Account preferences updated', 'success')}
                className="px-5 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-500 shadow-md shadow-purple-600/25 transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  );
};
