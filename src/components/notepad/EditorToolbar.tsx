import React from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo,
  Redo,
  RemoveFormatting,
  Maximize2,
  Minimize2,
  Eye,
  Search,
  HelpCircle,
  Trash2,
  ArrowLeftRight,
} from 'lucide-react';
import { TextDirection } from '../../types/notepad';
import { FontControlsPopover } from './FontControlsPopover';
import { EditorFontSettings } from '../../types/notepad';

interface EditorToolbarProps {
  onExecCommand: (command: string, value?: string) => void;
  textDirection: TextDirection;
  onDirectionChange: (dir: TextDirection) => void;
  fontSettings: EditorFontSettings;
  onFontSettingsChange: (settings: EditorFontSettings) => void;
  onToggleFindReplace: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  isFocusMode: boolean;
  onToggleFocusMode: () => void;
  onOpenShortcuts: () => void;
  onClearNote: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  onExecCommand,
  textDirection,
  onDirectionChange,
  fontSettings,
  onFontSettingsChange,
  onToggleFindReplace,
  isFullscreen,
  onToggleFullscreen,
  isFocusMode,
  onToggleFocusMode,
  onOpenShortcuts,
  onClearNote,
}) => {
  const handleBlockFormat = (tag: string) => {
    onExecCommand('formatBlock', tag);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-1 p-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 select-none">
      {/* Primary Formatting Controls */}
      <div className="flex flex-wrap items-center gap-0.5">
        {/* Headings */}
        <div className="flex items-center gap-0.5 pe-1.5 border-e border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => handleBlockFormat('p')}
            className="px-2 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title="Normal Paragraph"
          >
            P
          </button>
          <button
            type="button"
            onClick={() => handleBlockFormat('h1')}
            className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleBlockFormat('h2')}
            className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleBlockFormat('h3')}
            className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </button>
        </div>

        {/* Inline styles */}
        <div className="flex items-center gap-0.5 px-1.5 border-e border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => onExecCommand('bold')}
            className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onExecCommand('italic')}
            className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onExecCommand('underline')}
            className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title="Underline (Ctrl+U)"
          >
            <Underline className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onExecCommand('strikeThrough')}
            className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </button>
        </div>

        {/* Lists & Quotes */}
        <div className="flex items-center gap-0.5 px-1.5 border-e border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => onExecCommand('insertUnorderedList')}
            className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onExecCommand('insertOrderedList')}
            className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleBlockFormat('blockquote')}
            className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleBlockFormat('pre')}
            className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title="Code Block"
          >
            <Code className="w-4 h-4" />
          </button>
        </div>

        {/* Alignments */}
        <div className="flex items-center gap-0.5 px-1.5 border-e border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => onExecCommand('justifyLeft')}
            className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onExecCommand('justifyCenter')}
            className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onExecCommand('justifyRight')}
            className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onExecCommand('justifyFull')}
            className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title="Justify"
          >
            <AlignJustify className="w-4 h-4" />
          </button>
        </div>

        {/* Text Direction Switcher */}
        <div className="flex items-center gap-0.5 px-1.5 border-e border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => {
              const nextDir: Record<TextDirection, TextDirection> = {
                auto: 'ltr',
                ltr: 'rtl',
                rtl: 'auto',
              };
              onDirectionChange(nextDir[textDirection] || 'auto');
            }}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
              textDirection !== 'auto'
                ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 font-bold'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
            title={`Direction: ${textDirection.toUpperCase()} (Click to toggle)`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span className="uppercase text-[10px]">{textDirection}</span>
          </button>
        </div>

        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 px-1.5 border-e border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => onExecCommand('undo')}
            className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onExecCommand('redo')}
            className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onExecCommand('removeFormat')}
            className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title="Clear Formatting"
          >
            <RemoveFormatting className="w-4 h-4" />
          </button>
        </div>

        {/* Typography & Spacing Popover */}
        <FontControlsPopover settings={fontSettings} onChange={onFontSettingsChange} />
      </div>

      {/* Secondary & Mode Controls */}
      <div className="flex items-center gap-1 ms-auto">
        <button
          type="button"
          onClick={onToggleFindReplace}
          className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          title="Find & Replace (Ctrl+F)"
        >
          <Search className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onToggleFocusMode}
          className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
            isFocusMode
              ? 'bg-purple-600 text-white font-bold'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
          title="Focus Mode (Distraction-Free)"
        >
          <Eye className="w-4 h-4" />
          <span className="hidden md:inline">Focus</span>
        </button>

        <button
          type="button"
          onClick={onToggleFullscreen}
          className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
            isFullscreen
              ? 'bg-purple-600 text-white font-bold'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
          title="Fullscreen Mode"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        <button
          type="button"
          onClick={onOpenShortcuts}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
          title="Keyboard Shortcuts"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onClearNote}
          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
          title="Clear Current Note"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
