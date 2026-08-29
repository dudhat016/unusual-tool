import React, { useState, useRef, useEffect } from 'react';
import { Icon, IconName } from './Icon';

export interface DropdownMenuItem {
  id: string;
  label: React.ReactNode;
  icon?: IconName;
  shortcut?: string;
  destructive?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  dividerBefore?: boolean;
}

export interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: DropdownMenuItem[];
  align?: 'left' | 'right';
  className?: string;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  trigger,
  items,
  align = 'right',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={menuRef} className={`relative inline-block ${className}`}>
      <div onClick={() => setIsOpen((prev) => !prev)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          role="menu"
          className={`absolute z-50 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl p-1.5 animate-in fade-in zoom-in-95 duration-150 ${
            align === 'right' ? 'right-0 rtl:right-auto rtl:left-0' : 'left-0 rtl:left-auto rtl:right-0'
          }`}
        >
          {items.map((item) => (
            <React.Fragment key={item.id}>
              {item.dividerBefore && (
                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
              )}

              <button
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  if (item.disabled) return;
                  setIsOpen(false);
                  item.onClick?.();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-xl transition-colors cursor-pointer ${
                  item.destructive
                    ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                } ${item.disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  {item.icon && (
                    <Icon
                      name={item.icon}
                      size={15}
                      className={item.destructive ? 'text-rose-500' : 'text-slate-400 dark:text-slate-500'}
                    />
                  )}
                  <span className="truncate">{item.label}</span>
                </div>

                {item.shortcut && (
                  <span className="text-[10px] font-mono text-slate-400">
                    {item.shortcut}
                  </span>
                )}
              </button>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};
