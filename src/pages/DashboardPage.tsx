import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatFileSize } from '../engine/imageEngine';
import { DEFAULT_PLANS } from '../config/plans';
import { UserLayout } from '../components/layout/UserLayout';
import { DynamicIcon } from '../components/common/DynamicIcon';
import { DataTable, DataTableColumn, Input, Button } from '../components/ui';
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
    currentPath,
  } = useApp();

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

  const favoriteTools = ALL_TOOLS.filter((t) => favoritesList.includes(t.id));

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
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="h-16 w-16 rounded-2xl object-cover border-2 border-primary"
                />
              ) : (
                <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-2xl font-black shadow-md">
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
          <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-6 max-w-2xl">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Account Preferences</h3>
            <div className="space-y-4">
              <Input
                label="Display Name"
                type="text"
                defaultValue={user.displayName || ''}
              />
              <Input
                label="Email Address"
                type="email"
                disabled
                defaultValue={user.email || ''}
              />
              <Button
                onClick={() => showToast('Account preferences updated', 'success')}
                variant="primary"
                size="md"
              >
                Save Preferences
              </Button>
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  );
};
