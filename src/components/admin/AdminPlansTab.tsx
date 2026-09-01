import React, { useState, useEffect } from 'react';
import { PlanConfig } from '../../types/saas';
import { CreditTopUpPackage } from '../../types/credits';
import { Input, NumberInput, Button } from '../ui';
import { DEFAULT_PLANS } from '../../config/plans';
import { DEFAULT_CREDIT_PACKAGES } from '../../types/credits';
import { SaaSDataService } from '../../services/SaaSDataService';
import {
  CreditCard,
  CheckCircle,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Sparkles,
  Zap,
  Save,
  Loader2,
  Coins,
  RefreshCw,
  Star,
  Check,
} from 'lucide-react';

interface AdminPlansTabProps {
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminPlansTab: React.FC<AdminPlansTabProps> = ({ showToast }) => {
  const [plans, setPlans] = useState<Record<string, PlanConfig>>(DEFAULT_PLANS);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  // Credit Packages state
  const [creditPackages, setCreditPackages] = useState<CreditTopUpPackage[]>(DEFAULT_CREDIT_PACKAGES);
  const [savingPkgId, setSavingPkgId] = useState<string | null>(null);
  const [isAddingPkg, setIsAddingPkg] = useState(false);
  const [newPkg, setNewPkg] = useState<CreditTopUpPackage>({
    id: `pack_custom_${Date.now()}`,
    name: 'Custom Booster',
    credits: 500,
    bonusCredits: 100,
    price: 9.99,
    popular: false,
    currency: 'USD',
    stripePriceId: '',
  });

  useEffect(() => {
    const unsubPlans = SaaSDataService.subscribeToPlans((livePlans) => {
      if (livePlans && Object.keys(livePlans).length > 0) {
        setPlans(livePlans);
      }
    });

    const unsubPkgs = SaaSDataService.subscribeToCreditPackages((livePkgs) => {
      if (livePkgs && livePkgs.length > 0) {
        setCreditPackages(livePkgs);
      }
    });

    return () => {
      unsubPlans();
      unsubPkgs();
    };
  }, []);

  const handleUpdateField = (planKey: string, field: keyof PlanConfig, value: any) => {
    setPlans((prev) => ({
      ...prev,
      [planKey]: {
        ...prev[planKey],
        [field]: value,
      },
    }));
  };

  const handleSavePlan = async (planKey: string) => {
    const planToSave = plans[planKey];
    if (!planToSave) return;

    setSavingKey(planKey);
    try {
      const ok = await SaaSDataService.savePlan(planToSave);
      if (ok) {
        showToast(`Saved "${planToSave.name}" tier to Firestore!`, 'success');
      } else {
        showToast(`Failed to save plan "${planToSave.name}"`, 'error');
      }
    } catch {
      showToast('Error saving plan to Firestore', 'error');
    } finally {
      setSavingKey(null);
    }
  };

  // Credit Package Handlers
  const handleUpdatePkgField = (pkgId: string, field: keyof CreditTopUpPackage, value: any) => {
    setCreditPackages((prev) =>
      prev.map((p) => (p.id === pkgId ? { ...p, [field]: value } : p))
    );
  };

  const handleSavePackage = async (pkg: CreditTopUpPackage) => {
    setSavingPkgId(pkg.id);
    try {
      const ok = await SaaSDataService.saveCreditPackage(pkg);
      if (ok) {
        showToast(`Saved package "${pkg.name}" to Firestore!`, 'success');
      } else {
        showToast(`Failed to save package "${pkg.name}"`, 'error');
      }
    } catch {
      showToast('Error saving credit package to Firestore', 'error');
    } finally {
      setSavingPkgId(null);
    }
  };

  const handleDeletePackage = async (pkgId: string, pkgName: string) => {
    if (!window.confirm(`Are you sure you want to delete credit package "${pkgName}"?`)) return;
    try {
      const ok = await SaaSDataService.deleteCreditPackage(pkgId);
      if (ok) {
        setCreditPackages((prev) => prev.filter((p) => p.id !== pkgId));
        showToast(`Package "${pkgName}" deleted from Firestore.`, 'info');
      } else {
        showToast('Failed to delete package', 'error');
      }
    } catch {
      showToast('Error deleting credit package', 'error');
    }
  };

  const handleCreatePackage = async () => {
    if (!newPkg.name.trim() || newPkg.price <= 0 || newPkg.credits <= 0) {
      showToast('Please fill out valid package details', 'error');
      return;
    }
    const pkgToSave = {
      ...newPkg,
      id: newPkg.id.trim() || `pack_${Date.now()}`,
    };
    try {
      const ok = await SaaSDataService.saveCreditPackage(pkgToSave);
      if (ok) {
        showToast(`Package "${pkgToSave.name}" created in Firestore!`, 'success');
        setIsAddingPkg(false);
        setNewPkg({
          id: `pack_custom_${Date.now()}`,
          name: 'Power Pack',
          credits: 1000,
          bonusCredits: 250,
          price: 19.99,
          popular: false,
          currency: 'USD',
          stripePriceId: '',
        });
      } else {
        showToast('Failed to create package', 'error');
      }
    } catch {
      showToast('Error creating package', 'error');
    }
  };

  return (
    <div className="space-y-10">
      {/* 1. Subscription Plans Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>Subscription Tiers & Quotas</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                Live Firestore
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Configure real-time pricing, daily image allowances, and max file limits synced with Firestore.</p>
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
                    <span className="text-slate-500">Monthly Price ($):</span>
                    <NumberInput
                      value={plan.priceMonthly}
                      onChange={(v) => handleUpdateField(key, 'priceMonthly', v || 0)}
                      className="w-24"
                    />
                  </div>

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

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <button
                  onClick={() => handleUpdateField(key, 'adsEnabled', !plan.adsEnabled)}
                  className="w-full py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
                >
                  {plan.adsEnabled ? 'Disable Ads for Tier' : 'Enable Ads for Tier'}
                </button>
                <button
                  disabled={savingKey === key}
                  onClick={() => handleSavePlan(key)}
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {savingKey === key ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving to Firestore...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Plan to Firestore</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Dynamic Credit Top-Up Packages Section */}
      <div className="space-y-6 pt-6 border-t border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-500" />
              <span>Credit Top-Up Packages</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                Live Firestore
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage one-time credit top-up packages, bonus incentives, and pricing shown in the user Credit Center.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddingPkg(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Create New Package
          </Button>
        </div>

        {/* Create Modal / Form */}
        {isAddingPkg && (
          <div className="p-6 rounded-3xl border-2 border-dashed border-primary/40 bg-primary/5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>New Credit Package</span>
              </h4>
              <button
                onClick={() => setIsAddingPkg(false)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Package ID
                </label>
                <Input
                  value={newPkg.id}
                  onChange={(e) => setNewPkg({ ...newPkg, id: e.target.value })}
                  placeholder="pack_unique_id"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Package Name
                </label>
                <Input
                  value={newPkg.name}
                  onChange={(e) => setNewPkg({ ...newPkg, name: e.target.value })}
                  placeholder="e.g. Creator Booster"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Price ($ USD)
                </label>
                <NumberInput
                  value={newPkg.price}
                  onChange={(v) => setNewPkg({ ...newPkg, price: v || 0 })}
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Credits + Bonus
                </label>
                <div className="flex gap-2">
                  <NumberInput
                    value={newPkg.credits}
                    onChange={(v) => setNewPkg({ ...newPkg, credits: v || 0 })}
                    placeholder="Base"
                  />
                  <NumberInput
                    value={newPkg.bonusCredits}
                    onChange={(v) => setNewPkg({ ...newPkg, bonusCredits: v || 0 })}
                    placeholder="Bonus"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newPkg.popular}
                  onChange={(e) => setNewPkg({ ...newPkg, popular: e.target.checked })}
                  className="rounded text-primary focus:ring-primary h-4 w-4"
                />
                <span>Mark as "Most Popular" / Recommended</span>
              </label>

              <Button size="sm" onClick={handleCreatePackage} leftIcon={<Save className="w-3.5 h-3.5" />}>
                Save Package to Cloud
              </Button>
            </div>
          </div>
        )}

        {/* Existing Credit Packages Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {creditPackages.map((pkg) => {
            const isSaving = savingPkgId === pkg.id;
            return (
              <div
                key={pkg.id}
                className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleUpdatePkgField(pkg.id, 'popular', !pkg.popular)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors ${
                        pkg.popular
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      <Star className={`w-3 h-3 ${pkg.popular ? 'fill-amber-500' : ''}`} />
                      <span>{pkg.popular ? 'Featured Popular' : 'Standard Pack'}</span>
                    </button>

                    <button
                      onClick={() => handleDeletePackage(pkg.id, pkg.name)}
                      className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                      title="Delete Package"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Title
                    </label>
                    <Input
                      value={pkg.name}
                      onChange={(e) => handleUpdatePkgField(pkg.id, 'name', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Base Credits</span>
                      <NumberInput
                        value={pkg.credits}
                        onChange={(v) => handleUpdatePkgField(pkg.id, 'credits', v || 0)}
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Bonus</span>
                      <NumberInput
                        value={pkg.bonusCredits}
                        onChange={(v) => handleUpdatePkgField(pkg.id, 'bonusCredits', v || 0)}
                      />
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Price ($ USD)</span>
                    <NumberInput
                      value={pkg.price}
                      onChange={(v) => handleUpdatePkgField(pkg.id, 'price', v || 0)}
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    disabled={isSaving}
                    onClick={() => handleSavePackage(pkg)}
                    isLoading={isSaving}
                    leftIcon={<Save className="w-3.5 h-3.5" />}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
