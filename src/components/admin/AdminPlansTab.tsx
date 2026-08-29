import React, { useState } from 'react';
import { PlanConfig } from '../../types/saas';
import { Input, NumberInput } from '../ui';
import { DEFAULT_PLANS } from '../../config/plans';
import {
  CreditCard,
  CheckCircle,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Sparkles,
  Zap,
} from 'lucide-react';

interface AdminPlansTabProps {
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminPlansTab: React.FC<AdminPlansTabProps> = ({ showToast }) => {
  const [plans, setPlans] = useState<Record<string, PlanConfig>>(DEFAULT_PLANS);
  const [editingPlanKey, setEditingPlanKey] = useState<string | null>(null);

  const handleUpdateField = (planKey: string, field: keyof PlanConfig, value: any) => {
    setPlans((prev) => ({
      ...prev,
      [planKey]: {
        ...prev[planKey],
        [field]: value,
      },
    }));
    showToast(`Updated ${field} for ${plans[planKey]?.name}`, 'info');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Subscription Tiers & Quotas</h3>
          <p className="text-xs text-slate-500">Configure pricing, daily image allowances, and max file limits.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(Object.entries(plans) as [string, PlanConfig][]).map(([key, plan]) => (
          <div
            key={key}
            className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-6 shadow-xs flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-primary">
                  {key.toUpperCase()} TIER
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    plan.adsEnabled
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {plan.adsEnabled ? 'Ad-Supported' : '100% Ad-Free'}
                </span>
              </div>

              <div>
                <Input
                  type="text"
                  value={plan.name}
                  onChange={(e) => handleUpdateField(key, 'name', e.target.value)}
                />
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">${plan.priceMonthly}</span>
                  <span className="text-xs text-slate-400">/ month (${plan.priceYearly}/yr)</span>
                </div>
              </div>

              {/* Editable Fields Grid */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Daily Images Limit:</span>
                  <NumberInput
                    value={plan.dailyImagesLimit || 50}
                    onChange={(v) => handleUpdateField(key, 'dailyImagesLimit', v || 50)}
                    className="w-24"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Monthly AI Credits:</span>
                  <NumberInput
                    value={plan.monthlyCredits}
                    onChange={(v) => handleUpdateField(key, 'monthlyCredits', v || 0)}
                    className="w-24"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Max File Size (MB):</span>
                  <NumberInput
                    value={plan.maxFileSizeMB}
                    onChange={(v) => handleUpdateField(key, 'maxFileSizeMB', v || 20)}
                    className="w-24"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Max Batch Size:</span>
                  <NumberInput
                    value={plan.maxBatchSize}
                    onChange={(v) => handleUpdateField(key, 'maxBatchSize', v || 5)}
                    className="w-24"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => handleUpdateField(key, 'adsEnabled', !plan.adsEnabled)}
                className="w-full py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
              >
                {plan.adsEnabled ? 'Disable Ads for Tier' : 'Enable Ads for Tier'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
