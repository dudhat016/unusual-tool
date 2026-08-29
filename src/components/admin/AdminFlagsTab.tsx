import React, { useState } from 'react';
import { FeatureFlag, FeatureFlagStatus } from '../../types/admin';
import { DEFAULT_FEATURE_FLAGS } from '../../config/featureFlags';
import { Flag, CheckCircle, Clock, Lock, XCircle } from 'lucide-react';

interface AdminFlagsTabProps {
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminFlagsTab: React.FC<AdminFlagsTabProps> = ({ showToast }) => {
  const [flags, setFlags] = useState<FeatureFlag[]>(DEFAULT_FEATURE_FLAGS);

  const handleUpdateStatus = (key: string, nextStatus: FeatureFlagStatus) => {
    setFlags((prev) =>
      prev.map((f) => (f.key === key ? { ...f, status: nextStatus, updatedAt: Date.now() } : f))
    );
    showToast(`Feature flag ${key} set to ${nextStatus}`, 'success');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Feature Flag Switchboard</h3>
        <p className="text-xs text-slate-500">
          Dynamically enable, disable, restrict to premium, or show coming soon badges for capabilities.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Feature Flag</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-right">Status Selector</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {flags.map((f) => (
                <tr key={f.key} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 dark:text-white">{f.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{f.key}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase">
                      {f.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 max-w-sm">{f.description}</td>
                  <td className="py-3 px-4 text-right">
                    <select
                      value={f.status}
                      onChange={(e) => handleUpdateStatus(f.key, e.target.value as FeatureFlagStatus)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                        f.status === 'enabled'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : f.status === 'premium_only'
                          ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                          : f.status === 'coming_soon'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      <option value="enabled">Enabled (All Users)</option>
                      <option value="premium_only">Pro & Business Only</option>
                      <option value="free">Free Tier Only</option>
                      <option value="coming_soon">Coming Soon</option>
                      <option value="disabled">Disabled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
