import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { SaaSDataService } from '../services/SaaSDataService';
import { UserProfile, ProcessingJobRecord, CreditLedgerRecord, SystemErrorLog } from '../types/saas';
import { AdminOverviewTab } from '../components/admin/AdminOverviewTab';
import { AdminUsersTab } from '../components/admin/AdminUsersTab';
import { AdminToolsTab } from '../components/admin/AdminToolsTab';
import { AdminPlansTab } from '../components/admin/AdminPlansTab';
import { AdminAdsTab } from '../components/admin/AdminAdsTab';
import { AdminTrafficTab } from '../components/admin/AdminTrafficTab';
import { AdminFlagsTab } from '../components/admin/AdminFlagsTab';
import { AdminAuditTab } from '../components/admin/AdminAuditTab';
import { AdminTranslationsTab } from '../components/admin/AdminTranslationsTab';
import {
  ShieldAlert,
  Users,
  CreditCard,
  Zap,
  Activity,
  Layers,
  Sparkles,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  Search,
  Flag,
  Server,
  Lock,
  Compass,
  Radio,
  Globe,
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { user, isAdmin, navigate, showToast, systemSettings, updateSystemSettings } = useApp();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'users' | 'tools' | 'plans' | 'ads' | 'traffic' | 'flags' | 'translations' | 'audit'
  >('overview');

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [jobs, setJobs] = useState<ProcessingJobRecord[]>([]);
  const [ledger, setLedger] = useState<CreditLedgerRecord[]>([]);
  const [logs, setLogs] = useState<SystemErrorLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [uList, jList, lList, errList] = await Promise.all([
        SaaSDataService.getAllUsers(100),
        SaaSDataService.getAllJobs(100),
        SaaSDataService.getAllLedger(100),
        SaaSDataService.getAllErrorLogs(50),
      ]);
      setUsers(uList || []);
      setJobs(jList || []);
      setLedger(lList || []);
      setLogs(errList || []);
    } catch (err) {
      console.error('Error loading admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 rounded-3xl border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-slate-900 text-center space-y-4 shadow-xl">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
          <Lock className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Admin Access Restricted</h2>
        <p className="text-xs text-slate-500">
          You need an administrator account to view the SaaS operations console.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold"
        >
          Return Home
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'users', label: 'Users', icon: Users, count: users.length },
    { id: 'tools', label: 'Tools Config', icon: Layers },
    { id: 'plans', label: 'Plans & Tiers', icon: CreditCard },
    { id: 'ads', label: 'Ad Monetization', icon: Radio },
    { id: 'traffic', label: 'Traffic & Limits', icon: Zap },
    { id: 'flags', label: 'Feature Flags', icon: Flag },
    { id: 'translations', label: 'i18n & Locales', icon: Globe },
    { id: 'audit', label: 'Audit Trail', icon: Server, count: ledger.length },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 py-4">
      {/* Top Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-purple-200 dark:border-purple-900/60 bg-gradient-to-r from-purple-950/10 via-indigo-950/10 to-blue-950/10 dark:from-purple-950/40 dark:via-indigo-950/40 dark:to-blue-950/40 p-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/25">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">Admin Operations Console</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Traffic, Limits, Ad Monetization, User Accounts, Locales & Emergency Controls
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/admin/seo')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 text-xs font-bold hover:bg-purple-100 transition-colors"
          >
            <Compass className="h-3.5 w-3.5" />
            <span>SEO Engine</span>
          </button>

          <button
            onClick={loadData}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 shadow-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Two-Column Vertical Layout: Sidebar + Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Vertical Sidebar */}
        <aside className="lg:col-span-3 lg:sticky lg:top-24 space-y-4">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-xs space-y-1">
            <div className="px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Admin Navigation
            </div>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.count !== undefined && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                        isActive
                          ? 'bg-purple-700/60 text-purple-100'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick System Status Card */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>Maintenance Mode</span>
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  systemSettings.maintenanceMode ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                }`}
              />
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {systemSettings.maintenanceMode
                ? 'Active: Public access is blocked.'
                : 'Operational: SaaS running normally.'}
            </p>
          </div>
        </aside>

        {/* Right Main Content Panels */}
        <main className="lg:col-span-9 min-w-0 space-y-6">
          {activeTab === 'overview' && (
            <AdminOverviewTab
              users={users}
              jobs={jobs}
              ledger={ledger}
              systemSettings={systemSettings}
            />
          )}

          {activeTab === 'users' && (
            <AdminUsersTab users={users} onRefresh={loadData} showToast={showToast} />
          )}

          {activeTab === 'tools' && <AdminToolsTab showToast={showToast} />}

          {activeTab === 'plans' && <AdminPlansTab showToast={showToast} />}

          {activeTab === 'ads' && <AdminAdsTab showToast={showToast} />}

          {activeTab === 'traffic' && (
            <AdminTrafficTab
              systemSettings={systemSettings}
              onUpdateSettings={updateSystemSettings}
              showToast={showToast}
            />
          )}

          {activeTab === 'flags' && <AdminFlagsTab showToast={showToast} />}

          {activeTab === 'translations' && <AdminTranslationsTab />}

          {activeTab === 'audit' && <AdminAuditTab ledger={ledger} errorLogs={logs} />}
        </main>
      </div>
    </div>
  );
};
