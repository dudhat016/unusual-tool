import React from 'react';
import { SystemSettings } from '../../types/admin';
import { ShieldAlert, AlertTriangle, Zap, Server } from 'lucide-react';

interface AdminTrafficTabProps {
  systemSettings: SystemSettings;
  onUpdateSettings: (settings: Partial<SystemSettings>) => Promise<boolean>;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminTrafficTab: React.FC<AdminTrafficTabProps> = ({
  systemSettings,
  onUpdateSettings,
  showToast,
}) => {
  const handleToggleEmergency = async (key: keyof SystemSettings) => {
    const nextVal = !systemSettings[key];
    await onUpdateSettings({ [key]: nextVal });
    showToast(`Updated emergency setting ${String(key)}: ${nextVal}`, 'info');
  };

  const handleUpdateNumber = async (key: keyof SystemSettings, val: number) => {
    await onUpdateSettings({ [key]: val });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Traffic Protection & Rate Limiting</h3>
        <p className="text-xs text-slate-500">
          Control anonymous guest quotas, concurrency thresholds, and emergency server protection.
        </p>
      </div>

      {/* Emergency Controls Section */}
      <div className="rounded-3xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/20 p-6 space-y-4 shadow-xs">
        <h4 className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          <span>Emergency Kill Switches</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="text-xs font-bold text-slate-900 dark:text-white">AI Neural Models</div>
            <p className="text-[11px] text-slate-500">Instantly pauses heavy neural upscaling & background models.</p>
            <button
              onClick={() => handleToggleEmergency('emergencyAiDisabled')}
              className={`w-full py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                systemSettings.emergencyAiDisabled
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {systemSettings.emergencyAiDisabled ? 'AI Paused (Click to Enable)' : 'AI Active'}
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="text-xs font-bold text-slate-900 dark:text-white">Batch Queues</div>
            <p className="text-[11px] text-slate-500">Forces all tools to single-file mode to prevent CPU congestion.</p>
            <button
              onClick={() => handleToggleEmergency('emergencyBatchDisabled')}
              className={`w-full py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                systemSettings.emergencyBatchDisabled
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {systemSettings.emergencyBatchDisabled ? 'Batch Disabled (1-File Only)' : 'Batch Active'}
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="text-xs font-bold text-slate-900 dark:text-white">Global Maintenance Mode</div>
            <p className="text-[11px] text-slate-500">Displays maintenance banner to all non-admin visitors.</p>
            <button
              onClick={() => handleToggleEmergency('maintenanceMode')}
              className={`w-full py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                systemSettings.maintenanceMode
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {systemSettings.maintenanceMode ? 'Maintenance ON' : 'Maintenance OFF'}
            </button>
          </div>
        </div>
      </div>

      {/* Quotas & Limits Configuration */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-6 shadow-xs">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Daily Anonymous & Rate Limits</h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="space-y-2">
            <label className="font-bold text-slate-500 block">Anonymous Daily Limit (Images / day)</label>
            <input
              type="number"
              value={systemSettings.anonymousDailyLimit}
              onChange={(e) => handleUpdateNumber('anonymousDailyLimit', parseInt(e.target.value) || 15)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
            />
            <span className="text-[10px] text-slate-400">Anonymous users hitting this will be prompted to create a free account.</span>
          </div>

          <div className="space-y-2">
            <label className="font-bold text-slate-500 block">Registered Free Daily Limit (Images / day)</label>
            <input
              type="number"
              value={systemSettings.registeredFreeDailyLimit}
              onChange={(e) => handleUpdateNumber('registeredFreeDailyLimit', parseInt(e.target.value) || 50)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
            />
            <span className="text-[10px] text-slate-400">Daily limit for authenticated free accounts.</span>
          </div>

          <div className="space-y-2">
            <label className="font-bold text-slate-500 block">Normal Tool Rate Limit (Req / min)</label>
            <input
              type="number"
              value={systemSettings.rateLimitNormalReqPerMin}
              onChange={(e) => handleUpdateNumber('rateLimitNormalReqPerMin', parseInt(e.target.value) || 60)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="font-bold text-slate-500 block">AI Operations Rate Limit (Req / min)</label>
            <input
              type="number"
              value={systemSettings.rateLimitAiReqPerMin}
              onChange={(e) => handleUpdateNumber('rateLimitAiReqPerMin', parseInt(e.target.value) || 5)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
