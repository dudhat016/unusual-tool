import React, { useState } from 'react';
import { ALL_TOOLS } from '../../config/tools';
import { ToolAdminConfig } from '../../types/admin';
import {
  Wrench,
  Search,
  CheckCircle,
  XCircle,
  Sparkles,
  Layers,
  Settings,
  ShieldAlert,
  Flame,
  Star,
} from 'lucide-react';

interface AdminToolsTabProps {
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminToolsTab: React.FC<AdminToolsTabProps> = ({ showToast }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Local state for tool overrides
  const [toolConfigs, setToolConfigs] = useState<Record<string, Partial<ToolAdminConfig>>>(() => {
    try {
      const saved = localStorage.getItem('aetherpix_admin_tool_configs');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const handleToggle = (toolId: string, field: keyof ToolAdminConfig) => {
    setToolConfigs((prev) => {
      const current = prev[toolId] || {};
      const next = {
        ...prev,
        [toolId]: {
          ...current,
          [field]: !current[field],
        },
      };
      try {
        localStorage.setItem('aetherpix_admin_tool_configs', JSON.stringify(next));
      } catch {}
      showToast(`Updated ${field} for tool ${toolId}`, 'success');
      return next;
    });
  };

  const handleNumberChange = (toolId: string, field: keyof ToolAdminConfig, val: number) => {
    setToolConfigs((prev) => {
      const current = prev[toolId] || {};
      const next = {
        ...prev,
        [toolId]: {
          ...current,
          [field]: val,
        },
      };
      try {
        localStorage.setItem('aetherpix_admin_tool_configs', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const categories = Array.from(new Set(ALL_TOOLS.map((t) => t.category)));

  const filteredTools = ALL_TOOLS.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'all' || t.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tools by name, ID or route..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200"
        >
          <option value="all">All Categories ({ALL_TOOLS.length})</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Tools Table */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Tool</th>
                <th className="py-3 px-4">Route</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Tier Access</th>
                <th className="py-3 px-4">Batch Mode</th>
                <th className="py-3 px-4">Ads Enabled</th>
                <th className="py-3 px-4">SEO Index</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTools.map((t) => {
                const conf = toolConfigs[t.id] || {};
                const isPremiumOnly = conf.isPremiumOnly ?? Boolean((t as any).isPro || (t as any).isPremium);
                const batchEnabled = conf.batchEnabled ?? t.supportsBatch;
                const adsEnabled = conf.adsEnabled ?? true;
                const isMaintenance = conf.maintenanceMode ?? false;

                return (
                  <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{t.name}</span>
                        {t.isAi && (
                          <span className="bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[9px] px-1.5 py-0.5 rounded-sm font-black">
                            AI
                          </span>
                        )}
                        {t.isPopular && <Flame className="h-3.5 w-3.5 text-amber-500" />}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">{t.id}</div>
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-indigo-600 dark:text-indigo-400">
                      {t.route}
                    </td>

                    <td className="py-3 px-4 text-slate-500">{t.category}</td>

                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggle(t.id, 'isPremiumOnly')}
                        className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase cursor-pointer ${
                          isPremiumOnly
                            ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {isPremiumOnly ? 'Pro Only' : 'Free & Pro'}
                      </button>
                    </td>

                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggle(t.id, 'batchEnabled')}
                        className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase cursor-pointer ${
                          batchEnabled
                            ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        {batchEnabled ? 'Active' : 'Disabled'}
                      </button>
                    </td>

                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggle(t.id, 'adsEnabled')}
                        className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase cursor-pointer ${
                          adsEnabled
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        {adsEnabled ? 'On' : 'Off'}
                      </button>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                        Indexed
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggle(t.id, 'maintenanceMode')}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                          isMaintenance
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {isMaintenance ? 'Maintenance' : 'Operational'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
