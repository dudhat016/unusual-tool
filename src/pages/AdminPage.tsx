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
import { AdminBlogsTab } from '../components/admin/AdminBlogsTab';
import { AdminSettingsView } from '../views/AdminSettingsView';
import { AnalyticsDashboard } from '../views/AnalyticsDashboard';
import { SeoAdminView } from '../views/SeoAdminView';
import { UIKitCatalogView } from '../views/UIKitCatalogView';
import { AdminLayout } from '../components/layout/AdminLayout';
import { Lock } from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { user, isAdmin, navigate, showToast, systemSettings, updateSystemSettings, currentPath } = useApp();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [jobs, setJobs] = useState<ProcessingJobRecord[]>([]);
  const [ledger, setLedger] = useState<CreditLedgerRecord[]>([]);
  const [logs, setLogs] = useState<SystemErrorLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Derive active tab from URL route path (e.g. /admin/users -> 'users') or query param
  const getActiveTabFromRoute = (): 'overview' | 'analytics' | 'users' | 'tools' | 'plans' | 'ads' | 'traffic' | 'flags' | 'translations' | 'audit' | 'seo' | 'blogs' | 'ui-kit' | 'settings' => {
    const raw = (currentPath || window.location.pathname).split('?')[0].replace(/\/$/, '');
    const cleanPath = raw.replace(/^\/(en|hi|es|fr|de|pt|it|ja|ko|zh|ar)/i, '') || '/';
    const segments = cleanPath.split('/').filter(Boolean);
    const subRoute = segments[1] || '';

    const validTabs = ['overview', 'analytics', 'users', 'tools', 'plans', 'ads', 'traffic', 'flags', 'translations', 'audit', 'seo', 'blogs', 'ui-kit', 'settings'];

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
      navigate('/admin');
    } else {
      navigate(`/admin/${tab}`);
    }
  };

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
          className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md shadow-primary/25 hover:bg-primary/90 transition-colors"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <AdminLayout
      activeTab={activeTab}
      onTabChange={handleTabChange}
      userCount={users.length}
      errorLogCount={logs.length}
    >
      <div className="space-y-6">
        {/* Tab Panels */}
        {activeTab === 'overview' && (
          <AdminOverviewTab
            users={users}
            jobs={jobs}
            ledger={ledger}
            systemSettings={systemSettings}
            navigate={navigate}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard
            users={users}
            jobs={jobs}
            ledger={ledger}
            errorLogs={logs}
            showToast={showToast}
            navigate={navigate}
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

        {activeTab === 'seo' && <SeoAdminView />}

        {activeTab === 'blogs' && <AdminBlogsTab showToast={showToast} />}

        {activeTab === 'settings' && <AdminSettingsView />}

        {activeTab === 'ui-kit' && <UIKitCatalogView />}
      </div>
    </AdminLayout>
  );
};
