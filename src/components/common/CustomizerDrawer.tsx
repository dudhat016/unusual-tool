import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Palette,
  X,
  Sun,
  Moon,
  Check,
  RotateCcw,
  Sparkles,
  Sliders,
  ChevronRight,
  ChevronLeft,
  Globe,
} from 'lucide-react';

export const PRIMARY_COLOR_PRESETS = [
  { id: 'purple', label: 'Royal Purple', value: '258 90% 56%', darkValue: '258 78% 63%', hex: '#8B5CF6' },
  { id: 'indigo', label: 'Deep Indigo', value: '238 84% 59%', darkValue: '238 84% 65%', hex: '#6366F1' },
  { id: 'emerald', label: 'Emerald Green', value: '158 64% 45%', darkValue: '158 64% 52%', hex: '#10B981' },
  { id: 'rose', label: 'Vibrant Rose', value: '346 84% 61%', darkValue: '346 84% 65%', hex: '#F43F5E' },
  { id: 'amber', label: 'Amber Gold', value: '38 92% 50%', darkValue: '38 92% 55%', hex: '#F59E0B' },
  { id: 'cyan', label: 'Ocean Cyan', value: '199 89% 48%', darkValue: '199 89% 55%', hex: '#06B6D4' },
];

export const RADIUS_PRESETS = [0, 4, 8, 12, 16];

export const CustomizerDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    theme,
    setTheme,
    primaryColor,
    setPrimaryColor,
    radius,
    setRadius,
    sidebarTheme,
    setSidebarTheme,
    resetThemeConfig,
  } = useApp();

  const [customHex, setCustomHex] = useState('');

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        id="theme-customizer-trigger"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xl shadow-primary/40 hover:scale-110 active:scale-95 transition-all cursor-pointer group"
        title="Open Theme Customizer & Design Options"
        aria-label="Theme Customizer"
      >
        <Palette className="h-5 w-5 group-hover:rotate-45 transition-transform" />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
        </span>
      </button>

      {/* Slide-over Backdrop & Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
              
              {/* Drawer Header */}
              <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                      Theme Customizer
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Real-time HSL palette, radius & layout engine
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* 1. Appearance Mode */}
                <div className="space-y-3">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    Appearance Mode
                  </span>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => setTheme('light')}
                      className={`flex items-center justify-center gap-2 py-3 rounded-2xl border-2 text-xs font-bold transition-all cursor-pointer ${
                        theme === 'light'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-primary'
                      }`}
                    >
                      <Sun className="w-4 h-4 text-amber-500" />
                      <span>Light Mode</span>
                    </button>

                    <button
                      onClick={() => setTheme('dark')}
                      className={`flex items-center justify-center gap-2 py-3 rounded-2xl border-2 text-xs font-bold transition-all cursor-pointer ${
                        theme === 'dark'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-primary'
                      }`}
                    >
                      <Moon className="w-4 h-4 text-indigo-400" />
                      <span>Obsidian Dark</span>
                    </button>
                  </div>
                </div>

                {/* 2. Primary Color Theme */}
                <div className="space-y-3">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    Primary Brand Color
                  </span>
                  <div className="grid grid-cols-3 gap-2.5">
                    {PRIMARY_COLOR_PRESETS.map((preset) => {
                      const isActive = primaryColor === preset.id;
                      return (
                        <button
                          key={preset.id}
                          onClick={() => setPrimaryColor(preset.id)}
                          className={`flex items-center gap-2 p-2.5 rounded-2xl border-2 text-xs font-bold transition-all cursor-pointer ${
                            isActive
                              ? 'border-primary bg-primary/10 text-slate-900 dark:text-white'
                              : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                          }`}
                        >
                          <span
                            className="w-4 h-4 rounded-full shrink-0 shadow-xs flex items-center justify-center text-white"
                            style={{ backgroundColor: preset.hex }}
                          >
                            {isActive && <Check className="w-2.5 h-2.5" />}
                          </span>
                          <span className="truncate">{preset.id}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Border Radius Control */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                      Border Radius ({radius}px)
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {RADIUS_PRESETS.map((r) => (
                      <button
                        key={r}
                        onClick={() => setRadius(r)}
                        className={`flex-1 h-10 border-2 font-mono font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                          radius === r
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-primary'
                        }`}
                        style={{ borderRadius: `${r}px` }}
                      >
                        {r}px
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Sidebar Theme */}
                <div className="space-y-3">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    Sidebar Navigation Styling
                  </span>
                  <div className="grid grid-cols-2 gap-2.5">
                    {(['default', 'dark', 'light', 'gradient'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => setSidebarTheme(st)}
                        className={`py-2.5 rounded-xl border-2 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                          sidebarTheme === st
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-primary'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Drawer Footer Reset */}
              <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                <button
                  onClick={resetThemeConfig}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:border-rose-500 hover:text-rose-500 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Defaults</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
};
