import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronRight,
  ChevronLeft,
  X,
  Zap,
  Shield,
  SlidersHorizontal,
} from 'lucide-react';

export interface NavItem {
  label?: string;
  path?: string;
  icon?: React.ComponentType<{ className?: string }>;
  sectionTitle?: string;
  divider?: boolean;
  badge?: string | number;
  badgeVariant?: 'primary' | 'danger' | 'warning' | 'success';
  isNew?: boolean;
  exact?: boolean;
  children?: NavItem[];
}

export interface SidebarProps {
  items: NavItem[];
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobile?: boolean;
  onClose?: () => void;
  bottomSection?: React.ReactNode;
  logo?: React.ReactNode;
  theme?: 'light' | 'dark' | 'gradient';
  currentPath?: string;
  onNavigate?: (path: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  items,
  collapsed = false,
  onToggleCollapse,
  isMobile = false,
  onClose,
  bottomSection,
  logo,
  theme = 'dark',
  currentPath = window.location.pathname,
  onNavigate,
}) => {
  const isGradient = theme === 'gradient';
  const isDark = theme === 'dark' || isGradient;

  const handleLinkClick = (e: React.MouseEvent, path?: string) => {
    if (!path) return;
    if (onNavigate) {
      e.preventDefault();
      onNavigate(path);
      if (isMobile && onClose) onClose();
    }
  };

  return (
    <aside
      data-sidebar-theme={theme}
      className={`relative flex flex-col shrink-0 transition-all duration-300 z-30 ${
        isMobile
          ? 'w-72 h-full'
          : collapsed
          ? 'w-20 min-h-screen'
          : 'w-64 min-h-screen'
      } ${
        isGradient
          ? 'bg-gradient-to-b from-purple-700 via-indigo-800 to-slate-900 text-white border-r border-white/10'
          : 'bg-white dark:bg-slate-900/95 border-r border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100'
      }`}
    >
      {/* Header / Logo Bar */}
      <div
        className={`h-16 flex items-center px-4 justify-between border-b shrink-0 ${
          isGradient ? 'border-white/10' : 'border-slate-200 dark:border-slate-800'
        }`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          {logo || (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-purple-500/20 shrink-0">
                <Zap className="w-5 h-5 fill-white" />
              </div>
              {(!collapsed || isMobile) && (
                <div className="flex flex-col truncate">
                  <span className="font-extrabold tracking-tight text-base font-display leading-tight">
                    AetherPix
                  </span>
                  <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider leading-none mt-0.5">
                    Studio Console
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          {isMobile && onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {!isMobile && onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {collapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <ChevronLeft className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {items.map((item, idx) => (
          <SidebarItemRow
            key={(item.label || item.sectionTitle || 'item') + idx}
            item={item}
            collapsed={collapsed && !isMobile}
            currentPath={currentPath}
            onLinkClick={handleLinkClick}
            isGradient={isGradient}
          />
        ))}
      </nav>

      {/* Bottom Section */}
      {bottomSection && (
        <div
          className={`p-3 border-t shrink-0 ${
            isGradient ? 'border-white/10' : 'border-slate-200 dark:border-slate-800'
          }`}
        >
          {bottomSection}
        </div>
      )}
    </aside>
  );
};

interface SidebarItemRowProps {
  item: NavItem;
  collapsed: boolean;
  currentPath: string;
  onLinkClick: (e: React.MouseEvent, path?: string) => void;
  isGradient?: boolean;
}

const SidebarItemRow: React.FC<SidebarItemRowProps> = ({
  item,
  collapsed,
  currentPath,
  onLinkClick,
  isGradient = false,
}) => {
  const isSection = !!item.sectionTitle;
  const isDivider = !!item.divider;
  const hasChildren = !!(item.children && item.children.length > 0);

  const checkActive = (path?: string, exact = false): boolean => {
    if (!path) return false;
    const cleanCurrent = currentPath.split('?')[0].replace(/\/$/, '') || '/';
    const cleanPath = path.split('?')[0].replace(/\/$/, '') || '/';
    if (exact) return cleanCurrent === cleanPath;
    return cleanCurrent === cleanPath || cleanCurrent.startsWith(cleanPath + '/');
  };

  const isActive = checkActive(item.path, item.exact);
  const anyChildActive = item.children?.some(c => checkActive(c.path, c.exact)) ?? false;
  const [isOpen, setIsOpen] = useState(isActive || anyChildActive);

  useEffect(() => {
    if (isActive || anyChildActive) setIsOpen(true);
  }, [isActive, anyChildActive]);

  if (isSection) {
    if (collapsed) return null;
    return (
      <p className="px-3 pt-5 pb-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
        {item.sectionTitle}
      </p>
    );
  }

  if (isDivider) {
    return (
      <div className={`h-px my-2 mx-3 ${isGradient ? 'bg-white/15' : 'bg-slate-200 dark:bg-slate-800'}`} />
    );
  }

  if (hasChildren) {
    const parentActive = isActive || anyChildActive;

    return (
      <div>
        <button
          onClick={() => setIsOpen(o => !o)}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold h-10 transition-all ${
            parentActive
              ? isGradient
                ? 'bg-white/20 text-white shadow-sm'
                : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
          } ${collapsed ? 'justify-center px-0' : ''}`}
        >
          {item.icon && <item.icon className="w-4.5 h-4.5 shrink-0" />}
          {!collapsed && (
            <>
              <span className="flex-1 text-left truncate">{item.label}</span>
              {item.badge && (
                <span
                  className={`min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[9px] font-bold px-1.5 ${
                    item.badgeVariant === 'danger'
                      ? 'bg-rose-500 text-white'
                      : item.badgeVariant === 'warning'
                      ? 'bg-amber-500 text-white'
                      : 'bg-purple-600 text-white'
                  }`}
                >
                  {item.badge}
                </span>
              )}
              <ChevronRight
                className={`w-3.5 h-3.5 shrink-0 opacity-60 transition-transform duration-200 ${
                  isOpen ? 'rotate-90' : ''
                }`}
              />
            </>
          )}
        </button>

        <AnimatePresence initial={false}>
          {isOpen && !collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="ml-4 pl-3 mt-1 space-y-1 border-l border-slate-200 dark:border-slate-800">
                {item.children?.map((child, idx) => (
                  <SidebarItemRow
                    key={(child.label || 'sub') + idx}
                    item={child}
                    collapsed={false}
                    currentPath={currentPath}
                    onLinkClick={onLinkClick}
                    isGradient={isGradient}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  const leafActiveClass = isGradient
    ? 'bg-white text-purple-700 shadow-md font-bold'
    : 'bg-purple-600 text-white shadow-md shadow-purple-600/25 font-bold';

  const leafInactiveClass =
    'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 font-medium';

  return (
    <a
      href={item.path || '#'}
      onClick={(e) => onLinkClick(e, item.path)}
      title={collapsed ? item.label : undefined}
      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-all h-9.5 ${
        isActive ? leafActiveClass : leafInactiveClass
      } ${collapsed ? 'justify-center px-0 h-10' : ''}`}
    >
      {item.icon && <item.icon className="w-4.5 h-4.5 shrink-0" />}
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {item.isNew && !isActive && (
            <span className="relative flex w-2 h-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full w-2 h-2 bg-emerald-500" />
            </span>
          )}
          {item.badge && !item.isNew && (
            <span
              className={`min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[9px] font-bold px-1.5 ${
                item.badgeVariant === 'danger'
                  ? 'bg-rose-500 text-white'
                  : item.badgeVariant === 'warning'
                  ? 'bg-amber-500 text-white'
                  : 'bg-purple-500/20 text-purple-600 dark:text-purple-300'
              }`}
            >
              {item.badge}
            </span>
          )}
        </>
      )}
    </a>
  );
};
