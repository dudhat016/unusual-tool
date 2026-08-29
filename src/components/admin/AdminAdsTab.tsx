import React, { useState } from 'react';
import { AdSlotConfig } from '../../types/ads';
import { DEFAULT_AD_SLOTS } from '../../config/adSlots';
import {
  Sparkles,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  DollarSign,
  Smartphone,
  Monitor,
} from 'lucide-react';

interface AdminAdsTabProps {
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminAdsTab: React.FC<AdminAdsTabProps> = ({ showToast }) => {
  const [adSlots, setAdSlots] = useState<AdSlotConfig[]>(DEFAULT_AD_SLOTS);

  const handleToggleSlot = (slotId: string) => {
    setAdSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, enabled: !s.enabled } : s))
    );
    showToast(`Toggled ad slot ${slotId}`, 'success');
  };

  const handleUpdateDevice = (slotId: string, dev: 'all' | 'desktop' | 'mobile') => {
    setAdSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, device: dev } : s))
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Ad Monetization & Placements</h3>
        <p className="text-xs text-slate-500">
          Manage non-intrusive ad banners, placement frequency, and device targeting across tools.
        </p>
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
                        ? 'bg-indigo-600 text-white'
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
