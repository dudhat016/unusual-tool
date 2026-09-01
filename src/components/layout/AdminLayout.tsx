import {
  Activity,
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  CreditCard,
  Eye,
  FileText,
  Flag,
  Globe,
  Layers,
  Menu,
  Palette,
  Radio,
  Search,
  Settings,
  Shield,
  ShieldAlert,
  Users,
  Wrench,
  Zap
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Input } from '../ui/Input';
import { NavItem, Sidebar } from './Sidebar';
import { DarkModeToggle } from '../common/DarkModeToggle';

export interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: any) => void;
  userCount?: number;
  errorLogCount?: number;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  activeTab,
  onTabChange,
  userCount = 0,
  errorLogCount = 0,
}) => {
  const { navigate, user, userProfile } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Keyboard shortcut for Cmd+K search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const adminNavItems: NavItem[] = [
    { sectionTitle: 'OPERATIONS CONSOLE' },
    {
      label: 'Overview & Telemetry',
      path: '/admin',
      icon: Activity,
      exact: true,
    },
    {
      label: 'Tool Usage Analytics',
      path: '/admin/analytics',
      icon: BarChart3,
      exact: true,
    },
    {
      label: 'User Management',
      path: '/admin/users',
      icon: Users,
      badge: userCount > 0 ? userCount : undefined,
      exact: true,
    },

    { sectionTitle: 'PLATFORM MANAGEMENT' },
    {
      label: 'System Configuration',
      icon: Settings,
      children: [
        {
          label: 'General & Branding',
          path: '/admin/settings?section=general',
          icon: Globe,
          exact: true,
        },
        {
          label: 'Theme & Accent Colors',
          path: '/admin/settings?section=theme',
          icon: Palette,
          exact: true,
        },
        {
          label: 'Maintenance Mode',
          path: '/admin/settings?section=maintenance',
          icon: Wrench,
          exact: true,
        },
        {
          label: 'Rate Limits & Quotas',
          path: '/admin/settings?section=traffic',
          icon: Zap,
          exact: true,
        },
        {
          label: 'Emergency Killswitches',
          path: '/admin/settings?section=emergency',
          icon: ShieldAlert,
          exact: true,
        },
        {
          label: 'Monetization & Analytics',
          path: '/admin/settings?section=monetization',
          icon: Activity,
          exact: true,
        },
        {
          label: 'Live Visitor Preview',
          path: '/admin/settings?section=preview',
          icon: Eye,
          exact: true,
        },
      ],
    },
    {
      label: 'Catalog & Content',
      icon: Layers,
      children: [
        {
          label: 'Tool Catalog Config',
          path: '/admin/tools',
          icon: Layers,
          exact: true,
        },
        {
          label: 'Blog & Article CMS',
          path: '/admin/blogs',
          icon: FileText,
          exact: true,
        },
        {
          label: 'Plans & Pricing Tiers',
          path: '/admin/plans',
          icon: CreditCard,
          exact: true,
        },
      ],
    },
    {
      label: 'Traffic & Monetization',
      icon: Zap,
      children: [
        {
          label: 'Ad Network Settings',
          path: '/admin/ads',
          icon: Radio,
          exact: true,
        },
        {
          label: 'Traffic & Rate Limits',
          path: '/admin/traffic',
          icon: Zap,
          exact: true,
        },
        {
          label: 'Feature Flags & Toggles',
          path: '/admin/flags',
          icon: Flag,
          exact: true,
        },
        {
          label: 'i18n & Translations',
          path: '/admin/translations',
          icon: Globe,
          exact: true,
        },
      ],
    },
    {
      label: 'System & Diagnostics',
      icon: Shield,
      children: [
        {
          label: 'SEO Diagnostic Dashboard',
          path: '/admin/seo',
          icon: Globe,
          exact: true,
        },
        {
          label: 'UI Kit & Design System',
          path: '/admin/ui-kit',
          icon: Palette,
          exact: true,
        },
        {
          label: 'Audit & Error Logs',
          path: '/admin/audit',
          icon: ShieldAlert,
          badge: errorLogCount > 0 ? errorLogCount : undefined,
          badgeVariant: 'danger',
          exact: true,
        },
      ],
    },
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
  };

  const currentRoutePath =
    typeof window !== 'undefined'
      ? window.location.pathname + window.location.search
      : activeTab === 'overview'
      ? '/admin'
      : `/admin/${activeTab}`;

  const adminFooterWidget = (
    <div className="flex items-center gap-3 px-2 py-1.5">
      <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs shrink-0">
        {userProfile?.displayName?.charAt(0) || user?.email?.charAt(0) || 'A'}
      </div>
      {!collapsed && (
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-bold truncate text-slate-900 dark:text-slate-100">
            {userProfile?.displayName || 'Admin Console'}
          </span>
          <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active Session
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block sticky top-0 h-screen shrink-0 z-30">
        <Sidebar
          items={adminNavItems}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((v) => !v)}
          bottomSection={adminFooterWidget}
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
                items={adminNavItems}
                isMobile
                onClose={() => setIsMobileOpen(false)}
                bottomSection={adminFooterWidget}
                onNavigate={handleNavClick}
                currentPath={currentRoutePath}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Body */}
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

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="font-semibold">Admin Panel</span>
              <span>/</span>
              <span className="font-bold text-slate-900 dark:text-white capitalize">
                {activeTab}
              </span>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Global Dark Mode Toggle */}
            <DarkModeToggle id="admin-dark-mode-toggle" size="sm" />

            {/* Quick Search Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-500 hover:text-slate-900 dark:hover:text-white text-xs font-medium border border-slate-200 dark:border-slate-700/60 transition-all"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Search...</span>
              <kbd className="hidden sm:inline px-1.5 py-0.5 rounded text-[10px] font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                ⌘K
              </kbd>
            </button>

            {/* Return to Main App Button */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-sm transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Return to Tool Studio</span>
            </button>
          </div>
        </header>

        {/* Inner Tab Page Container */}
        <main className="flex-1 w-full max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">{children}</main>

        {/* Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 py-4 px-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} AetherPix Studio Operations Console</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-emerald-500 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Systems Operational
            </span>
            <span>v1.0.0</span>
          </div>
        </footer>
      </div>

      {/* Quick Search Dialog */}
      <AnimatePresence>
        {searchOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setSearchOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-4 z-[101]"
            >
              <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                <Search className="w-5 h-5 text-purple-600" />
                <Input
                  type="text"
                  placeholder="Quick admin command (e.g. users, tools, traffic)..."
                  autoFocus
                />
              </div>
              <div className="py-3 space-y-1 text-xs">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Quick Navigation
                </p>
                {[
                  { name: 'User Management', tab: 'users' },
                  { name: 'Tool Configurations', tab: 'tools' },
                  { name: 'Monetization & Ads', tab: 'ads' },
                  { name: 'SEO Diagnostics', path: '/admin/seo' },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSearchOpen(false);
                      if (item.tab) onTabChange(item.tab);
                      if (item.path) navigate(item.path);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left font-medium"
                  >
                    <span>{item.name}</span>
                    <span className="text-[10px] text-purple-600 font-bold">Go to section</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
