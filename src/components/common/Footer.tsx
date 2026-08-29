import React from 'react';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../i18n';
import { Sparkles, Shield, Lock, Zap, Sliders } from 'lucide-react';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import { TOOLS_REGISTRY } from '../../config/tools';

export const Footer: React.FC = () => {
  const { navigate } = useApp();
  const { t } = useTranslation();

  const popularTools = TOOLS_REGISTRY.filter((t) => t.isPopular).slice(0, 6);

  return (
    <footer className="border-t border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 mt-20 transition-colors">
      {/* Privacy & Trust Banner */}
      <div className="border-b border-slate-200/80 bg-purple-50/50 py-6 dark:border-slate-800/80 dark:bg-purple-950/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left rtl:sm:text-right">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white shadow-sm">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                  {t('common.privacyBadge')}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('common.freeClientSide')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-emerald-500" /> 100% Client-Side
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-amber-500" /> WebAssembly Speed
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="col-span-2 sm:col-span-1 md:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                Aether<span className="text-purple-600 dark:text-purple-400">Pix</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              {t('common.tagline')}
            </p>
            <div className="pt-2">
              <LanguageSwitcher variant="dropdown" />
            </div>
            <div className="pt-1 text-[11px] text-slate-400">
              {t('common.copyright')}
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              {t('navigation.categories')}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigate('/image-compressor-tools')} className="text-slate-600 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 text-left rtl:text-right">
                  Image Compressor Hub
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/image-converter-tools')} className="text-slate-600 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 text-left rtl:text-right">
                  Image Converter Hub
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/image-resizer-tools')} className="text-slate-600 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 text-left rtl:text-right">
                  Image Resizer Hub
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/youtube-tools')} className="text-slate-600 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 text-left rtl:text-right">
                  YouTube Creator Suite
                </button>
              </li>
            </ul>
          </div>

          {/* Popular Tools */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              {t('common.popularConverters')}
            </h4>
            <ul className="space-y-2 text-xs">
              {popularTools.map((t) => (
                <li key={t.id}>
                  <button
                    onClick={() => navigate(t.route)}
                    className="text-slate-600 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 transition-colors text-left rtl:text-right"
                  >
                    {t.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Guides & Educational */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              {t('navigation.guides')}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigate('/guides/webp-vs-jpeg-vs-png-guide')} className="text-slate-600 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 text-left rtl:text-right">
                  WebP vs JPEG vs PNG
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/guides/official-passport-photo-requirements-guide')} className="text-slate-600 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 text-left rtl:text-right">
                  Passport Photo Specs
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/guides/how-to-compress-images-without-losing-quality')} className="text-slate-600 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 text-left rtl:text-right">
                  Lossless Compression Guide
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/guides/svg-vector-vs-raster-explained')} className="text-slate-600 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 text-left rtl:text-right">
                  Vector vs Raster
                </button>
              </li>
            </ul>
          </div>

          {/* Platform & Trust */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              {t('common.termsOfService')} & {t('common.privacyPolicy')}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigate('/about')} className="text-slate-600 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 text-left rtl:text-right">
                  {t('common.aboutUs')}
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/privacy')} className="text-slate-600 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 text-left rtl:text-right">
                  {t('common.privacyPolicy')}
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/terms')} className="text-slate-600 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 text-left rtl:text-right">
                  {t('common.termsOfService')}
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/contact')} className="text-slate-600 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 text-left rtl:text-right">
                  {t('common.contactUs')}
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/ui-kit')} className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-semibold flex items-center gap-1">
                  <Sliders className="h-3 w-3" />
                  <span>UI Design System Kit</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};
