import React, { useState } from 'react';
import { BookOpen, Folder, Plus, Star, MoreHorizontal, CheckSquare, Lock, Trash2, BarChart3, Database } from 'lucide-react';
import { ViewFilter, CategoryItem } from '../types';

interface BottomNavProps {
  currentFilter: ViewFilter;
  onFilterChange: (filter: ViewFilter) => void;
  onNewNote: () => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  categories: CategoryItem[];
  onOpenStats: () => void;
  onOpenExport: () => void;
  onOpenCategoryManager: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentFilter,
  onFilterChange,
  onNewNote,
  selectedCategory,
  onSelectCategory,
  categories,
  onOpenStats,
  onOpenExport,
  onOpenCategoryManager,
}) => {
  const [showCategorySheet, setShowCategorySheet] = useState(false);
  const [showMoreSheet, setShowMoreSheet] = useState(false);

  return (
    <>
      {/* Category Bottom Sheet for HP */}
      {showCategorySheet && (
        <div 
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex flex-col justify-end md:hidden animate-fade-in"
          onClick={() => setShowCategorySheet(false)}
        >
          <div 
            className="bg-[#FAF6EE] rounded-t-3xl border-t border-[#E8DDCB] p-5 max-h-[75vh] overflow-y-auto animate-slide-up shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Grab handle */}
            <div className="w-10 h-1.5 bg-[#D8C7AE] rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between pb-3 border-b border-[#E8DDCB]/60 mb-3">
              <span className="font-serif text-base font-semibold text-[#10625B]">
                Pilih Kategori
              </span>
              <button
                onClick={() => {
                  setShowCategorySheet(false);
                  onOpenCategoryManager();
                }}
                className="text-xs text-[#127970] font-medium hover:underline"
              >
                + Kelola
              </button>
            </div>

            <div className="space-y-1">
              <button
                onClick={() => {
                  onSelectCategory('Semua');
                  onFilterChange('all');
                  setShowCategorySheet(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-medium min-h-[44px] ${
                  selectedCategory === 'Semua' && currentFilter === 'all'
                    ? 'bg-[#127970] text-white'
                    : 'text-[#1E2B27] bg-white border border-[#E8DDCB]'
                }`}
              >
                <span>Semua Kategori</span>
              </button>

              {categories.filter(c => c.id !== 'cat-all').map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    onSelectCategory(cat.name);
                    onFilterChange('all');
                    setShowCategorySheet(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-medium min-h-[44px] ${
                    selectedCategory === cat.name && currentFilter === 'all'
                      ? 'bg-[#127970] text-white'
                      : 'text-[#1E2B27] bg-white border border-[#E8DDCB]'
                  }`}
                >
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* More Options Bottom Sheet for HP */}
      {showMoreSheet && (
        <div 
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex flex-col justify-end md:hidden animate-fade-in"
          onClick={() => setShowMoreSheet(false)}
        >
          <div 
            className="bg-[#FAF6EE] rounded-t-3xl border-t border-[#E8DDCB] p-5 max-h-[75vh] overflow-y-auto animate-slide-up shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Grab handle */}
            <div className="w-10 h-1.5 bg-[#D8C7AE] rounded-full mx-auto mb-4" />

            <div className="pb-3 border-b border-[#E8DDCB]/60 mb-3">
              <span className="font-serif text-base font-semibold text-[#10625B]">
                Fitur & Pustaka Lainnya
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mb-4">
              <button
                onClick={() => {
                  onFilterChange('checklists');
                  setShowMoreSheet(false);
                }}
                className="p-3 rounded-xl bg-white border border-[#E8DDCB] text-left flex items-center gap-2.5 min-h-[48px] hover:border-[#127970]"
              >
                <CheckSquare className="w-4 h-4 text-[#127970]" />
                <span className="text-xs font-medium text-[#1E2B27]">Daftar Tugas</span>
              </button>

              <button
                onClick={() => {
                  onFilterChange('locked');
                  setShowMoreSheet(false);
                }}
                className="p-3 rounded-xl bg-white border border-[#E8DDCB] text-left flex items-center gap-2.5 min-h-[48px] hover:border-[#127970]"
              >
                <Lock className="w-4 h-4 text-[#127970]" />
                <span className="text-xs font-medium text-[#1E2B27]">Catatan Terkunci</span>
              </button>

              <button
                onClick={() => {
                  onFilterChange('trash');
                  setShowMoreSheet(false);
                }}
                className="p-3 rounded-xl bg-white border border-[#E8DDCB] text-left flex items-center gap-2.5 min-h-[48px] hover:border-rose-300"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span className="text-xs font-medium text-[#1E2B27]">Kotak Sampah</span>
              </button>

              <button
                onClick={() => {
                  setShowMoreSheet(false);
                  onOpenStats();
                }}
                className="p-3 rounded-xl bg-white border border-[#E8DDCB] text-left flex items-center gap-2.5 min-h-[48px] hover:border-[#127970]"
              >
                <BarChart3 className="w-4 h-4 text-[#127970]" />
                <span className="text-xs font-medium text-[#1E2B27]">Statistik</span>
              </button>

              <button
                onClick={() => {
                  setShowMoreSheet(false);
                  onOpenExport();
                }}
                className="p-3 rounded-xl bg-white border border-[#E8DDCB] text-left flex items-center gap-2.5 min-h-[48px] hover:border-[#127970]"
              >
                <Database className="w-4 h-4 text-[#127970]" />
                <span className="text-xs font-medium text-[#1E2B27]">Cadangan Data</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Ergonomic Bottom Tab Bar (Height <= 64px, perfectly compliant with 15% mobile sticky cap) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-t border-[#E8DDCB] flex items-center justify-around h-16 px-2 md:hidden no-print select-none shadow-lg">
        {/* Tab 1: Catatan */}
        <button
          type="button"
          onClick={() => {
            onFilterChange('all');
            onSelectCategory('Semua');
          }}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] transition-colors cursor-pointer ${
            currentFilter === 'all' && selectedCategory === 'Semua'
              ? 'text-[#127970]'
              : 'text-[#71827C]'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1">Catatan</span>
        </button>

        {/* Tab 2: Kategori */}
        <button
          type="button"
          onClick={() => setShowCategorySheet(true)}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] transition-colors cursor-pointer ${
            selectedCategory !== 'Semua' ? 'text-[#127970]' : 'text-[#71827C]'
          }`}
        >
          <Folder className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1">
            {selectedCategory === 'Semua' ? 'Kategori' : selectedCategory.slice(0, 8)}
          </span>
        </button>

        {/* Center Primary Action Button (Tosca Accent FAB) */}
        <div className="relative -top-3">
          <button
            type="button"
            onClick={onNewNote}
            className="w-13 h-13 rounded-full bg-[#127970] text-white flex items-center justify-center shadow-lg shadow-[#127970]/30 active:scale-95 transition-transform cursor-pointer"
            aria-label="Buat Catatan Baru"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>

        {/* Tab 3: Favorit */}
        <button
          type="button"
          onClick={() => onFilterChange('favorites')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] transition-colors cursor-pointer ${
            currentFilter === 'favorites' ? 'text-[#127970]' : 'text-[#71827C]'
          }`}
        >
          <Star className={`w-5 h-5 ${currentFilter === 'favorites' ? 'fill-[#127970]' : ''}`} />
          <span className="text-[10px] font-medium tracking-tight mt-1">Favorit</span>
        </button>

        {/* Tab 4: Lebih Banyak (Menu) */}
        <button
          type="button"
          onClick={() => setShowMoreSheet(true)}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] transition-colors cursor-pointer ${
            ['checklists', 'audio', 'locked', 'trash'].includes(currentFilter)
              ? 'text-[#127970]'
              : 'text-[#71827C]'
          }`}
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1">Lainnya</span>
        </button>
      </nav>
    </>
  );
};
