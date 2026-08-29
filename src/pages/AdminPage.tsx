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
import { AdminLayout } from '../components/layout/AdminLayout';
import { Lock, RefreshCw, Compass } from 'lucide-react';

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

  // Sync tab with URL query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (
      tabParam &&
      ['overview', 'users', 'tools', 'plans', 'ads', 'traffic', 'flags', 'translations', 'audit'].includes(
        tabParam
      )
    ) {
      setActiveTab(tabParam as any);
    }
  }, []);

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
          className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-md shadow-purple-600/25 hover:bg-purple-500 transition-colors"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <AdminLayout
      activeTab={activeTab}
      onTabChange={(tab) => {
        setActiveTab(tab);
        const url = new URL(window.location.href);
        url.searchParams.set('tab', tab);
        window.history.pushState({}, '', url.toString());
      }}
      userCount={users.length}
      errorLogCount={logs.length}
    >
      <div className="space-y-6">
        {/* Top Header Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl border border-purple-200 dark:border-purple-900/40 bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-slate-900/5 dark:from-purple-950/40 dark:via-indigo-950/20 dark:to-slate-900/60">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white capitalize">
              {activeTab === 'overview'
                ? 'System Analytics & Platform Health'
                : `${activeTab} Management Console`}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live SaaS telemetry, rate limiting controls, monetization settings, and tools configuration.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/admin/seo')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 text-xs font-bold hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
            >
              <Compass className="h-3.5 w-3.5" />
              <span>SEO Diagnostic Hub</span>
            </button>

            <button
              onClick={loadData}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 shadow-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync Data</span>
            </button>
          </div>
        </div>

        {/* Tab Panels */}
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
      </div>
    </AdminLayout>
  );
};
