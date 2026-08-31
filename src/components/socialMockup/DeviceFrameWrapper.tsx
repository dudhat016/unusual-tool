import React from 'react';
import { SceneState } from '../../types/socialMockup';
import { Wifi, Signal, Battery } from 'lucide-react';

interface DeviceFrameWrapperProps {
  sceneState: SceneState;
  exportRef?: React.Ref<HTMLDivElement>;
  children: React.ReactNode;
}

export const DeviceFrameWrapper: React.FC<DeviceFrameWrapperProps> = ({ sceneState, exportRef, children }) => {
  const { deviceFrame, background, showWatermark, watermarkText } = sceneState;

  // Background Styling
  let bgStyle: React.CSSProperties = {};
  let bgClassName = 'w-full h-full p-4 sm:p-8 flex items-center justify-center relative overflow-hidden transition-all duration-300';

  if (background.type === 'solid') {
    bgStyle = { backgroundColor: background.color || '#0f172a' };
  } else if (background.type === 'gradient') {
    bgClassName += ` bg-gradient-to-br ${background.gradient || 'from-purple-900 via-slate-900 to-indigo-950'}`;
  } else if (background.type === 'transparent') {
    bgClassName += ' bg-transparent';
  }

  return (
    <div className={bgClassName} style={bgStyle}>
      {/* Blurred background image layer if enabled */}
      {background.type === 'blur' && background.imageUrl && (
        <div className="absolute inset-0 z-0">
          <img src={background.imageUrl} alt="Blur background" className="w-full h-full object-cover blur-2xl opacity-40 scale-110" />
        </div>
      )}

      {/* Main Content Area (Isolated Mockup Export Target) */}
      <div ref={exportRef} className="relative z-10 w-full flex items-center justify-center max-w-full">
        {deviceFrame === 'iphone' && (
          <div className="w-full max-w-[360px] sm:max-w-[380px] rounded-[48px] bg-slate-950 p-3 shadow-2xl border-[4px] border-slate-800 ring-1 ring-white/10 overflow-hidden relative">
            {/* Dynamic Island Notch */}
            <div className="w-24 h-5 rounded-full bg-black mx-auto z-30 relative flex items-center justify-center mb-1">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
            </div>

            {/* iOS Status Bar */}
            <div className="px-5 py-1 flex items-center justify-between text-white text-[11px] font-bold tracking-tight">
              <span>{sceneState.deviceHeader?.time || '09:41'}</span>
              <div className="flex items-center gap-1.5">
                <Signal className="w-3.5 h-3.5" />
                <Wifi className="w-3.5 h-3.5" />
                <div className="flex items-center gap-0.5">
                  <span className="text-[9px] font-extrabold">{sceneState.deviceHeader?.batteryLevel ?? 94}%</span>
                  <Battery className="w-4 h-4 fill-white" />
                </div>
              </div>
            </div>

            {/* Inner Screen View */}
            <div className="w-full h-[620px] rounded-[36px] overflow-hidden bg-white dark:bg-black relative flex flex-col">
              {children}
            </div>

            {/* iOS Bottom Home Bar */}
            <div className="w-32 h-1 rounded-full bg-white/40 mx-auto mt-2 mb-0.5" />
          </div>
        )}

        {deviceFrame === 'browser' && (
          <div className="w-full max-w-2xl rounded-xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
            {/* Browser Bar */}
            <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
              </div>
              <div className="flex-1 max-w-md mx-auto px-4 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400 font-mono truncate text-center">
                https://aetherpix.studio/social-mockup
              </div>
            </div>
            <div className="p-4 sm:p-6 bg-slate-950 flex justify-center">
              {children}
            </div>
          </div>
        )}

        {(deviceFrame === 'none' || deviceFrame === 'glass' || deviceFrame === 'android') && (
          <div className={`w-full flex justify-center ${deviceFrame === 'glass' ? 'p-6 rounded-3xl bg-white/10 dark:bg-black/40 backdrop-blur-xl border border-white/20 shadow-2xl' : ''}`}>
            {children}
          </div>
        )}
      </div>

      {/* Watermark Notice Overlay */}
      {showWatermark && (
        <div className="absolute bottom-3 right-4 z-40 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-white/80 text-[10px] font-bold uppercase tracking-widest pointer-events-none">
          {watermarkText || 'FICTIONAL MOCKUP'}
        </div>
      )}
    </div>
  );
};
