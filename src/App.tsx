import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, ArrowUpDown, Trash2, BookOpen, 
  Sparkles, FileText, CheckCircle2, RotateCcw, AlertTriangle 
} from 'lucide-react';
import { Note, CategoryItem, ViewFilter, SortOption, ViewMode } from './types';
import { 
  getStoredNotes, saveNotesToStorage, 
  getStoredCategories, saveCategoriesToStorage, 
  STORAGE_KEY_SORT, STORAGE_KEY_VIEW 
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { NoteCard } from './components/NoteCard';
import { NoteEditor } from './components/NoteEditor';
import { PinModal } from './components/PinModal';
import { StatsModal } from './components/StatsModal';
import { ExportModal } from './components/ExportModal';
import { CategoryManagerModal } from './components/CategoryManagerModal';

export default function App() {
  const [notes, setNotes] = useState<Note[]>(() => getStoredNotes());
  const [categories, setCategories] = useState<CategoryItem[]>(() => getStoredCategories());
  
  const [currentFilter, setCurrentFilter] = useState<ViewFilter>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [sortBy, setSortBy] = useState<SortOption>(() => {
    return (localStorage.getItem(STORAGE_KEY_SORT) as SortOption) || 'updated-desc';
  });

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return (localStorage.getItem(STORAGE_KEY_VIEW) as ViewMode) || 'grid';
  });

  // Modal states
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false);
  
  const [pinModalState, setPinModalState] = useState<{
    isOpen: boolean;
    targetNote?: Note;
    isSettingNewPin: boolean;
  }>({ isOpen: false, isSettingNewPin: false });

  // Sync to local storage
  useEffect(() => {
    saveNotesToStorage(notes);
  }, [notes]);

  useEffect(() => {
    saveCategoriesToStorage(categories);
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SORT, sortBy);
  }, [sortBy]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_VIEW, viewMode);
  }, [viewMode]);

  // Note CRUD Handlers
  const handleCreateNewNote = () => {
    const newNote: Note = {
      id: 'note-' + Date.now(),
      title: '',
      content: '',
      category: selectedCategory !== 'Semua' ? selectedCategory : 'Catatan Pribadi',
      tags: selectedTag ? [selectedTag] : [],
      isPinned: false,
      isFavorite: false,
      isDeleted: false,
      isLocked: false,
      colorTone: 'default',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes((prev) => [newNote, ...prev]);
    setEditingNote(newNote);
  };

  const handleSaveNote = (updatedNote: Note) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === updatedNote.id ? { ...n, ...updatedNote } : n))
    );
  };

  const handleTogglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n))
    );
  };

  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isFavorite: !n.isFavorite } : n))
    );
  };

  const handleDeleteNote = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, isDeleted: true, isPinned: false, updatedAt: new Date().toISOString() }
          : n
      )
    );
  };

  const handleRestoreNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, isDeleted: false, updatedAt: new Date().toISOString() }
          : n
      )
    );
  };

  const handlePermanentDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Hapus catatan ini secara permanen? Catatan tidak dapat dikembalikan.')) {
      setNotes((prev) => prev.filter((n) => n.id !== id));
    }
  };

  const handleEmptyTrash = () => {
    if (window.confirm('Kosongkan semua catatan di kotak sampah secara permanen?')) {
      setNotes((prev) => prev.filter((n) => !n.isDeleted));
    }
  };

  // Open note handler (handles lock / PIN security)
  const handleOpenNote = (note: Note) => {
    if (note.isDeleted) return;
    if (note.isLocked) {
      setPinModalState({
        isOpen: true,
        targetNote: note,
        isSettingNewPin: false,
      });
    } else {
      setEditingNote(note);
    }
  };

  // Category management handlers
  const handleAddCategory = (catName: string) => {
    const newCat: CategoryItem = {
      id: 'cat-custom-' + Date.now(),
      name: catName,
      iconName: 'Tag',
    };
    setCategories((prev) => [...prev, newCat]);
  };

  const handleDeleteCategory = (catId: string) => {
    const toDelete = categories.find((c) => c.id === catId);
    if (!toDelete) return;
    setCategories((prev) => prev.filter((c) => c.id !== catId));
    // update notes in that category to 'Catatan Pribadi'
    setNotes((prev) =>
      prev.map((n) => (n.category === toDelete.name ? { ...n, category: 'Catatan Pribadi' } : n))
    );
    if (selectedCategory === toDelete.name) {
      setSelectedCategory('Semua');
    }
  };

  // Filter & Search Logic
  const filteredNotes = useMemo(() => {
    let result = notes;

    // Filter by view tab
    if (currentFilter === 'trash') {
      result = result.filter((n) => n.isDeleted);
    } else {
      result = result.filter((n) => !n.isDeleted);

      if (currentFilter === 'favorites') {
        result = result.filter((n) => n.isFavorite);
      } else if (currentFilter === 'checklists') {
        result = result.filter((n) => n.checklists && n.checklists.length > 0);
      } else if (currentFilter === 'locked') {
        result = result.filter((n) => n.isLocked);
      }

      // Filter by category
      if (selectedCategory !== 'Semua') {
        result = result.filter((n) => n.category === selectedCategory);
      }

      // Filter by tag
      if (selectedTag) {
        result = result.filter((n) => n.tags?.includes(selectedTag));
      }
    }

    // Filter by live search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.category.toLowerCase().includes(q) ||
          n.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sort order
    return [...result].sort((a, b) => {
      // In normal view, pinned notes always appear first
      if (currentFilter !== 'trash') {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
      }

      if (sortBy === 'updated-desc') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      if (sortBy === 'updated-asc') {
        return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      }
      if (sortBy === 'created-desc') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'title-asc') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [notes, currentFilter, selectedCategory, selectedTag, searchQuery, sortBy]);

  // Section titles & descriptions
  const getSectionTitle = () => {
    if (currentFilter === 'trash') return 'Kotak Sampah';
    if (currentFilter === 'favorites') return 'Catatan Favorit';
    if (currentFilter === 'checklists') return 'Daftar Tugas & Checklist';
    if (currentFilter === 'locked') return 'Catatan Terkunci';
    if (selectedTag) return `Topik: #${selectedTag}`;
    if (selectedCategory !== 'Semua') return selectedCategory;
    return 'Semua Catatan';
  };

  const getSectionSubtitle = () => {
    if (currentFilter === 'trash') {
      return 'Catatan di kotak sampah dapat dipulihkan atau dihapus selamanya';
    }
    return `${filteredNotes.length} catatan tersimpan dengan aman`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1E2B27] font-sans antialiased">
      {/* Top Navigation */}
      <Navbar
        currentFilter={currentFilter}
        onFilterChange={setCurrentFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNewNote={handleCreateNewNote}
        onOpenStats={() => setStatsModalOpen(true)}
        onOpenExport={() => setExportModalOpen(true)}
        viewMode={viewMode}
        onToggleViewMode={() => setViewMode((prev) => (prev === 'grid' ? 'list' : 'grid'))}
      />

      {/* Main Container with Sidebar + Feed */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 flex">
        {/* Sidebar for Desktop / Tablet */}
        <Sidebar
          currentFilter={currentFilter}
          onFilterChange={setCurrentFilter}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          categories={categories}
          notes={notes}
          onOpenCategoryManager={() => setCategoryManagerOpen(true)}
          selectedTag={selectedTag}
          onSelectTag={setSelectedTag}
        />

        {/* Notes Workspace Feed */}
        <main className="flex-1 py-6 md:pl-8 pb-24 md:pb-12">
          {/* Mobile Search Bar */}
          <div className="relative mb-5 block sm:hidden">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71827C]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari catatan, tag, atau ide..."
              className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl bg-white border border-[#E8DDCB] text-xs text-[#1E2B27] placeholder-[#71827C]/60 focus:outline-none focus:border-[#127970] shadow-xs"
            />
          </div>

          {/* Header Row: Title, Subtitle, and Sort Controls */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-5 mb-6 border-b border-[#E8DDCB]/60">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#10625B]">
                  {getSectionTitle()}
                </h1>
                {currentFilter === 'trash' && filteredNotes.length > 0 && (
                  <button
                    onClick={handleEmptyTrash}
                    className="ml-2 px-3 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-medium hover:bg-rose-100 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Kosongkan Sampah</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-[#71827C] mt-1">{getSectionSubtitle()}</p>
            </div>

            {/* Filter and Sort bar */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#71827C] flex items-center gap-1 text-[11px]">
                <ArrowUpDown className="w-3 h-3 text-[#127970]" />
                <span>Urutkan:</span>
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-2.5 py-1.5 rounded-xl bg-white border border-[#E8DDCB] text-xs font-medium text-[#1E2B27] focus:outline-none focus:border-[#127970] cursor-pointer shadow-xs"
              >
                <option value="updated-desc">Terakhir Diubah</option>
                <option value="created-desc">Terbaru Dibuat</option>
                <option value="updated-asc">Paling Lama</option>
                <option value="title-asc">Judul (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Active Tag filter indicator banner */}
          {selectedTag && (
            <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#EBF7F5] border border-[#ABE1D9] text-xs text-[#10625B]">
              <span>Menampilkan catatan dengan tag: <strong>#{selectedTag}</strong></span>
              <button
                onClick={() => setSelectedTag('')}
                className="text-[#10625B] hover:text-rose-600 font-bold ml-1 text-sm leading-none"
              >
                ×
              </button>
            </div>
          )}

          {/* Notes Grid / List */}
          {filteredNotes.length === 0 ? (
            <div className="py-20 px-4 text-center my-6 max-w-md mx-auto">
              <div className="w-10 h-10 rounded-full bg-[#EBF7F5] text-[#127970] flex items-center justify-center mx-auto mb-4 shadow-xs">
                <BookOpen className="w-5 h-5 stroke-[1.5]" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-[#10625B] tracking-tight">
                {searchQuery
                  ? 'Tidak ada catatan yang cocok'
                  : currentFilter === 'trash'
                  ? 'Kotak sampah kosong'
                  : 'Halaman Masih Bersih'}
              </h3>
              <p className="text-xs text-[#71827C] mx-auto mt-1.5 mb-6 leading-relaxed">
                {searchQuery
                  ? `Tidak ada hasil pencarian untuk "${searchQuery}". Coba kata kunci lain.`
                  : currentFilter === 'trash'
                  ? 'Tidak ada catatan yang dihapus.'
                  : 'Ruang hening untuk setiap pemikiran, rencana, dan idemu.'}
              </p>
              {currentFilter !== 'trash' && !searchQuery && (
                <button
                  onClick={handleCreateNewNote}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#127970] text-white text-xs font-medium hover:bg-[#10625B] shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tulis Catatan Pertama</span>
                </button>
              )}
            </div>
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5'
                  : 'space-y-3'
              }
            >
              {filteredNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onOpen={handleOpenNote}
                  onTogglePin={handleTogglePin}
                  onToggleFavorite={handleToggleFavorite}
                  onDelete={handleDeleteNote}
                  onRestore={handleRestoreNote}
                  onPermanentDelete={handlePermanentDelete}
                  isTrashView={currentFilter === 'trash'}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Ergonomic Mobile Bottom Tab Bar */}
      <BottomNav
        currentFilter={currentFilter}
        onFilterChange={setCurrentFilter}
        onNewNote={handleCreateNewNote}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        categories={categories}
        onOpenStats={() => setStatsModalOpen(true)}
        onOpenExport={() => setExportModalOpen(true)}
        onOpenCategoryManager={() => setCategoryManagerOpen(true)}
      />

      {/* Modals & Full Editor */}
      {editingNote && (
        <NoteEditor
          note={editingNote}
          categories={categories}
          onSave={handleSaveNote}
          onClose={() => setEditingNote(null)}
          onDelete={(id) => {
            handleDeleteNote(id);
            setEditingNote(null);
          }}
          onRequestPinModal={(noteToLock, isSetting) => {
            setPinModalState({
              isOpen: true,
              targetNote: noteToLock,
              isSettingNewPin: isSetting,
            });
          }}
        />
      )}

      {/* PIN Security Modal */}
      <PinModal
        isOpen={pinModalState.isOpen}
        onClose={() => setPinModalState({ isOpen: false, isSettingNewPin: false })}
        correctPin={pinModalState.targetNote?.pinCode || '1234'}
        isSettingNewPin={pinModalState.isSettingNewPin}
        noteTitle={pinModalState.targetNote?.title}
        onSetPin={(newPin) => {
          if (pinModalState.targetNote) {
            const hasLock = Boolean(newPin);
            const updated = {
              ...pinModalState.targetNote,
              isLocked: hasLock,
              pinCode: newPin || undefined,
              updatedAt: new Date().toISOString(),
            };
            handleSaveNote(updated);
            if (editingNote && editingNote.id === updated.id) {
              setEditingNote(updated);
            }
          }
        }}
        onSuccess={() => {
          if (!pinModalState.isSettingNewPin && pinModalState.targetNote) {
            if (editingNote && editingNote.id === pinModalState.targetNote.id) {
              const unlockedNote: Note = {
                ...pinModalState.targetNote,
                isLocked: false,
                pinCode: undefined,
                updatedAt: new Date().toISOString(),
              };
              handleSaveNote(unlockedNote);
              setEditingNote(unlockedNote);
            } else {
              setEditingNote(pinModalState.targetNote);
            }
          }
        }}
      />

      {/* Stats Modal */}
      <StatsModal
        isOpen={statsModalOpen}
        onClose={() => setStatsModalOpen(false)}
        notes={notes}
      />

      {/* Export & Import Modal */}
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        notes={notes}
        onImportNotes={(imported) => {
          setNotes(imported);
        }}
        onClearAllNotes={() => {
          setNotes([]);
        }}
      />

      {/* Category Manager Modal */}
      <CategoryManagerModal
        isOpen={categoryManagerOpen}
        onClose={() => setCategoryManagerOpen(false)}
        categories={categories}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
      />
    </div>
  );
}
