import { Note, CategoryItem } from '../types';

export const STORAGE_KEY_NOTES = 'natnote_notes_v2';
export const STORAGE_KEY_CATEGORIES = 'natnote_categories_v2';
export const STORAGE_KEY_SORT = 'natnote_sort_v2';
export const STORAGE_KEY_VIEW = 'natnote_view_v2';

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: 'cat-all', name: 'Semua Catatan', iconName: 'BookOpen' },
  { id: 'cat-pribadi', name: 'Catatan Pribadi', iconName: 'User' },
  { id: 'cat-ide', name: 'Ide', iconName: 'Lightbulb' },
  { id: 'cat-rencana', name: 'Rencana', iconName: 'CheckSquare' },
];

export const INITIAL_SEED_NOTES: Note[] = [];

export function getStoredNotes(): Note[] {
  try {
    // Clear any previous dummy storage if exists
    if (localStorage.getItem('ruangcatat_notes_v1')) {
      localStorage.removeItem('ruangcatat_notes_v1');
    }
    const raw = localStorage.getItem(STORAGE_KEY_NOTES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Filter out dummy notes if any remained
    const cleanNotes = parsed.filter(
      (n) => n && n.id && !['note-1', 'note-2', 'note-3', 'note-4', 'note-5'].includes(n.id)
    );
    if (cleanNotes.length !== parsed.length) {
      localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(cleanNotes));
    }
    return cleanNotes;
  } catch (err) {
    console.error('Error reading notes from localStorage:', err);
    return [];
  }
}

export function saveNotesToStorage(notes: Note[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(notes));
  } catch (err) {
    console.error('Error saving notes to localStorage:', err);
  }
}

export function getStoredCategories(): CategoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CATEGORIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
      return DEFAULT_CATEGORIES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_CATEGORIES;
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

export function saveCategoriesToStorage(categories: CategoryItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
  } catch (err) {
    console.error('Error saving categories:', err);
  }
}

export function exportNotesToJson(notes: Note[]): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(notes, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `natnote-cadangan-${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function formatTimeAgo(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} mnt lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays === 1) return 'Kemarin';
    if (diffDays < 7) return `${diffDays} hari lalu`;
    
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  } catch {
    return 'Terkini';
  }
}

export function formatDateDetailed(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '';
  }
}
