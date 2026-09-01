import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatFileSize } from '../engine/imageEngine';
import { DEFAULT_PLANS } from '../config/plans';
import { UserLayout } from '../components/layout/UserLayout';
import { DynamicIcon } from '../components/common/DynamicIcon';
import { DataTable, DataTableColumn, Input, Button } from '../components/ui';
import { SaaSDataService } from '../services/SaaSDataService';
import { useTranslation, SUPPORTED_LANGUAGES, SupportedLanguage } from '../i18n';
import { AccountSettings } from '../components/account/AccountSettings';
import { CreditManagementView } from '../components/credits/CreditManagementView';
import { ToolCard } from '../components/common/ToolCard';
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
  const getActiveTabFromRoute = (): 'overview' | 'usage' | 'credits' | 'history' | 'favorites' | 'presets' | 'subscription' | 'billing' | 'settings' | 'profile' | 'privacy' => {
    const raw = (currentPath || window.location.pathname).split('?')[0].replace(/\/$/, '');
    const cleanPath = raw.replace(/^\/(en|hi|es|fr|de|pt|it|ja|ko|zh|ar)/i, '') || '/';

    const segments = cleanPath.split('/').filter(Boolean);
    const subRoute = segments[1] || '';

    const validTabs = ['overview', 'usage', 'credits', 'history', 'favorites', 'presets', 'subscription', 'billing', 'settings', 'profile', 'privacy'];

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
                  <ToolCard key={tool.id} tool={tool} />
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

        {/* Credits Ledger Tab View */}
        {activeTab === 'credits' && (
          <CreditManagementView onUpgradeClick={() => handleTabChange('subscription')} />
        )}

        {/* Subscription Tab View */}
        {activeTab === 'subscription' && (
          <div className="space-y-4">
            <AccountSettings initialTab="subscription" hideTabBar />
          </div>
        )}

        {/* Billing Tab View */}
        {activeTab === 'billing' && (
          <div className="space-y-4">
            <AccountSettings initialTab="billing" hideTabBar />
          </div>
        )}

        {/* Settings / Profile Tab View */}
        {(activeTab === 'settings' || activeTab === 'profile') && (
          <div className="space-y-4">
            <AccountSettings initialTab="profile" hideTabBar />
          </div>
        )}

        {/* Privacy Tab View */}
        {activeTab === 'privacy' && (
          <div className="space-y-4">
            <AccountSettings initialTab="privacy" hideTabBar />
          </div>
        )}
      </div>
    </UserLayout>
  );
};
