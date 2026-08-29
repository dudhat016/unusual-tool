import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AdSlotPlacement } from '../../types/ads';
import { Sparkles, ExternalLink, ShieldCheck, Zap } from 'lucide-react';

interface AdSlotProps {
  placement: AdSlotPlacement;
  toolId?: string;
  className?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({ placement, toolId, className = '' }) => {
  const { userProfile, activePlanConfig, navigate, openAuthModal } = useApp();
  const [isDismissed, setIsDismissed] = useState(false);

  // Suppress ads if plan has ads disabled or user is Pro/Business
  const isAdFree = !activePlanConfig.adsEnabled || userProfile?.plan === 'pro' || userProfile?.plan === 'business';

  if (isAdFree || isDismissed) {
    return null;
  }

  // Format classes & layout based on placement
  const isSidebar = placement === 'ad_sidebar';
  const isLeaderboard = placement === 'ad_top' || placement === 'ad_footer';

  return (
    <div
      data-ad-slot={placement}
      data-tool-id={toolId || 'general'}
      className={`relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-r from-slate-50 via-slate-100/60 to-slate-50 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 p-4 transition-all my-4 shadow-2xs ${
        isSidebar ? 'min-h-[280px] flex flex-col justify-between' : isLeaderboard ? 'min-h-[90px]' : 'min-h-[110px]'
      } ${className}`}
    >
      {/* Subtle Ad Badge & Upgrade Link */}
      <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/80 pb-2 mb-3 text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-wider uppercase">
        <div className="flex items-center gap-1.5">
          <span className="bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded-xs font-bold text-[9px]">
            ADVERTISEMENT
          </span>
          <span>Google Certified Partner</span>
        </div>

        <button
          type="button"
          onClick={() => navigate('/pricing')}
          className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
        >
          <Sparkles className="h-3 w-3" />
          <span>Remove ads with Pro</span>
        </button>
      </div>

      {/* Ad Banner Content */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-1">
        <div className="flex items-center gap-3.5">
          <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-xs">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>AetherPix Cloud Pro for Teams & High-Volume Creators</span>
              <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-md font-extrabold">
                Sponsored
              </span>
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 max-w-xl">
              Process up to 500 images at once, unlock 20-step automated multi-tool pipelines, and enjoy 100% ad-free super-resolution editing.
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <button
            onClick={() => navigate('/pricing')}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer"
          >
            <span>Explore Plans</span>
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
