import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatFileSize } from '../engine/imageEngine';
import { DEFAULT_PLANS } from '../config/plans';
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

  // URL tab sync
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['overview', 'usage', 'credits', 'history', 'favorites', 'presets', 'subscription', 'settings'].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, []);

  if (!user) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-6 shadow-xl">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
          <User className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Sign In to Access Your SaaS Dashboard
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Manage your AI credits ledger, download history, custom presets, and subscription limits in one central place.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => openAuthModal('signin')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-md shadow-blue-500/20 transition-all"
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
    <div className="max-w-7xl mx-auto space-y-8 py-4">
      {/* User Header Profile Banner */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            {user.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="h-16 w-16 rounded-2xl object-cover border-2 border-blue-500" />
            ) : (
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-md">
                {(user.displayName || user.email || 'U')[0].toUpperCase()}
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" title="Online" />
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {user.displayName || user.email?.split('@')[0]}
              </h1>
              <span className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] uppercase font-extrabold px-2.5 py-0.5 tracking-wider">
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

        {/* Quick Balance & Action */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-start md:justify-end">
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 p-3.5 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Zap className="h-5 w-5 fill-amber-500" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Ledger Credits</span>
              <span className="text-base font-black text-slate-900 dark:text-white font-mono">
                {userProfile?.credits || 0} / {activePlanConfig.monthlyCredits}
              </span>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('subscription')}
            className="px-4 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
          >
            <CreditCard className="h-4 w-4" />
            <span>Manage Plan</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              className="px-4 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition-all flex items-center gap-1.5"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Admin Center</span>
            </button>
          )}

          <button
            onClick={logout}
            className="px-3.5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Two-Column Vertical Layout: User Sidebar + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Vertical User Sidebar */}
        <aside className="lg:col-span-3 lg:sticky lg:top-24 space-y-4">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-xs space-y-1">
            <div className="px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Account Navigation
            </div>
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'usage', label: 'Usage Limits', icon: Sliders },
              { id: 'credits', label: 'Credit Ledger', icon: Zap },
              { id: 'history', label: 'Job History', icon: History, count: historyList.length },
              { id: 'favorites', label: 'Favorites', icon: Heart, count: favoritesList.length },
              { id: 'presets', label: 'Saved Presets', icon: Bookmark, count: presetsList.length },
              { id: 'subscription', label: 'Subscription', icon: CreditCard },
              { id: 'settings', label: 'Settings & Privacy', icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Plan & Credits Summary Card */}
          <div className="rounded-3xl border border-blue-100 dark:border-blue-950 bg-gradient-to-b from-blue-50/50 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/20 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Current Plan</span>
              <span className="text-xs font-black uppercase text-blue-600 dark:text-blue-400">{activePlanConfig.name}</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-900 dark:text-white">
                <span>Monthly Credits</span>
                <span className="font-mono">{userProfile?.credits || 0} / {activePlanConfig.monthlyCredits}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, Math.max(5, ((userProfile?.credits || 0) / activePlanConfig.monthlyCredits) * 100))}%`,
                  }}
                />
              </div>
            </div>
            <button
              onClick={() => setActiveTab('subscription')}
              className="w-full py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-2xs transition-colors"
            >
              Upgrade / Manage
            </button>
          </div>
        </aside>

        {/* Right Main Content Area */}
        <main className="lg:col-span-9 min-w-0 space-y-6">
        {/* ================= OVERVIEW TAB ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Credits Remaining</span>
                <p className="text-3xl font-black text-slate-900 dark:text-white mt-1 font-mono">
                  {userProfile?.credits || 0}
                </p>
                <span className="text-xs text-slate-500 mt-1 block">
                  Resets in {Math.round((credits.resetsAt - Date.now()) / (1000 * 3600 * 24))} days
                </span>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Images Processed (All Time)</span>
                <p className="text-3xl font-black text-blue-600 dark:text-blue-400 mt-1 font-mono">
                  {userUsage.totalProcessedCount}
                </p>
                <span className="text-xs text-slate-500 mt-1 block">{userUsage.monthProcessedCount} this month</span>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Operations (Month)</span>
                <p className="text-3xl font-black text-purple-600 dark:text-purple-400 mt-1 font-mono">
                  {userUsage.monthAiCount}
                </p>
                <span className="text-xs text-slate-500 mt-1 block">{userUsage.todayAiCount} processed today</span>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Plan Limits</span>
                <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {activePlanConfig.maxFileSizeMB}MB / {activePlanConfig.maxResolutionMegapixels}MP
                </p>
                <span className="text-xs text-slate-500 mt-1 block">Batch: up to {activePlanConfig.maxBatchSize} images</span>
              </div>
            </div>

            {/* Quick Access Tools */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  <span>Popular SaaS Image Tools</span>
                </h3>
                <button onClick={() => navigate('/tools')} className="text-xs font-bold text-blue-600 hover:underline">
                  Browse All 14+ Tools
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {ALL_TOOLS.slice(0, 4).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => navigate(t.route)}
                    className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800 text-left transition-all group"
                  >
                    <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {t.name}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {t.shortDescription}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Processing Ledger Activity */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <span>Recent Credit Ledger Transactions</span>
                </h3>
                <button onClick={() => setActiveTab('credits')} className="text-xs font-bold text-blue-600 hover:underline">
                  View Full Ledger
                </button>
              </div>

              {creditLedger.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {creditLedger.slice(0, 5).map((record) => (
                    <div key={record.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{record.description}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {new Date(record.timestamp).toLocaleString()} • Type: {record.transactionType}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`font-mono font-bold text-sm ${
                            record.amount >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {record.amount > 0 ? `+${record.amount}` : record.amount}
                        </span>
                        <span className="block text-[10px] text-slate-400">Bal: {record.balanceAfter}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center">No ledger records yet.</p>
              )}
            </div>
          </div>
        )}

        {/* ================= USAGE & LIMITS TAB ================= */}
        {activeTab === 'usage' && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Active Plan Limits & Quotas</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Enforced safeguards for rate limits, resolution caps, and concurrency quotas on your {activePlanConfig.name}.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">File Size Limit</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-extrabold text-blue-600">{activePlanConfig.maxFileSizeMB} MB</span>
                    <span className="text-xs text-slate-400">per uploaded image</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Images larger than {activePlanConfig.maxFileSizeMB}MB require Pro or Business upgrade.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Maximum Resolution</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-extrabold text-purple-600">{activePlanConfig.maxResolutionMegapixels} Megapixels</span>
                    <span className="text-xs text-slate-400">canvas render cap</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    High precision pixel operations up to {activePlanConfig.maxResolutionMegapixels} million pixels.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Batch Processing Concurrency</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-extrabold text-emerald-600">{activePlanConfig.maxBatchSize} Images</span>
                    <span className="text-xs text-slate-400">simultaneous queue</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Batch upload and compress/convert up to {activePlanConfig.maxBatchSize} photos at once.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">AI Burst Rate Limit</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-extrabold text-amber-600">{activePlanConfig.aiRateLimitPerMin} req / min</span>
                    <span className="text-xs text-slate-400">sliding rate window</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Guarantees high availability and zero queue congestion for computer-vision operations.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-blue-900 dark:text-blue-200">Need higher resolution or unlimited batch sizes?</h4>
                  <p className="text-[11px] text-blue-700 dark:text-blue-400">Upgrade to Pro Creator or Business Studio.</p>
                </div>
                <button
                  onClick={() => setActiveTab('subscription')}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-500 transition-colors"
                >
                  View Plans
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= CREDIT LEDGER TAB ================= */}
        {activeTab === 'credits' && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Immutable Credit Ledger</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Strict ledger tracking every single credit addition, usage debit, bonus, and refund.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-3 py-1 rounded-xl border border-amber-200 dark:border-amber-900">
                  Current Balance: {userProfile?.credits || 0} Credits
                </span>
              </div>

              {creditLedger.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                        <th className="py-2.5 px-3">Date & Time</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">Description</th>
                        <th className="py-2.5 px-3 text-right">Amount</th>
                        <th className="py-2.5 px-3 text-right">Balance After</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                      {creditLedger.map((rec) => (
                        <tr key={rec.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                            {new Date(rec.timestamp).toLocaleString()}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                                rec.transactionType === 'purchase' || rec.transactionType === 'bonus' || rec.transactionType === 'subscription'
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                              }`}
                            >
                              {rec.transactionType}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-sans text-slate-800 dark:text-slate-200">{rec.description}</td>
                          <td
                            className={`py-3 px-3 text-right font-bold ${
                              rec.amount >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {rec.amount > 0 ? `+${rec.amount}` : rec.amount}
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white">
                            {rec.balanceAfter}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No credit transactions recorded yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= JOB HISTORY TAB ================= */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Processing Telemetry & History</h3>
                <span className="text-xs text-slate-400 font-mono">{jobsList.length} synced jobs</span>
              </div>

              {jobsList.length > 0 ? (
                <div className="space-y-3">
                  {jobsList.map((job) => (
                    <div
                      key={job.id}
                      className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">{job.toolName}</span>
                          <span className="text-[10px] font-bold uppercase bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-1.5 py-0.2 rounded">
                            {job.processorType}
                          </span>
                        </div>
                        <p className="text-slate-500 font-mono">{job.fileName}</p>
                      </div>

                      <div className="flex items-center gap-4 text-slate-500 font-mono text-[11px]">
                        {job.resultSize && <span>Saved {formatFileSize(job.originalSize - job.resultSize)}</span>}
                        {job.processingTimeMs && <span>{job.processingTimeMs}ms</span>}
                        <span className="text-slate-400">{new Date(job.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs">No cloud synced jobs yet.</div>
              )}
            </div>
          </div>
        )}

        {/* ================= FAVORITES TAB ================= */}
        {activeTab === 'favorites' && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Your Starred Tools</h3>
              {favoriteTools.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favoriteTools.map((tool) => (
                    <div
                      key={tool.id}
                      onClick={() => navigate(tool.route)}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 bg-white dark:bg-slate-800/40 cursor-pointer transition-all space-y-2 group"
                    >
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600">
                        {tool.name}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2">{tool.shortDescription}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-8 text-center">
                  You have not favorited any tools yet. Click the heart icon on any tool card to pin it here.
                </p>
              )}
            </div>
          </div>
        )}

        {/* ================= PRESETS TAB ================= */}
        {activeTab === 'presets' && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Saved Parameter Presets</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Quickly apply your frequent dimensions, compression profiles, and filters.</p>
                </div>
              </div>

              {presetsList.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {presetsList.map((p) => (
                    <div key={p.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">{p.title}</span>
                        <span className="text-[10px] text-blue-600 uppercase font-mono font-bold">{p.toolId}</span>
                      </div>
                      <pre className="text-[10px] bg-white dark:bg-slate-900 p-2 rounded-lg font-mono text-slate-600 dark:text-slate-400 overflow-x-auto">
                        {JSON.stringify(p.options, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-8 text-center">
                  No saved presets yet. When configuring any tool, save your settings to cloud presets.
                </p>
              )}
            </div>
          </div>
        )}

        {/* ================= SUBSCRIPTION TAB ================= */}
        {activeTab === 'subscription' && (
          <div className="space-y-8">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">SaaS Plans & Subscriptions</h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Configurable tiers designed for creators, designers, developers, and studios.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {(['free', 'pro', 'business'] as const).map((tierKey) => {
                  const plan = DEFAULT_PLANS[tierKey];
                  const isCurrent = userProfile?.plan === tierKey;

                  return (
                    <div
                      key={tierKey}
                      className={`rounded-3xl p-6 border flex flex-col justify-between transition-all ${
                        isCurrent
                          ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/20 ring-2 ring-blue-600'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-bold text-slate-900 dark:text-white">{plan.name}</h4>
                          {isCurrent && (
                            <span className="text-[10px] font-extrabold uppercase bg-blue-600 text-white px-2.5 py-0.5 rounded-full">
                              Active Plan
                            </span>
                          )}
                        </div>

                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-black text-slate-900 dark:text-white">${plan.priceMonthly}</span>
                          <span className="text-xs text-slate-500 font-medium">/ month</span>
                        </div>

                        <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                          {plan.features.map((feat, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-6">
                        {isCurrent ? (
                          <button
                            disabled
                            className="w-full py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-500 font-bold text-xs cursor-default"
                          >
                            Current Tier
                          </button>
                        ) : (
                          <button
                            onClick={() => upgradePlan(tierKey)}
                            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all"
                          >
                            Upgrade to {plan.name}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>
                  Pluggable payment provider architecture (Stripe / Paddle / LemonSqueezy ready without code rewrites).
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ================= SETTINGS TAB ================= */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Privacy & Engine Preferences</h3>
                <p className="text-xs text-slate-500 mt-0.5">Control client-side telemetry and data retention policies.</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Zero Cloud Image Storage</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Your original photos and edited results are NEVER uploaded or retained on remote cloud servers.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-lg">
                    Always Active
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Anonymized Processing Telemetry</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Record processing durations and compression savings to optimize Web Worker algorithms.
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600 h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        )}
        </main>
      </div>
    </div>
  );
};
