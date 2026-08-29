import { Note } from '../types/notepad';

const DB_NAME = 'aetherpix_notepad_db';
const DB_VERSION = 1;
const STORE_NAME = 'notes';
const LOCAL_STORAGE_KEY = 'aetherpix_notepad_notes_fallback';
const ACTIVE_NOTE_ID_KEY = 'aetherpix_notepad_active_note_id';

const INITIAL_WELCOME_NOTE: Note = {
  id: 'welcome-to-aetherpix-notepad',
  title: 'Welcome to AetherPix Free Online Notepad',
  content: `<h2>Welcome to AetherPix Online Notepad! ✍️</h2>
<p>This is your private, distraction-free browser notepad. Type ideas, meeting minutes, code snippets, or draft essays with complete confidence.</p>
<h3>Key Features:</h3>
<ul>
  <li><strong>100% Client-Side Privacy:</strong> Your notes are saved directly in your browser's IndexedDB. Zero server uploads.</li>
  <li><strong>Auto-Save:</strong> Never lose a word. Every keystroke is saved locally in real-time.</li>
  <li><strong>Rich Formatting:</strong> Headings, bold, italic, underline, lists, quotes, code blocks, and alignments.</li>
  <li><strong>RTL / LTR Support:</strong> Full bidirectional language support for Arabic, English, Hindi, and more.</li>
  <li><strong>Instant Export:</strong> Download as TXT, Markdown (.md), HTML, PDF, or DOCX with 1-click.</li>
  <li><strong>Distraction-Free Focus:</strong> Toggle Fullscreen or Focus mode for pure flow.</li>
</ul>
<p><em>Pro Tip: Press <strong>Ctrl + S</strong> (or <strong>Cmd + S</strong> on Mac) to save, <strong>Ctrl + F</strong> to find and replace, and <strong>Ctrl + B</strong> to make text bold!</em></p>`,
  plainText: `Welcome to AetherPix Online Notepad! ✍️
This is your private, distraction-free browser notepad. Type ideas, meeting minutes, code snippets, or draft essays with complete confidence.

Key Features:
- 100% Client-Side Privacy: Your notes are saved directly in your browser's IndexedDB. Zero server uploads.
- Auto-Save: Never lose a word. Every keystroke is saved locally in real-time.
- Rich Formatting: Headings, bold, italic, underline, lists, quotes, code blocks, and alignments.
- RTL / LTR Support: Full bidirectional language support for Arabic, English, Hindi, and more.
- Instant Export: Download as TXT, Markdown (.md), HTML, PDF, or DOCX with 1-click.
- Distraction-Free Focus: Toggle Fullscreen or Focus mode for pure flow.

Pro Tip: Press Ctrl + S (or Cmd + S on Mac) to save, Ctrl + F to find and replace, and Ctrl + B to make text bold!`,
  createdAt: Date.now() - 3600000,
  updatedAt: Date.now() - 3600000,
  isPinned: true,
  isTrashed: false,
  direction: 'auto',
  fontSettings: {
    fontFamily: 'sans',
    fontSize: 'base',
    lineHeight: 'normal',
  },
};

class NotepadStorage {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private isIndexedDBAvailable = typeof window !== 'undefined' && 'indexedDB' in window;

  private async getDB(): Promise<IDBDatabase> {
    if (!this.isIndexedDBAvailable) {
      throw new Error('IndexedDB not supported in this environment');
    }

    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            store.createIndex('updatedAt', 'updatedAt', { unique: false });
            store.createIndex('isPinned', 'isPinned', { unique: false });
            store.createIndex('isTrashed', 'isTrashed', { unique: false });
          }
        };

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    }

    return this.dbPromise;
  }

  // Fallback helper for LocalStorage
  private getFromLocalStorage(): Note[] {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!data) return [INITIAL_WELCOME_NOTE];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : [INITIAL_WELCOME_NOTE];
    } catch {
      return [INITIAL_WELCOME_NOTE];
    }
  }

  private saveToLocalStorage(notes: Note[]): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notes));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }

  public async getAllNotes(): Promise<Note[]> {
    try {
      const db = await this.getDB();
      return new Promise<Note[]>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();

        req.onsuccess = () => {
          const results = req.result as Note[];
          if (!results || results.length === 0) {
            // Seed welcome note
            this.saveNote(INITIAL_WELCOME_NOTE).then(() => {
              resolve([INITIAL_WELCOME_NOTE]);
            }).catch(() => resolve([INITIAL_WELCOME_NOTE]));
          } else {
            resolve(results);
          }
        };

        req.onerror = () => {
          reject(req.error);
        };
      });
    } catch (err) {
      console.warn('Falling back to localStorage for notes read:', err);
      return this.getFromLocalStorage();
    }
  }

  public async getNoteById(id: string): Promise<Note | null> {
    try {
      const db = await this.getDB();
      return new Promise<Note | null>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(id);

        req.onsuccess = () => {
          resolve(req.result || null);
        };

        req.onerror = () => {
          reject(req.error);
        };
      });
    } catch {
      const notes = this.getFromLocalStorage();
      return notes.find((n) => n.id === id) || null;
    }
  }

  public async saveNote(note: Note): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(note);

        req.onsuccess = () => {
          resolve();
        };

        req.onerror = () => {
          reject(req.error);
        };
      });
    } catch (err) {
      console.warn('Falling back to localStorage for save note:', err);
      const notes = this.getFromLocalStorage();
      const idx = notes.findIndex((n) => n.id === note.id);
      if (idx >= 0) {
        notes[idx] = note;
      } else {
        notes.unshift(note);
      }
      this.saveToLocalStorage(notes);
    }
  }

  public async deleteNote(id: string, permanent = false): Promise<void> {
    if (!permanent) {
      const note = await this.getNoteById(id);
      if (note) {
        note.isTrashed = true;
        note.trashedAt = Date.now();
        await this.saveNote(note);
        return;
      }
    }

    try {
      const db = await this.getDB();
      return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(id);

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      const notes = this.getFromLocalStorage().filter((n) => n.id !== id);
      this.saveToLocalStorage(notes);
    }
  }

  public async restoreNote(id: string): Promise<void> {
    const note = await this.getNoteById(id);
    if (note) {
      note.isTrashed = false;
      note.trashedAt = undefined;
      note.updatedAt = Date.now();
      await this.saveNote(note);
    }
  }

  public async emptyTrash(): Promise<void> {
    const allNotes = await this.getAllNotes();
    const trashed = allNotes.filter((n) => n.isTrashed);
    for (const note of trashed) {
      await this.deleteNote(note.id, true);
    }
  }

  public getActiveNoteId(): string | null {
    try {
      return localStorage.getItem(ACTIVE_NOTE_ID_KEY);
    } catch {
      return null;
    }
  }

  public setActiveNoteId(id: string): void {
    try {
      localStorage.setItem(ACTIVE_NOTE_ID_KEY, id);
    } catch {
      // Ignore
    }
  }

  public async exportAllNotesJSON(): Promise<string> {
    const notes = await this.getAllNotes();
    return JSON.stringify(notes, null, 2);
  }

  public async importNotesJSON(jsonString: string): Promise<number> {
    const parsed = JSON.parse(jsonString);
    if (!Array.isArray(parsed)) {
      throw new Error('Invalid notes backup file. Expected array.');
    }
    let count = 0;
    for (const item of parsed) {
      if (item && item.id && item.title !== undefined && item.content !== undefined) {
        await this.saveNote({
          ...item,
          id: item.id || `note-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          updatedAt: Date.now(),
        });
        count++;
      }
    }
    return count;
  }
}

export const notepadStorage = new NotepadStorage();
