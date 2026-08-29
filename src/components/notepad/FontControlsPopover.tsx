import React, { useState, useRef, useEffect } from 'react';
import { EditorFontSettings, FontFamilyOption, FontSizeOption, LineHeightOption } from '../../types/notepad';
import { Type, Check } from 'lucide-react';

interface FontControlsPopoverProps {
  settings: EditorFontSettings;
  onChange: (settings: EditorFontSettings) => void;
}

export const FontControlsPopover: React.FC<FontControlsPopoverProps> = ({
  settings,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const fontFamilies: { id: FontFamilyOption; label: string; classLabel: string }[] = [
    { id: 'sans', label: 'Clean Sans', classLabel: 'font-sans' },
    { id: 'serif', label: 'Classic Serif', classLabel: 'font-serif' },
    { id: 'mono', label: 'Monospace Code', classLabel: 'font-mono' },
    { id: 'system', label: 'System Native', classLabel: 'font-sans' },
  ];

  const fontSizes: { id: FontSizeOption; label: string; px: string }[] = [
    { id: 'sm', label: 'Small', px: '14px' },
    { id: 'base', label: 'Medium', px: '16px' },
    { id: 'lg', label: 'Large', px: '18px' },
    { id: 'xl', label: 'Extra', px: '20px' },
  ];

  const lineHeights: { id: LineHeightOption; label: string }[] = [
    { id: 'compact', label: 'Compact' },
    { id: 'normal', label: 'Normal' },
    { id: 'relaxed', label: 'Spacious' },
  ];

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`p-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs font-semibold ${
          isOpen ? 'bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300' : ''
        }`}
        title="Typography & Spacing"
      >
        <Type className="w-4 h-4" />
        <span className="hidden sm:inline">Font</span>
      </button>

      {isOpen && (
        <div className="absolute end-0 top-full mt-2 w-64 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xl z-50 space-y-4 text-xs select-none animate-in fade-in zoom-in-95 duration-100">
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Typeface
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {fontFamilies.map((font) => (
                <button
                  key={font.id}
                  type="button"
                  onClick={() => onChange({ ...settings, fontFamily: font.id })}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-left rtl:text-right transition-all ${
                    settings.fontFamily === font.id
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className={font.classLabel}>{font.label}</span>
                  {settings.fontFamily === font.id && <Check className="w-3 h-3 text-purple-600 dark:text-purple-400" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Font Size
            </label>
            <div className="grid grid-cols-4 gap-1">
              {fontSizes.map((size) => (
                <button
                  key={size.id}
                  type="button"
                  onClick={() => onChange({ ...settings, fontSize: size.id })}
                  className={`py-1.5 px-2 text-center rounded-lg border transition-all ${
                    settings.fontSize === size.id
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div>{size.label}</div>
                  <div className="text-[9px] text-slate-400 font-mono">{size.px}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Line Spacing
            </label>
            <div className="grid grid-cols-3 gap-1">
              {lineHeights.map((lh) => (
                <button
                  key={lh.id}
                  type="button"
                  onClick={() => onChange({ ...settings, lineHeight: lh.id })}
                  className={`py-1.5 px-2 text-center rounded-lg border transition-all ${
                    settings.lineHeight === lh.id
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {lh.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
