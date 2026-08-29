import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Note, TextDirection, EditorFontSettings, SaveStatusState, FindReplaceState } from '../types/notepad';
import { notepadStorage } from '../services/notepadStorage';
import {
  calculateWritingStats,
  extractPlainTextFromHtml,
  markdownToHtml,
  sanitizeFileName,
} from '../utils/notepadUtils';
import { EditorToolbar } from '../components/notepad/EditorToolbar';
import { NotesSidebar } from '../components/notepad/NotesSidebar';
import { WritingStatsBar } from '../components/notepad/WritingStatsBar';
import { SaveStatusIndicator } from '../components/notepad/SaveStatusIndicator';
import { ExportMenu } from '../components/notepad/ExportMenu';
import { FindReplaceBar } from '../components/notepad/FindReplaceBar';
import { KeyboardShortcutsModal } from '../components/notepad/KeyboardShortcutsModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { useApp } from '../context/AppContext';
import {
  FileText,
  Lock,
  Zap,
  ShieldCheck,
  Download,
  Share2,
  FolderOpen,
  Plus,
  Upload,
  Minimize2,
  HelpCircle,
  Sparkles,
  CheckCircle2,
  Sliders,
} from 'lucide-react';
import { RelatedTools } from '../components/common/RelatedTools';

const MAX_ALLOWED_IMPORT_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export const OnlineNotepadView: React.FC = () => {
  const { showToast } = useApp();

  // Notes state
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string>('');
  const [activeNote, setActiveNote] = useState<Note | null>(null);

  // Editor configuration
  const [textDirection, setTextDirection] = useState<TextDirection>('auto');
  const [fontSettings, setFontSettings] = useState<EditorFontSettings>({
    fontFamily: 'sans',
    fontSize: 'base',
    lineHeight: 'normal',
  });

  // UI state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatusState>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<number>(Date.now());
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [pendingImportContent, setPendingImportContent] = useState<{ title: string; html: string; plain: string } | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Find & Replace state
  const [findReplaceState, setFindReplaceState] = useState<FindReplaceState>({
    isOpen: false,
    findText: '',
    replaceText: '',
    caseSensitive: false,
    matchCount: 0,
    currentMatchIndex: 0,
  });

  // Editor ref
  const editorRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize and load notes from storage
  useEffect(() => {
    const initNotes = async () => {
      try {
        const loadedNotes = await notepadStorage.getAllNotes();
        setNotes(loadedNotes);

        const lastActiveId = notepadStorage.getActiveNoteId();
        const initialNote = (lastActiveId && loadedNotes.find((n) => n.id === lastActiveId && !n.isTrashed)) ||
          loadedNotes.find((n) => !n.isTrashed) ||
          loadedNotes[0];

        if (initialNote) {
          setActiveNoteId(initialNote.id);
          setActiveNote(initialNote);
          setTextDirection(initialNote.direction || 'auto');
          if (initialNote.fontSettings) {
            setFontSettings((prev) => ({ ...prev, ...initialNote.fontSettings }));
          }
        }
      } catch (err) {
        console.error('Failed to load notes from storage:', err);
        setSaveStatus('error');
      }
    };

    initNotes();
  }, []);

  // Update editor content when active note changes
  useEffect(() => {
    if (editorRef.current && activeNote) {
      if (editorRef.current.innerHTML !== activeNote.content) {
        editorRef.current.innerHTML = activeNote.content || '';
      }
    }
  }, [activeNoteId]);

  // Execute native editor commands
  const handleExecCommand = (command: string, value: string | undefined = undefined) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, value);
    handleEditorInput();
  };

  // Debounced auto-save handler
  const triggerAutoSave = useCallback(
    (updatedNote: Note) => {
      setSaveStatus('saving');
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(async () => {
        try {
          await notepadStorage.saveNote(updatedNote);
          setSaveStatus('saved');
          setLastSavedTime(Date.now());
        } catch (err) {
          console.error('Auto-save error:', err);
          setSaveStatus('error');
        }
      }, 500);
    },
    []
  );

  // Handle editor input change
  const handleEditorInput = () => {
    if (!editorRef.current || !activeNote) return;
    const htmlContent = editorRef.current.innerHTML;
    const plain = extractPlainTextFromHtml(htmlContent);

    const updated: Note = {
      ...activeNote,
      content: htmlContent,
      plainText: plain,
      updatedAt: Date.now(),
      direction: textDirection,
      fontSettings,
    };

    setActiveNote(updated);
    setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
    triggerAutoSave(updated);
  };

  // Handle title input change
  const handleTitleChange = (newTitle: string) => {
    if (!activeNote) return;
    const updated: Note = {
      ...activeNote,
      title: newTitle,
      updatedAt: Date.now(),
    };
    setActiveNote(updated);
    setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
    triggerAutoSave(updated);
  };

  // Create a new note
  const handleCreateNote = async () => {
    const newNote: Note = {
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      title: 'Untitled Note',
      content: '<p></p>',
      plainText: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isPinned: false,
      isTrashed: false,
      direction: 'auto',
      fontSettings: { ...fontSettings },
    };

    await notepadStorage.saveNote(newNote);
    setNotes((prev) => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
    setActiveNote(newNote);
    notepadStorage.setActiveNoteId(newNote.id);
    showToast('New note created', 'success');

    setTimeout(() => {
      editorRef.current?.focus();
    }, 100);
  };

  // Select a note
  const handleSelectNote = (id: string) => {
    const found = notes.find((n) => n.id === id);
    if (found) {
      setActiveNoteId(id);
      setActiveNote(found);
      setTextDirection(found.direction || 'auto');
      if (found.fontSettings) {
        setFontSettings((prev) => ({ ...prev, ...found.fontSettings }));
      }
      notepadStorage.setActiveNoteId(id);
    }
  };

  // Delete note (move to trash or permanent)
  const handleDeleteNote = async (id: string, permanent = false) => {
    await notepadStorage.deleteNote(id, permanent);
    const updatedNotes = await notepadStorage.getAllNotes();
    setNotes(updatedNotes);

    if (id === activeNoteId) {
      const nextActive = updatedNotes.find((n) => !n.isTrashed);
      if (nextActive) {
        handleSelectNote(nextActive.id);
      } else {
        handleCreateNote();
      }
    }

    showToast(permanent ? 'Note permanently deleted' : 'Note moved to trash', 'info');
  };

  // Restore note from trash
  const handleRestoreNote = async (id: string) => {
    await notepadStorage.restoreNote(id);
    const updatedNotes = await notepadStorage.getAllNotes();
    setNotes(updatedNotes);
    showToast('Note restored from trash', 'success');
  };

  // Empty trash
  const handleEmptyTrash = async () => {
    await notepadStorage.emptyTrash();
    const updatedNotes = await notepadStorage.getAllNotes();
    setNotes(updatedNotes);
    showToast('Trash emptied', 'info');
  };

  // Pin note toggle
  const handleTogglePin = async (id: string) => {
    const note = notes.find((n) => n.id === id);
    if (note) {
      const updated = { ...note, isPinned: !note.isPinned, updatedAt: Date.now() };
      await notepadStorage.saveNote(updated);
      setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
      if (id === activeNoteId) setActiveNote(updated);
    }
  };

  // Duplicate note
  const handleDuplicateNote = async (id: string) => {
    const note = notes.find((n) => n.id === id);
    if (note) {
      const dup: Note = {
        ...note,
        id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        title: `${note.title} (Copy)`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isPinned: false,
      };
      await notepadStorage.saveNote(dup);
      setNotes((prev) => [dup, ...prev]);
      handleSelectNote(dup.id);
      showToast('Note duplicated', 'success');
    }
  };

  // Rename note
  const handleRenameNote = async (id: string, newTitle: string) => {
    const note = notes.find((n) => n.id === id);
    if (note) {
      const updated = { ...note, title: newTitle, updatedAt: Date.now() };
      await notepadStorage.saveNote(updated);
      setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
      if (id === activeNoteId) setActiveNote(updated);
    }
  };

  // Export all notes as JSON backup
  const handleExportAllJSON = async () => {
    const json = await notepadStorage.exportAllNotesJSON();
    const filename = `aetherpix-notes-backup-${new Date().toISOString().slice(0, 10)}.json`;
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported all notes backup', 'success');
  };

  // Import backup JSON
  const handleImportBackupJSON = async (jsonText: string) => {
    try {
      const count = await notepadStorage.importNotesJSON(jsonText);
      const updatedNotes = await notepadStorage.getAllNotes();
      setNotes(updatedNotes);
      if (updatedNotes.length > 0) {
        handleSelectNote(updatedNotes[0].id);
      }
      showToast(`Imported ${count} notes successfully!`, 'success');
    } catch (err) {
      showToast('Failed to import backup file', 'error');
    }
  };

  // Handle Clear Note action
  const handleConfirmClear = () => {
    if (!editorRef.current || !activeNote) return;
    editorRef.current.innerHTML = '<p></p>';
    handleEditorInput();
    setIsClearConfirmOpen(false);
    showToast('Note content cleared', 'info');
  };

  // Find and Replace logic
  const performFindCount = () => {
    if (!activeNote || !findReplaceState.findText) {
      setFindReplaceState((prev) => ({ ...prev, matchCount: 0, currentMatchIndex: 0 }));
      return;
    }
    const text = activeNote.plainText;
    const query = findReplaceState.findText;
    const flags = findReplaceState.caseSensitive ? 'g' : 'gi';
    try {
      const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const matches = text.match(new RegExp(escaped, flags));
      const count = matches ? matches.length : 0;
      setFindReplaceState((prev) => ({ ...prev, matchCount: count }));
    } catch {
      setFindReplaceState((prev) => ({ ...prev, matchCount: 0 }));
    }
  };

  useEffect(() => {
    performFindCount();
  }, [findReplaceState.findText, findReplaceState.caseSensitive, activeNote?.plainText]);

  const handleFindNext = () => {
    if (findReplaceState.matchCount === 0) return;
    setFindReplaceState((prev) => ({
      ...prev,
      currentMatchIndex: (prev.currentMatchIndex + 1) % prev.matchCount,
    }));
  };

  const handleFindPrev = () => {
    if (findReplaceState.matchCount === 0) return;
    setFindReplaceState((prev) => ({
      ...prev,
      currentMatchIndex:
        (prev.currentMatchIndex - 1 + prev.matchCount) % prev.matchCount,
    }));
  };

  const handleReplaceCurrent = () => {
    if (!editorRef.current || !findReplaceState.findText) return;
    const content = editorRef.current.innerHTML;
    const query = findReplaceState.findText;
    const replaceWith = findReplaceState.replaceText;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, findReplaceState.caseSensitive ? '' : 'i');
    editorRef.current.innerHTML = content.replace(regex, replaceWith);
    handleEditorInput();
    showToast('Replaced match', 'success');
  };

  const handleReplaceAll = () => {
    if (!editorRef.current || !findReplaceState.findText) return;
    const content = editorRef.current.innerHTML;
    const query = findReplaceState.findText;
    const replaceWith = findReplaceState.replaceText;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, findReplaceState.caseSensitive ? 'g' : 'gi');
    editorRef.current.innerHTML = content.replace(regex, replaceWith);
    handleEditorInput();
    showToast(`Replaced all occurrences`, 'success');
  };

  // File drag & drop import handler
  const processImportFile = async (file: File) => {
    if (file.size > MAX_ALLOWED_IMPORT_SIZE_BYTES) {
      showToast('File too large (Max 10MB allowed)', 'error');
      return;
    }

    const title = file.name.replace(/\.[^/.]+$/, '');
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (ext === 'txt' || ext === 'md' || ext === 'markdown') {
      const text = await file.text();
      const html = ext === 'txt' ? `<p>${text.replace(/\n/g, '<br/>')}</p>` : markdownToHtml(text);
      applyOrPromptImport(title, html, text);
    } else if (ext === 'html' || ext === 'htm') {
      const html = await file.text();
      const plain = extractPlainTextFromHtml(html);
      applyOrPromptImport(title, html, plain);
    } else {
      showToast('Supported formats: .txt, .md, .html', 'error');
    }
  };

  const applyOrPromptImport = (title: string, html: string, plain: string) => {
    if (activeNote && activeNote.plainText && activeNote.plainText.trim().length > 20) {
      setPendingImportContent({ title, html, plain });
    } else {
      applyImportToActiveNote(title, html, plain);
    }
  };

  const applyImportToActiveNote = (title: string, html: string, plain: string) => {
    if (!activeNote || !editorRef.current) return;
    editorRef.current.innerHTML = html;
    const updated: Note = {
      ...activeNote,
      title: title || activeNote.title,
      content: html,
      plainText: plain,
      updatedAt: Date.now(),
    };
    setActiveNote(updated);
    setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
    triggerAutoSave(updated);
    setPendingImportContent(null);
    showToast('File imported successfully', 'success');
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.ctrlKey || e.metaKey;

      if (isMod && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (activeNote) {
          notepadStorage.saveNote(activeNote).then(() => {
            setSaveStatus('saved');
            setLastSavedTime(Date.now());
            showToast('Note saved locally 🔒', 'success');
          });
        }
      }

      if (isMod && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setFindReplaceState((prev) => ({ ...prev, isOpen: true }));
      }

      if (isMod && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setIsFullscreen((prev) => !prev);
      }

      if (isMod && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setIsFocusMode((prev) => !prev);
      }

      if (e.key === 'Escape') {
        if (findReplaceState.isOpen) {
          setFindReplaceState((prev) => ({ ...prev, isOpen: false }));
        }
        if (isFocusMode) setIsFocusMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeNote, findReplaceState.isOpen, isFocusMode]);

  // Writing stats
  const stats = calculateWritingStats(activeNote?.plainText || '');

  // Typography class resolution
  const getTypographyClasses = () => {
    let fontClass = 'font-sans';
    if (fontSettings.fontFamily === 'serif') fontClass = 'font-serif';
    if (fontSettings.fontFamily === 'mono') fontClass = 'font-mono';

    let sizeClass = 'text-base';
    if (fontSettings.fontSize === 'sm') sizeClass = 'text-sm';
    if (fontSettings.fontSize === 'lg') sizeClass = 'text-lg';
    if (fontSettings.fontSize === 'xl') sizeClass = 'text-xl';

    let leadingClass = 'leading-relaxed';
    if (fontSettings.lineHeight === 'compact') leadingClass = 'leading-normal';
    if (fontSettings.lineHeight === 'relaxed') leadingClass = 'leading-loose';

    return `${fontClass} ${sizeClass} ${leadingClass}`;
  };

  return (
    <div
      ref={containerRef}
      className={`space-y-6 ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-white dark:bg-slate-950 p-4 sm:p-6 overflow-y-auto space-y-4'
          : ''
      }`}
    >
      {/* Standard Header (hidden in Focus mode) */}
      {!isFocusMode && (
        <div className="space-y-4">
          <Breadcrumbs
            items={[
              { label: 'Home', path: '/' },
              { label: 'Text Tools', path: '/text-tools' },
              { label: 'Free Online Notepad', path: '/online-notepad' },
            ]}
          />

          <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                  <FileText className="w-4 h-4" />
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Free Online Notepad
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold border border-emerald-300 dark:border-emerald-800">
                  100% Free & Private
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Write, format, organize, and export notes instantly in your browser. Zero server uploads.
              </p>
            </div>

            {/* Quick Action Group */}
            <div className="flex flex-wrap items-center gap-2">
              <SaveStatusIndicator status={saveStatus} lastSavedTime={lastSavedTime} />

              <button
                type="button"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isSidebarOpen
                    ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
                title="Toggle Notes Sidebar"
              >
                <FolderOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Notes</span>
              </button>

              <button
                type="button"
                onClick={handleCreateNote}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-xs font-bold transition-all shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Note</span>
              </button>

              <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Import</span>
                <input
                  type="file"
                  accept=".txt,.md,.markdown,.html,.htm"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) processImportFile(file);
                    e.target.value = '';
                  }}
                  className="hidden"
                />
              </label>

              <ExportMenu
                title={activeNote?.title || 'Untitled Note'}
                contentHtml={activeNote?.content || ''}
                plainText={activeNote?.plainText || ''}
              />
            </div>
          </div>
        </div>
      )}

      {/* Focus Mode Exit Bar */}
      {isFocusMode && (
        <div className="flex items-center justify-between p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-xs text-purple-700 dark:text-purple-300">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span className="font-bold">Focus Mode Active</span>
            <span className="text-slate-400">• Press Esc to exit</span>
          </div>
          <div className="flex items-center gap-3">
            <SaveStatusIndicator status={saveStatus} lastSavedTime={lastSavedTime} />
            <button
              type="button"
              onClick={() => setIsFocusMode(false)}
              className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold"
            >
              Exit Focus Mode
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace Frame */}
      <div
        className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[580px] ${
          isFullscreen ? 'flex-1' : ''
        }`}
      >
        {/* Collapsible Notes Sidebar */}
        {!isFocusMode && (
          <NotesSidebar
            notes={notes}
            activeNoteId={activeNoteId}
            onSelectNote={handleSelectNote}
            onCreateNote={handleCreateNote}
            onDeleteNote={handleDeleteNote}
            onRestoreNote={handleRestoreNote}
            onEmptyTrash={handleEmptyTrash}
            onTogglePin={handleTogglePin}
            onDuplicateNote={handleDuplicateNote}
            onRenameNote={handleRenameNote}
            onExportAll={handleExportAllJSON}
            onImportBackup={handleImportBackupJSON}
            isOpen={isSidebarOpen}
          />
        )}

        {/* Editor Main Canvas */}
        <div
          className="flex-1 flex flex-col min-w-0 relative"
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingOver(true);
          }}
          onDragLeave={() => setIsDraggingOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDraggingOver(false);
            const file = e.dataTransfer.files?.[0];
            if (file) processImportFile(file);
          }}
        >
          {/* Drag & drop overlay indicator */}
          {isDraggingOver && (
            <div className="absolute inset-0 bg-purple-600/10 backdrop-blur-xs border-2 border-dashed border-purple-500 rounded-2xl z-40 flex flex-col items-center justify-center text-purple-700 dark:text-purple-300 font-bold p-6 text-center space-y-2">
              <Upload className="w-12 h-12 animate-bounce" />
              <p className="text-lg">Drop file here to import</p>
              <p className="text-xs text-slate-500 font-normal">Supports .txt, .md, .html (Max 10MB)</p>
            </div>
          )}

          {/* Note Title Input Bar */}
          <div className="p-3 sm:px-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-white dark:bg-slate-900">
            <input
              type="text"
              value={activeNote?.title || ''}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Untitled Note"
              className="w-full text-base sm:text-lg font-black text-slate-900 dark:text-white bg-transparent border-none outline-none placeholder-slate-300 dark:placeholder-slate-700"
            />

            <div className="shrink-0 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsShortcutsOpen(true)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Keyboard Shortcuts"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* In-Editor Find & Replace Bar */}
          <div className="px-3 pt-2">
            <FindReplaceBar
              state={findReplaceState}
              onChange={(updates) => setFindReplaceState((prev) => ({ ...prev, ...updates }))}
              onFindNext={handleFindNext}
              onFindPrev={handleFindPrev}
              onReplaceCurrent={handleReplaceCurrent}
              onReplaceAll={handleReplaceAll}
              onClose={() => setFindReplaceState((prev) => ({ ...prev, isOpen: false }))}
            />
          </div>

          {/* Reusable Centralized Editor Toolbar */}
          <EditorToolbar
            onExecCommand={handleExecCommand}
            textDirection={textDirection}
            onDirectionChange={(dir) => {
              setTextDirection(dir);
              if (activeNote) {
                const updated = { ...activeNote, direction: dir };
                setActiveNote(updated);
                triggerAutoSave(updated);
              }
            }}
            fontSettings={fontSettings}
            onFontSettingsChange={(settings) => {
              setFontSettings(settings);
              if (activeNote) {
                const updated = { ...activeNote, fontSettings: settings };
                setActiveNote(updated);
                triggerAutoSave(updated);
              }
            }}
            onToggleFindReplace={() =>
              setFindReplaceState((prev) => ({ ...prev, isOpen: !prev.isOpen }))
            }
            isFullscreen={isFullscreen}
            onToggleFullscreen={() => setIsFullscreen((prev) => !prev)}
            isFocusMode={isFocusMode}
            onToggleFocusMode={() => setIsFocusMode((prev) => !prev)}
            onOpenShortcuts={() => setIsShortcutsOpen(true)}
            onClearNote={() => setIsClearConfirmOpen(true)}
          />

          {/* Rich ContentEditable Typing Canvas */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto min-h-[380px] bg-white dark:bg-slate-900 cursor-text">
            <div
              ref={editorRef}
              contentEditable
              dir={textDirection === 'auto' ? undefined : textDirection}
              onInput={handleEditorInput}
              onPaste={(e) => {
                // Sanitize paste to block malicious scripts
                e.stopPropagation();
              }}
              className={`min-h-full outline-none text-slate-800 dark:text-slate-100 prose dark:prose-invert max-w-none transition-all ${getTypographyClasses()}`}
              style={{
                direction: textDirection === 'auto' ? 'inherit' : textDirection,
                unicodeBidi: 'plaintext',
              }}
              data-placeholder="Start typing your note here..."
            />
          </div>

          {/* Real-Time Writing Stats Bar */}
          <WritingStatsBar stats={stats} />
        </div>
      </div>

      {/* SEO & Search Intent Informational Section (Hidden in Focus or Fullscreen mode) */}
      {!isFocusMode && !isFullscreen && (
        <div className="space-y-8 pt-6 border-t border-slate-200 dark:border-slate-800">
          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">100% Client-Side Privacy</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Your notes are stored directly in your browser using IndexedDB. No accounts, logins, or server tracking.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Instant Auto-Save</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Every word is automatically saved to local storage with intelligent debouncing. Never lose your train of thought.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Download className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Multi-Format Export</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Download your notes in 1-click as plain TXT, Markdown (.md), styled HTML, Microsoft Word (.docx), or PDF.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-400 flex items-center justify-center">
                <Sliders className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">RTL & Multilingual Ready</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Seamless bidirectional support for Arabic, Hebrew, English, Hindi, and mixed-direction technical text.
              </p>
            </div>
          </div>

          {/* How to Use Section */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              How to Use Free Online Notepad
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-[11px]">
                  1
                </span>
                <h4 className="font-bold text-slate-900 dark:text-white">Start Writing Immediately</h4>
                <p className="text-slate-500 leading-relaxed">
                  Click on the editor area and type your thoughts, draft an article, or paste content. No login or registration required.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-[11px]">
                  2
                </span>
                <h4 className="font-bold text-slate-900 dark:text-white">Format & Organize</h4>
                <p className="text-slate-500 leading-relaxed">
                  Use the toolbar to add headings, bold/italics, bulleted lists, quotes, and custom typography. Manage multiple notes in the sidebar.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-[11px]">
                  3
                </span>
                <h4 className="font-bold text-slate-900 dark:text-white">Export or Print in 1 Click</h4>
                <p className="text-slate-500 leading-relaxed">
                  Export your document as a PDF, Word document, Markdown file, or clean HTML. Print directly with distraction-free layout.
                </p>
              </div>
            </div>
          </div>

          {/* Factual FAQ / AEO Section */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              Frequently Asked Questions (FAQ)
            </h2>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              <div className="py-3 space-y-1">
                <h4 className="font-bold text-slate-900 dark:text-white">
                  Is AetherPix Free Online Notepad really free?
                </h4>
                <p className="text-slate-500 leading-relaxed">
                  Yes, 100% free. You can create, organize, auto-save, and export unlimited notes without any paywalls or subscriptions.
                </p>
              </div>

              <div className="py-3 space-y-1">
                <h4 className="font-bold text-slate-900 dark:text-white">
                  Where are my notes stored? Are they private?
                </h4>
                <p className="text-slate-500 leading-relaxed">
                  Your notes are saved strictly on your local device inside your browser's IndexedDB and localStorage storage engine. They are never sent to remote servers or third-party trackers.
                </p>
              </div>

              <div className="py-3 space-y-1">
                <h4 className="font-bold text-slate-900 dark:text-white">
                  Does this notepad work offline?
                </h4>
                <p className="text-slate-500 leading-relaxed">
                  Yes! Once the application has loaded in your browser, you can disconnect from the internet and continue writing, formatting, and saving notes without interruption.
                </p>
              </div>

              <div className="py-3 space-y-1">
                <h4 className="font-bold text-slate-900 dark:text-white">
                  Can I export my notes as PDF or Word (.docx)?
                </h4>
                <p className="text-slate-500 leading-relaxed">
                  Yes. Using the Export menu, you can generate valid PDF documents, Microsoft Word (.docx) files, Markdown (.md), and standalone HTML pages.
                </p>
              </div>

              <div className="py-3 space-y-1">
                <h4 className="font-bold text-slate-900 dark:text-white">
                  Does the notepad support Right-to-Left (RTL) languages like Arabic?
                </h4>
                <p className="text-slate-500 leading-relaxed">
                  Yes, full bidirectional support is built in. You can toggle between Auto, LTR, and RTL text directions at any time.
                </p>
              </div>
            </div>
          </div>

          {/* Related Creator & Text Tools */}
          <RelatedTools currentToolId="online-notepad" category="ocr" />
        </div>
      )}

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={isClearConfirmOpen}
        onClose={() => setIsClearConfirmOpen(false)}
        onConfirm={handleConfirmClear}
        title="Clear Current Note?"
        message="Are you sure you want to clear all text in this note? You can still recover text with Undo (Ctrl+Z) if not reloaded."
        confirmText="Clear Note"
        variant="danger"
      />

      <ConfirmDialog
        isOpen={pendingImportContent !== null}
        onClose={() => setPendingImportContent(null)}
        onConfirm={() => {
          if (pendingImportContent) {
            applyImportToActiveNote(
              pendingImportContent.title,
              pendingImportContent.html,
              pendingImportContent.plain
            );
          }
        }}
        title="Overwrite Current Note?"
        message="Your active note already contains content. Do you want to replace it with the imported file?"
        confirmText="Replace & Import"
        variant="warning"
      />

      {/* Keyboard Shortcuts Help Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
};
