import React from 'react';
import { 
  BookOpen, Star, CheckSquare, Lock, Trash2, 
  FolderPlus, Tag, Plus, ChevronRight, Layers, Sparkles 
} from 'lucide-react';
import { ViewFilter, CategoryItem, Note } from '../types';

interface SidebarProps {
  currentFilter: ViewFilter;
  onFilterChange: (filter: ViewFilter) => void;
  selectedCategory: string;
  onSelectCategory: (categoryName: string) => void;
  categories: CategoryItem[];
  notes: Note[];
  onOpenCategoryManager: () => void;
  selectedTag: string;
  onSelectTag: (tag: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentFilter,
  onFilterChange,
  selectedCategory,
  onSelectCategory,
  categories,
  notes,
  onOpenCategoryManager,
  selectedTag,
  onSelectTag,
}) => {
  const activeNotes = notes.filter((n) => !n.isDeleted);
  const trashNotes = notes.filter((n) => n.isDeleted);

  // Collect all unique tags and counts
  const tagCounts: Record<string, number> = {};
  activeNotes.forEach((n) => {
    n.tags?.forEach((t) => {
      tagCounts[t] = (tagCounts[t] || 0) + 1;
    });
  });
  const popularTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col gap-6 py-6 pr-6 border-r border-[#E8DDCB]/60 select-none">
      {/* Primary Views */}
      <div className="space-y-1">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#71827C] px-3 mb-2 block">
          Pustaka Catatan
        </span>

        <button
          onClick={() => {
            onFilterChange('all');
            onSelectCategory('Semua');
            onSelectTag('');
          }}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
            currentFilter === 'all' && selectedCategory === 'Semua' && !selectedTag
              ? 'bg-[#127970] text-white shadow-xs'
              : 'text-[#1E2B27] hover:bg-[#F3ECE0]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-4 h-4" />
            <span>Semua Catatan</span>
          </div>
          <span className={`text-[11px] tabular-nums ${
            currentFilter === 'all' && selectedCategory === 'Semua' && !selectedTag ? 'text-white/80' : 'text-[#71827C]'
          }`}>
            {activeNotes.length}
          </span>
        </button>

        <button
          onClick={() => {
            onFilterChange('favorites');
            onSelectCategory('Semua');
            onSelectTag('');
          }}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
            currentFilter === 'favorites'
              ? 'bg-[#127970] text-white shadow-xs'
              : 'text-[#1E2B27] hover:bg-[#F3ECE0]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Star className="w-4 h-4" />
            <span>Catatan Favorit</span>
          </div>
          <span className={`text-[11px] tabular-nums ${currentFilter === 'favorites' ? 'text-white/80' : 'text-[#71827C]'}`}>
            {activeNotes.filter((n) => n.isFavorite).length}
          </span>
        </button>

        <button
          onClick={() => {
            onFilterChange('checklists');
            onSelectCategory('Semua');
            onSelectTag('');
          }}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
            currentFilter === 'checklists'
              ? 'bg-[#127970] text-white shadow-xs'
              : 'text-[#1E2B27] hover:bg-[#F3ECE0]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <CheckSquare className="w-4 h-4" />
            <span>Daftar Tugas</span>
          </div>
          <span className={`text-[11px] tabular-nums ${currentFilter === 'checklists' ? 'text-white/80' : 'text-[#71827C]'}`}>
            {activeNotes.filter((n) => n.checklists && n.checklists.length > 0).length}
          </span>
        </button>

        <button
          onClick={() => {
            onFilterChange('locked');
            onSelectCategory('Semua');
            onSelectTag('');
          }}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
            currentFilter === 'locked'
              ? 'bg-[#127970] text-white shadow-xs'
              : 'text-[#1E2B27] hover:bg-[#F3ECE0]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4" />
            <span>Catatan Terkunci</span>
          </div>
          <span className={`text-[11px] tabular-nums ${currentFilter === 'locked' ? 'text-white/80' : 'text-[#71827C]'}`}>
            {activeNotes.filter((n) => n.isLocked).length}
          </span>
        </button>

        <button
          onClick={() => {
            onFilterChange('trash');
            onSelectCategory('Semua');
            onSelectTag('');
          }}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
            currentFilter === 'trash'
              ? 'bg-[#127970] text-white shadow-xs'
              : 'text-[#1E2B27] hover:bg-[#F3ECE0]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Trash2 className="w-4 h-4" />
            <span>Sampah</span>
          </div>
          <span className={`text-[11px] tabular-nums ${currentFilter === 'trash' ? 'text-white/80' : 'text-[#71827C]'}`}>
            {trashNotes.length}
          </span>
        </button>
      </div>

      {/* Categories section */}
      <div className="space-y-1">
        <div className="flex items-center justify-between px-3 mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#71827C]">
            Kategori
          </span>
          <button
            type="button"
            onClick={onOpenCategoryManager}
            className="text-[11px] text-[#127970] hover:text-[#10625B] font-medium flex items-center gap-0.5"
            title="Kelola Kategori"
          >
            <Plus className="w-3 h-3" />
            <span>Tambah</span>
          </button>
        </div>

        <div className="space-y-0.5">
          {categories.filter(c => c.id !== 'cat-all').map((cat) => {
            const count = activeNotes.filter((n) => n.category === cat.name).length;
            const isSelected = selectedCategory === cat.name && currentFilter === 'all' && !selectedTag;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  onFilterChange('all');
                  onSelectCategory(cat.name);
                  onSelectTag('');
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#EBF7F5] text-[#10625B] font-semibold'
                    : 'text-[#3A4B45] hover:bg-[#F3ECE0]'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#127970]' : 'bg-[#D8C7AE]'}`} />
                  <span className="truncate">{cat.name}</span>
                </div>
                <span className="text-[11px] text-[#71827C] tabular-nums">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Popular Tags */}
      {popularTags.length > 0 && (
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#71827C] px-3 mb-2.5 block">
            Topik & Tag
          </span>
          <div className="flex flex-wrap gap-1.5 px-3">
            {popularTags.map(([tag, count]) => {
              const isSelected = selectedTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => {
                    onFilterChange('all');
                    onSelectTag(isSelected ? '' : tag);
                  }}
                  className={`text-[11px] px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#127970] text-white font-medium shadow-xs'
                      : 'bg-white border border-[#E8DDCB] text-[#71827C] hover:text-[#10625B] hover:border-[#127970]/30'
                  }`}
                >
                  #{tag} <span className="opacity-70">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Aesthetic quote at bottom */}
      <div className="mt-auto px-3 pt-4 border-t border-[#E8DDCB]/60 text-[11px] text-[#71827C]/80 italic font-serif">
        "Tuliskan hal-hal sederhana, rawat pikiran yang tenang."
      </div>
    </aside>
  );
};
