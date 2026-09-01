import React, { useState, useEffect } from 'react';
import { AdSlotConfig } from '../../types/ads';
import { DEFAULT_AD_SLOTS } from '../../config/adSlots';
import { SaaSDataService } from '../../services/SaaSDataService';
import { Button } from '../ui/Button';
import {
  Sparkles,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  DollarSign,
  Smartphone,
  Monitor,
  RefreshCw,
} from 'lucide-react';

interface AdminAdsTabProps {
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminAdsTab: React.FC<AdminAdsTabProps> = ({ showToast }) => {
  const [adSlots, setAdSlots] = useState<AdSlotConfig[]>(DEFAULT_AD_SLOTS);
  const [isSyncing, setIsSyncing] = useState(false);

  // Live Firestore subscription
  useEffect(() => {
    const unsub = SaaSDataService.subscribeToAdSlots((liveSlots) => {
      setAdSlots(liveSlots);
    });
    return unsub;
  }, []);

  const handleToggleSlot = async (slotId: string) => {
    const slot = adSlots.find((s) => s.id === slotId);
    if (!slot) return;

    const updated: AdSlotConfig = {
      ...slot,
      enabled: !slot.enabled,
    };

    setAdSlots((prev) =>
      prev.map((s) => (s.id === slotId ? updated : s))
    );

    const ok = await SaaSDataService.updateAdSlot(updated);
    if (ok) {
      showToast(`Ad slot ${slotId} is now ${updated.enabled ? 'Enabled' : 'Disabled'} in Firestore`, 'success');
    } else {
      showToast(`Failed to update ad slot ${slotId} in Firestore`, 'error');
    }
  };

  const handleUpdateDevice = async (slotId: string, dev: 'all' | 'desktop' | 'mobile') => {
    const slot = adSlots.find((s) => s.id === slotId);
    if (!slot) return;

    const updated: AdSlotConfig = {
      ...slot,
      device: dev,
    };

    setAdSlots((prev) =>
      prev.map((s) => (s.id === slotId ? updated : s))
    );

    const ok = await SaaSDataService.updateAdSlot(updated);
    if (ok) {
      showToast(`Ad slot ${slotId} target set to ${dev}`, 'success');
    } else {
      showToast(`Failed to update device target for ${slotId}`, 'error');
    }
  };

  const handleSeedDefaults = async () => {
    setIsSyncing(true);
    try {
      await SaaSDataService.seedAdSlotsIfEmpty();
      showToast('Ad slots synchronized with Firestore!', 'success');
    } catch {
      showToast('Failed to synchronize ad slots', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Ad Monetization & Placements</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
              Live Firestore Sync
            </span>
          </h3>
          <p className="text-xs text-slate-500">
            Manage non-intrusive ad banners, placement frequency, and device targeting across tools dynamically.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleSeedDefaults}
          isLoading={isSyncing}
          leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
        >
          Sync Firestore
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {adSlots.map((slot) => (
          <div
            key={slot.id}
            className={`rounded-3xl border p-5 space-y-4 transition-all ${
              slot.enabled
                ? 'border-indigo-200 dark:border-indigo-900/60 bg-white dark:bg-slate-900'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">{slot.placement}</span>
              <button
                onClick={() => handleToggleSlot(slot.id)}
                className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                  slot.enabled
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {slot.enabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">{slot.name}</h4>
              <p className="text-[11px] text-slate-500 mt-1">Format: {slot.format} • Est. CPM: ${slot.estimatedCpm}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">Device Target:</span>
              <div className="flex items-center gap-1">
                {(['all', 'desktop', 'mobile'] as const).map((dev) => (
                  <button
                    key={dev}
                    onClick={() => handleUpdateDevice(slot.id, dev)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold capitalize ${
                      slot.device === dev
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {dev}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Compliance Guidelines */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850/50 p-5 text-xs text-slate-600 dark:text-slate-400 space-y-2">
        <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Google AdSense & Webmaster Compliance Rules</span>
        </h4>
        <ul className="list-disc pl-5 space-y-1 text-[11px]">
          <li>Ads are strictly separated from user action buttons (Upload, Process, Download) to prevent deceptive clicks.</li>
          <li>All ad blocks are clearly labeled with &quot;ADVERTISEMENT&quot; tags.</li>
          <li>Paid tiers (Pro, Business) receive an automated zero-ad clean studio layout.</li>
        </ul>
      </div>
    </div>
  );
};
