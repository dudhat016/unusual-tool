import React from 'react';
import { Modal } from '../ui/Modal';
import { Keyboard, Command } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  const modKey = isMac ? '⌘' : 'Ctrl';

  const shortcuts = [
    { category: 'Formatting', items: [
      { key: `${modKey} + B`, desc: 'Bold text' },
      { key: `${modKey} + I`, desc: 'Italic text' },
      { key: `${modKey} + U`, desc: 'Underline text' },
      { key: `${modKey} + Shift + X`, desc: 'Strikethrough' },
      { key: `${modKey} + Shift + 7`, desc: 'Numbered list' },
      { key: `${modKey} + Shift + 8`, desc: 'Bulleted list' },
      { key: `${modKey} + \\`, desc: 'Clear formatting' },
    ]},
    { category: 'Editor & History', items: [
      { key: `${modKey} + S`, desc: 'Save note locally' },
      { key: `${modKey} + Z`, desc: 'Undo' },
      { key: `${modKey} + Shift + Z`, desc: 'Redo' },
      { key: `${modKey} + F`, desc: 'Find & Replace' },
      { key: `${modKey} + A`, desc: 'Select All' },
      { key: 'Tab', desc: 'Indent text / spacing' },
      { key: 'Esc', desc: 'Exit Focus / Fullscreen / Modal' },
    ]},
    { category: 'Export & View', items: [
      { key: `${modKey} + P`, desc: 'Print note' },
      { key: `${modKey} + Shift + F`, desc: 'Toggle Fullscreen Mode' },
      { key: `${modKey} + Shift + D`, desc: 'Toggle Focus Mode' },
    ]},
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Keyboard Shortcuts" size="md">
      <div className="space-y-6 text-xs select-none">
        <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 flex items-center gap-2">
          <Command className="w-4 h-4 shrink-0" />
          <span>Shortcuts use <strong>{modKey}</strong> based on your operating system.</span>
        </div>

        <div className="space-y-4">
          {shortcuts.map((sec) => (
            <div key={sec.category} className="space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {sec.category}
              </h4>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
                {sec.items.map((item) => (
                  <div key={item.key} className="flex items-center justify-between px-3.5 py-2">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      {item.desc}
                    </span>
                    <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono text-[11px] font-bold shadow-2xs">
                      {item.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};
