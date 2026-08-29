import React from 'react';
import { UserProfile, ProcessingJobRecord, CreditLedgerRecord } from '../../types/saas';
import { SystemSettings } from '../../types/admin';
import { DEFAULT_PLANS } from '../../config/plans';
import { formatFileSize } from '../../engine/imageEngine';
import {
  Users,
  Activity,
  Layers,
  Sparkles,
  DollarSign,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Server,
  Zap,
} from 'lucide-react';

interface AdminOverviewTabProps {
  users: UserProfile[];
  jobs: ProcessingJobRecord[];
  ledger: CreditLedgerRecord[];
  systemSettings: SystemSettings;
}

export const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({
  users,
  jobs,
  ledger,
  systemSettings,
}) => {
  // Aggregate statistics
  const totalUsers = users.length;
  const freeUsers = users.filter((u) => u.plan === 'free' || !u.plan).length;
  const proUsers = users.filter((u) => u.plan === 'pro').length;
  const businessUsers = users.filter((u) => u.plan === 'business').length;

  const totalMonthlyRevenue = users.reduce((acc, u) => {
    if (u.plan === 'pro') return acc + (DEFAULT_PLANS.pro?.priceMonthly || 12);
    if (u.plan === 'business') return acc + (DEFAULT_PLANS.business?.priceMonthly || 39);
    return acc;
  }, 0);

  const totalProcessedCount = users.reduce((acc, u) => acc + (u.usage?.totalProcessedCount || 0), 0) + jobs.length;
  const totalBytesProcessed = jobs.reduce((acc, j) => acc + (j.originalSize || 0), 0);

  const successfulJobs = jobs.filter((j) => j.status === 'completed').length;
  const failedJobs = jobs.filter((j) => j.status === 'failed').length;
  const successRate = jobs.length > 0 ? Math.round((successfulJobs / jobs.length) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Total Users</span>
            <Users className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{totalUsers}</div>
          <div className="flex items-center gap-2 mt-2 text-[11px] font-semibold text-slate-500">
            <span className="text-primary font-bold">{proUsers + businessUsers} Premium</span>
            <span>•</span>
            <span>{freeUsers} Free</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Monthly Run-Rate (MRR)</span>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">${totalMonthlyRevenue}</div>
          <div className="flex items-center gap-1 mt-2 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="h-3 w-3" />
            <span>Active Subscriptions</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Processed Images</span>
            <Activity className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{totalProcessedCount.toLocaleString()}</div>
          <div className="flex items-center gap-1 mt-2 text-[11px] font-semibold text-slate-500">
            <span>{formatFileSize(totalBytesProcessed)} Data Transformed</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">System Success SLA</span>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{successRate}%</div>
          <div className="flex items-center gap-1 mt-2 text-[11px] font-semibold text-slate-500">
            <span>{failedJobs} Failed / {successfulJobs} Succeeded</span>
          </div>
        </div>
      </div>

      {/* Health & Emergency Status */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Server className="h-4 w-4 text-indigo-500" />
          <span>Platform Health & Emergency Status</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Maintenance Mode</div>
              <div className="text-[11px] text-slate-500">
                {systemSettings.maintenanceMode ? 'ACTIVE (Users Blocked)' : 'Disabled (Operational)'}
              </div>
            </div>
            <span
              className={`h-3 w-3 rounded-full ${
                systemSettings.maintenanceMode ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'
              }`}
            />
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">AI Neural Pipelines</div>
              <div className="text-[11px] text-slate-500">
                {systemSettings.emergencyAiDisabled ? 'Emergency Paused' : 'Active (Available)'}
              </div>
            </div>
            <span
              className={`h-3 w-3 rounded-full ${
                systemSettings.emergencyAiDisabled ? 'bg-rose-500' : 'bg-emerald-500'
              }`}
            />
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Batch Queue Limit</div>
              <div className="text-[11px] text-slate-500">
                {systemSettings.emergencyBatchDisabled ? 'Emergency 1-File Only' : 'Full Concurrency (2-4 Workers)'}
              </div>
            </div>
            <span
              className={`h-3 w-3 rounded-full ${
                systemSettings.emergencyBatchDisabled ? 'bg-rose-500' : 'bg-emerald-500'
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
