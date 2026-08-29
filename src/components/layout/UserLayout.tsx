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
      path: '/dashboard?tab=overview',
      icon: TrendingUp,
      exact: true,
    },
    {
      label: 'AI Usage Stats',
      path: '/dashboard?tab=usage',
      icon: Zap,
    },
    {
      label: 'Credits Ledger',
      path: '/dashboard?tab=credits',
      icon: CreditCard,
      badge: `${creditBalance} AI`,
      badgeVariant: creditBalance > 20 ? 'primary' : 'warning',
    },
    {
      label: 'Processing History',
      path: '/dashboard?tab=history',
      icon: History,
      badge: history?.length > 0 ? history.length : undefined,
    },

    { sectionTitle: 'SAVED & FAVORITES' },
    {
      label: 'Favorite Tools',
      path: '/dashboard?tab=favorites',
      icon: Heart,
      badge: favorites?.length > 0 ? favorites.length : undefined,
    },
    {
      label: 'Saved Tool Presets',
      path: '/dashboard?tab=presets',
      icon: Bookmark,
      badge: presets?.length > 0 ? presets.length : undefined,
    },

    { sectionTitle: 'ACCOUNT & BILLING' },
    {
      label: 'Subscription Plan',
      path: '/dashboard?tab=subscription',
      icon: Crown,
    },
    {
      label: 'Account Settings',
      path: '/dashboard?tab=settings',
      icon: Settings,
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
    if (path.includes('tab=')) {
      const tabParam = path.split('tab=')[1];
      onTabChange(tabParam);
    } else {
      navigate(path);
    }
  };

  const userFooterWidget = (
    <div className="space-y-3">
      {/* Credit Balance Meter Card */}
      <div className="p-3 rounded-xl bg-purple-500/10 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/40">
        <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white mb-1.5">
          <span className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 fill-purple-600" />
            AI Credits
          </span>
          <span className="text-purple-600 dark:text-purple-400 font-extrabold">{creditBalance} left</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-purple-600 to-indigo-500 h-full rounded-full transition-all duration-300"
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
      <div className="hidden lg:block">
        <Sidebar
          items={userNavItems}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((v) => !v)}
          bottomSection={userFooterWidget}
          onNavigate={handleNavClick}
          currentPath={`/dashboard?tab=${activeTab}`}
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
                currentPath={`/dashboard?tab=${activeTab}`}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Header Navbar */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="font-semibold">User Dashboard</span>
              <span>/</span>
              <span className="font-bold text-slate-900 dark:text-white capitalize">
                {activeTab}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Plan Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-200 dark:border-purple-800/40 text-purple-700 dark:text-purple-300 text-xs font-bold">
              <Crown className="w-3.5 h-3.5" />
              <span>{activePlanConfig?.name || 'Free Tier'}</span>
            </div>

            {/* Upgrade Button */}
            <button
              onClick={() => onTabChange('subscription')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-sm transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 fill-white" />
              <span>Upgrade Plan</span>
            </button>
          </div>
        </header>

        {/* Inner Page View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-fade-in">{children}</main>
      </div>
    </div>
  );
};
