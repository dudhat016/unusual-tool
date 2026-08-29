import React, { useState } from 'react';
import { Note } from '../../types/notepad';
import { Input } from '../ui/Input';
import {
  Plus,
  Search,
  Pin,
  Trash2,
  Copy,
  RotateCcw,
  FileText,
  Lock,
  Download,
  Upload,
  Clock,
  Check,
  X,
  Edit2,
  FolderOpen,
} from 'lucide-react';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useApp } from '../../context/AppContext';
import { triggerFileDownload } from '../../utils/notepadUtils';

interface NotesSidebarProps {
  notes: Note[];
  activeNoteId: string;
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;
  onDeleteNote: (id: string, permanent?: boolean) => void;
  onRestoreNote: (id: string) => void;
  onEmptyTrash: () => void;
  onTogglePin: (id: string) => void;
  onDuplicateNote: (id: string) => void;
  onRenameNote: (id: string, newTitle: string) => void;
  onExportAll: () => void;
  onImportBackup: (jsonText: string) => void;
  isOpen: boolean;
  onCloseMobile?: () => void;
}

export const NotesSidebar: React.FC<NotesSidebarProps> = ({
  notes,
  activeNoteId,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
  onRestoreNote,
  onEmptyTrash,
  onTogglePin,
  onDuplicateNote,
  onRenameNote,
  onExportAll,
  onImportBackup,
  isOpen,
  onCloseMobile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pinned' | 'trash'>('all');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editTitleValue, setEditTitleValue] = useState('');
  const [noteToDeleteId, setNoteToDeleteId] = useState<string | null>(null);
  const [isEmptyTrashConfirmOpen, setIsEmptyTrashConfirmOpen] = useState(false);
  const { showToast } = useApp();

  const trashedNotes = notes.filter((n) => n.isTrashed);
  const activeNotes = notes.filter((n) => !n.isTrashed);

  const filteredNotes = (activeTab === 'trash' ? trashedNotes : activeNotes).filter((note) => {
    if (activeTab === 'pinned' && !note.isPinned) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      note.title.toLowerCase().includes(q) ||
      (note.plainText && note.plainText.toLowerCase().includes(q))
    );
  });

  // Sort: Pinned first, then by updatedAt descending
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (activeTab !== 'trash') {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
    }
    return b.updatedAt - a.updatedAt;
  });

  const handleStartRename = (e: React.MouseEvent, note: Note) => {
    e.stopPropagation();
    setEditingNoteId(note.id);
    setEditTitleValue(note.title);
  };

  const handleSaveRename = (noteId: string) => {
    if (editTitleValue.trim()) {
      onRenameNote(noteId, editTitleValue.trim());
    }
    setEditingNoteId(null);
  };

  const handleBackupFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        onImportBackup(text);
      } catch (err) {
        showToast('Invalid backup file format', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  if (!isOpen) return null;

  return (
    <aside className="w-72 sm:w-80 shrink-0 border-e border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-full select-none">
      {/* Sidebar Header & New Note */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300 flex items-center justify-center">
              <FolderOpen className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">My Notes</h3>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onExportAll}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Backup All Notes JSON"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <label
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              title="Import Backup JSON"
            >
              <Upload className="w-3.5 h-3.5" />
              <input type="file" accept=".json" onChange={handleBackupFileInput} className="hidden" />
            </label>
            {onCloseMobile && (
              <button
                type="button"
                onClick={onCloseMobile}
                className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onCreateNote}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-sm transition-all cursor-pointer active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>

        {/* Search input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute start-2.5 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes..."
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-[11px] font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-1 rounded-md text-center transition-all ${
              activeTab === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All ({activeNotes.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pinned')}
            className={`flex-1 py-1 rounded-md text-center transition-all ${
              activeTab === 'pinned'
                ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-300 shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Pinned ({activeNotes.filter((n) => n.isPinned).length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('trash')}
            className={`flex-1 py-1 rounded-md text-center transition-all ${
              activeTab === 'trash'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Trash ({trashedNotes.length})
          </button>
        </div>
      </div>

      {/* Trash controls bar if trash tab selected */}
      {activeTab === 'trash' && trashedNotes.length > 0 && (
        <div className="px-3 py-2 bg-rose-50 dark:bg-rose-950/40 border-b border-rose-200 dark:border-rose-900 flex items-center justify-between text-xs">
          <span className="text-rose-700 dark:text-rose-300 font-medium">
            {trashedNotes.length} notes in trash
          </span>
          <button
            type="button"
            onClick={() => setIsEmptyTrashConfirmOpen(true)}
            className="text-rose-600 hover:text-rose-700 font-bold underline cursor-pointer text-[11px]"
          >
            Empty Trash
          </button>
        </div>
      )}

      {/* Note List Items */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 p-1.5 space-y-0.5">
        {sortedNotes.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs px-4 space-y-2">
            <FileText className="w-8 h-8 mx-auto stroke-1 text-slate-300 dark:text-slate-700" />
            <p className="font-semibold text-slate-600 dark:text-slate-400">
              {activeTab === 'trash' ? 'Trash is empty' : 'No notes found'}
            </p>
            {activeTab !== 'trash' && (
              <button
                type="button"
                onClick={onCreateNote}
                className="text-purple-600 dark:text-purple-400 font-bold hover:underline"
              >
                + Create your first note
              </button>
            )}
          </div>
        ) : (
          sortedNotes.map((note) => {
            const isActive = note.id === activeNoteId && activeTab !== 'trash';
            const wordCount = note.plainText ? note.plainText.trim().split(/\s+/).filter(Boolean).length : 0;
            const formattedDate = new Date(note.updatedAt).toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
            });

            return (
              <div
                key={note.id}
                onClick={() => {
                  if (activeTab !== 'trash') {
                    onSelectNote(note.id);
                    if (onCloseMobile) onCloseMobile();
                  }
                }}
                className={`group relative rounded-xl p-2.5 transition-all text-xs cursor-pointer ${
                  isActive
                    ? 'bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 shadow-2xs'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <div className="flex items-start justify-between gap-1.5">
                  {editingNoteId === note.id ? (
                    <div
                      className="flex items-center gap-1 w-full"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Input
                        type="text"
                        value={editTitleValue}
                        onChange={(e) => setEditTitleValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveRename(note.id);
                          if (e.key === 'Escape') setEditingNoteId(null);
                        }}
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveRename(note.id)}
                        className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <h4
                      className={`font-bold truncate flex-1 ${
                        isActive
                          ? 'text-purple-900 dark:text-purple-200'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {note.title || 'Untitled Note'}
                    </h4>
                  )}

                  {/* Pin badge or button */}
                  {activeTab !== 'trash' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTogglePin(note.id);
                      }}
                      className={`p-1 rounded transition-colors ${
                        note.isPinned
                          ? 'text-purple-600 dark:text-purple-400'
                          : 'text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 hover:text-purple-600'
                      }`}
                      title={note.isPinned ? 'Unpin note' : 'Pin note to top'}
                    >
                      <Pin className={`w-3 h-3 ${note.isPinned ? 'fill-current' : ''}`} />
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-1 mt-0.5">
                  {note.plainText || 'Empty note...'}
                </p>

                <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100/80 dark:border-slate-800/60 text-[10px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    <span>{formattedDate}</span>
                    <span>•</span>
                    <span>{wordCount} words</span>
                  </div>

                  {/* Hover Actions */}
                  <div
                    className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {activeTab === 'trash' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => onRestoreNote(note.id)}
                          className="p-1 rounded text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                          title="Restore note"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteNote(note.id, true)}
                          className="p-1 rounded text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950"
                          title="Delete permanently"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={(e) => handleStartRename(e, note)}
                          className="p-1 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white"
                          title="Rename note"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDuplicateNote(note.id)}
                          className="p-1 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white"
                          title="Duplicate note"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteNote(note.id, false)}
                          className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950"
                          title="Move to trash"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Sidebar Footer Privacy Notice */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 text-[11px] text-slate-500 flex items-center gap-2">
        <Lock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        <span className="leading-tight">
          Notes stored privately in browser. Zero server uploads.
        </span>
      </div>

      {/* Empty Trash Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isEmptyTrashConfirmOpen}
        onClose={() => setIsEmptyTrashConfirmOpen(false)}
        onConfirm={() => {
          onEmptyTrash();
          setIsEmptyTrashConfirmOpen(false);
        }}
        title="Empty Trash?"
        message="This will permanently delete all notes in the trash. This action cannot be undone."
        confirmText="Empty Trash Permanently"
        variant="danger"
      />
    </aside>
  );
};
