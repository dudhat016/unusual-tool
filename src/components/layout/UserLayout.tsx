import {
  Bookmark,
  CreditCard,
  Crown,
  Heart,
  History,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
  Zap
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NavItem, Sidebar } from './Sidebar';
import { DarkModeToggle } from '../common/DarkModeToggle';

export interface UserLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: any) => void;
}

export const UserLayout: React.FC<UserLayoutProps> = ({
  children,
  activeTab,
  onTabChange,
}) => {
  const {
    user,
    userProfile,
    credits,
    activePlanConfig,
    history,
    favorites,
    presets,
    isAdmin,
    navigate,
    logout,
  } = useApp();

  const [collapsed, setCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const creditBalance = typeof credits === 'number' ? credits : Math.max(0, (credits?.total ?? 0) - (credits?.used ?? 0));

  const userNavItems: NavItem[] = [
    { sectionTitle: 'MY WORKSPACE' },
    {
      label: 'Overview',
      path: '/dashboard',
      icon: TrendingUp,
      exact: true,
    },
    {
      label: 'AI Usage Stats',
      path: '/dashboard/usage',
      icon: Zap,
      exact: true,
    },
    {
      label: 'Processing History',
      path: '/dashboard/history',
      icon: History,
      badge: history?.length > 0 ? history.length : undefined,
      exact: true,
    },

    { sectionTitle: 'SAVED & FAVORITES' },
    {
      label: 'Favorite Tools',
      path: '/dashboard/favorites',
      icon: Heart,
      badge: favorites?.length > 0 ? favorites.length : undefined,
      exact: true,
    },
    {
      label: 'Saved Tool Presets',
      path: '/dashboard/presets',
      icon: Bookmark,
      badge: presets?.length > 0 ? presets.length : undefined,
      exact: true,
    },

    { sectionTitle: 'ACCOUNT & BILLING' },
    {
      label: 'Account & Settings',
      icon: User,
      children: [
        {
          label: 'Subscription & Plans',
          path: '/dashboard/subscription',
          icon: Crown,
          exact: true,
        },
        {
          label: 'AI Credits & Ledger',
          path: '/dashboard/credits',
          icon: Sparkles,
          badge: `${creditBalance} AI`,
          badgeVariant: creditBalance > 20 ? 'primary' : 'warning',
          exact: true,
        },
        {
          label: 'Billing & Invoices',
          path: '/dashboard/billing',
          icon: CreditCard,
          exact: true,
        },
        {
          label: 'Profile Settings',
          path: '/dashboard/settings',
          icon: Settings,
          exact: true,
        },
        {
          label: 'Privacy & Data Retention',
          path: '/dashboard/privacy',
          icon: ShieldCheck,
          exact: true,
        },
      ],
    },
  ];

  if (isAdmin) {
    userNavItems.push(
      { divider: true },
      {
        label: 'Admin Operations Console',
        path: '/admin',
        icon: ShieldCheck,
        badge: 'Admin',
        badgeVariant: 'danger',
      }
    );
  }

  const handleNavClick = (path: string) => {
    navigate(path);
  };

  const currentRoutePath =
    typeof window !== 'undefined'
      ? window.location.pathname + window.location.search
      : activeTab === 'overview'
      ? '/dashboard'
      : `/dashboard/${activeTab}`;

  const userFooterWidget = (
    <div className="space-y-3">
      {/* Credit Balance Meter Card */}
      <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
        <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white mb-1.5">
          <span className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-primary fill-primary" />
            AI Credits
          </span>
          <span className="text-primary font-extrabold">{creditBalance} left</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-primary h-full rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(5, (creditBalance / 100) * 100))}%` }}
          />
        </div>
      </div>

      {/* Logout Row */}
      <button
        onClick={logout}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        {!collapsed && <span>Sign Out Account</span>}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block sticky top-0 h-screen shrink-0 z-30">
        <Sidebar
          items={userNavItems}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((v) => !v)}
          bottomSection={userFooterWidget}
          onNavigate={handleNavClick}
          currentPath={currentRoutePath}
        />
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-[70] lg:hidden shadow-2xl"
            >
              <Sidebar
                items={userNavItems}
                isMobile
                onClose={() => setIsMobileOpen(false)}
                bottomSection={userFooterWidget}
                onNavigate={handleNavClick}
                currentPath={currentRoutePath}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header Navbar */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <User className="w-4 h-4 text-primary" />
              <span className="font-semibold">User Dashboard</span>
              <span>/</span>
              <span className="font-bold text-slate-900 dark:text-white capitalize">
                {activeTab}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Global Dark Mode Toggle */}
            <DarkModeToggle id="user-layout-dark-mode-toggle" size="sm" />

            {/* Plan Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
              <Crown className="w-3.5 h-3.5" />
              <span>{activePlanConfig?.name || 'Free Tier'}</span>
            </div>

            {/* Upgrade Button */}
            <button
              onClick={() => onTabChange('subscription')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-sm transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 fill-primary-foreground" />
              <span>Upgrade Plan</span>
            </button>
          </div>
        </header>

        {/* Inner Page View */}
        <main className="flex-1 w-full max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">{children}</main>
      </div>
    </div>
  );
};
