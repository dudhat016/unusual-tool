import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../i18n';
import {
  Sparkles,
  Search,
  History,
  Moon,
  Sun,
  Menu,
  X,
  Zap,
  ArrowRight,
  User,
  ShieldAlert,
  Sliders,
} from 'lucide-react';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import { DynamicCategoryService } from '../../services/DynamicCategoryService';
import { DarkModeToggle } from './DarkModeToggle';

import { Link } from './Link';

export const Header: React.FC = () => {
  const {
    currentPath,
    navigate,
    credits,
    user,
    userProfile,
    openAuthModal,
    isAdmin,
    setIsSearchOpen,
    theme,
    toggleTheme,
  } = useApp();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dynamicCategories, setDynamicCategories] = useState(() => DynamicCategoryService.getAllCategories());

  useEffect(() => {
    const unsub = DynamicCategoryService.subscribe((cats) => {
      setDynamicCategories(cats);
    });
    return unsub;
  }, []);

  const navLinks: { label: string; path: string; badge?: string }[] = [
    { label: t('navigation.allTools'), path: '/tools' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90 transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-6 lg:gap-8">
          <Link
            id="brand-logo-button"
            href="/"
            className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Aether<span className="text-primary">Pix</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                Studio
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = currentPath === link.path;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`relative px-3 py-1.5 text-sm font-medium rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'text-primary bg-primary/10 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  {link.label}
                  {link.badge && (
                    <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-primary text-primary-foreground leading-tight">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Quick Search Button */}
          <button
            id="header-search-btn"
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs text-slate-500 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400 dark:hover:bg-slate-800 transition-all shadow-xs cursor-pointer"
            aria-label={t('common.quickSearch')}
          >
            <Search className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden sm:inline">{t('common.quickSearch')}</span>
            <kbd className="hidden sm:inline-flex items-center rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 dark:border-slate-700 dark:bg-slate-800">
              ⌘K
            </kbd>
          </button>

          {/* Language Switcher */}
          <LanguageSwitcher variant="compact" />

          {/* Credits Badge */}
          <button
            onClick={() => navigate('/dashboard/credits')}
            className="hidden lg:flex items-center gap-1.5 rounded-xl border border-amber-200/80 bg-amber-50/80 px-2.5 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-100 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300 transition-colors cursor-pointer"
            title="Available AI Credits & Ledger"
          >
            <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
            <span className="font-mono">{userProfile ? userProfile.credits : credits.total - credits.used} {t('common.credits')}</span>
          </button>

          {/* Admin link if administrator */}
          {isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              className="p-2 rounded-xl border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
              title={t('navigation.admin')}
            >
              <ShieldAlert className="h-4 w-4" />
            </button>
          )}

          {/* User Profile / Dashboard or Sign In button */}
          {user ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              {(userProfile?.photoURL || userProfile?.avatar || user.photoURL) ? (
                <img
                  src={userProfile?.photoURL || userProfile?.avatar || user.photoURL || ''}
                  alt="Profile"
                  className="h-6 w-6 rounded-lg object-cover"
                />
              ) : (
                <div className="h-6 w-6 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  {((userProfile?.displayName || user.displayName || user.email || 'U')[0]).toUpperCase()}
                </div>
              )}
              <span className="hidden sm:inline-block max-w-[100px] truncate">
                {userProfile?.displayName || user.displayName || user.email?.split('@')[0]}
              </span>
            </button>
          ) : (
            <button
              onClick={() => openAuthModal('signin')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <User className="h-3.5 w-3.5" />
              <span>{t('buttons.signIn')}</span>
            </button>
          )}

          {/* Global Dark Mode Toggle */}
          <DarkModeToggle id="header-dark-mode-toggle" size="md" />

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-400"
            aria-label="Open navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 px-4 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-2 pb-2">
            <button
              onClick={() => {
                navigate('/dashboard/credits');
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-semibold"
            >
              <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
              {userProfile ? userProfile.credits : credits.total - credits.used} {t('common.credits')}
            </button>
            <button
              onClick={() => {
                navigate('/dashboard');
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-medium"
            >
              <History className="h-4 w-4" />
              {t('navigation.dashboard')}
            </button>
          </div>

          <div className="space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => {
                  navigate(link.path);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left rtl:text-right px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900 flex items-center justify-between"
              >
                <span>{link.label}</span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 rtl:rotate-180" />
              </button>
            ))}
            <button
              onClick={() => {
                navigate('/ui-kit');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left rtl:text-right px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900 flex items-center justify-between"
            >
              <span>{t('navigation.uiKit')}</span>
              <Sliders className="h-3.5 w-3.5 text-slate-400" />
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{t('navigation.categories')}</p>
            <div className="grid grid-cols-2 gap-1.5">
              {dynamicCategories.slice(0, 6).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    navigate(`/tools?cat=${cat.id}`);
                    setMobileMenuOpen(false);
                  }}
                  className="text-left rtl:text-right text-xs py-1.5 px-2 rounded text-slate-600 hover:text-blue-600 dark:text-slate-400"
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
