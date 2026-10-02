import React from 'react';
import { Search, Plus, BarChart3, Database, Feather, SlidersHorizontal, Grid, List, X } from 'lucide-react';
import { ViewFilter, ViewMode } from '../types';

interface NavbarProps {
  currentFilter: ViewFilter;
  onFilterChange: (filter: ViewFilter) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onNewNote: () => void;
  onOpenStats: () => void;
  onOpenExport: () => void;
  viewMode: ViewMode;
  onToggleViewMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  onNewNote,
  onOpenStats,
  onOpenExport,
  viewMode,
  onToggleViewMode,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E8DDCB] px-4 sm:px-8 py-3 transition-colors no-print">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark (Single text element in Capella/Serif) */}
        <div className="flex items-center gap-3">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onFilterChange('all');
            }}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-[#127970] text-white flex items-center justify-center shadow-xs group-hover:bg-[#10625B] transition-colors">
              <Feather className="w-3.5 h-3.5" />
            </div>
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#10625B]">
              NatNOTE
            </span>
          </a>
        </div>

        {/* Zone 2: Navigation Links & Search (Desktop / Tablet) */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-[#71827C]">
          <button
            onClick={() => onFilterChange('all')}
            className={`transition-colors hover:text-[#10625B] cursor-pointer ${
              currentFilter === 'all' ? 'text-[#10625B] font-semibold' : ''
            }`}
          >
            Semua Catatan
          </button>
          <button
            onClick={() => onFilterChange('favorites')}
            className={`transition-colors hover:text-[#10625B] cursor-pointer ${
              currentFilter === 'favorites' ? 'text-[#10625B] font-semibold' : ''
            }`}
          >
            Favorit
          </button>
          <button
            onClick={() => onFilterChange('checklists')}
            className={`transition-colors hover:text-[#10625B] cursor-pointer ${
              currentFilter === 'checklists' ? 'text-[#10625B] font-semibold' : ''
            }`}
          >
            Daftar Tugas
          </button>
          <button
            onClick={() => onFilterChange('trash')}
            className={`transition-colors hover:text-[#10625B] cursor-pointer ${
              currentFilter === 'trash' ? 'text-[#10625B] font-semibold' : ''
            }`}
          >
            Sampah
          </button>
        </nav>

        {/* Search input in center/right */}
        <div className="flex-1 max-w-xs relative hidden sm:block">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#71827C]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari catatan, tag, atau isi..."
            className="w-full pl-8 pr-7 py-2 rounded-xl bg-white border border-[#E8DDCB] text-xs text-[#1E2B27] placeholder-[#71827C]/60 focus:outline-none focus:border-[#127970] focus:ring-1 focus:ring-[#127970]/30 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#71827C] hover:text-[#1E2B27]"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2">
          {/* View toggle (Grid / List) */}
          <button
            onClick={onToggleViewMode}
            className="w-9 h-9 hidden md:flex items-center justify-center rounded-xl bg-white border border-[#E8DDCB] text-[#71827C] hover:text-[#10625B] hover:border-[#127970]/40 transition-colors cursor-pointer"
            title={viewMode === 'grid' ? 'Ganti ke Tampilan Daftar' : 'Ganti ke Tampilan Kotak'}
          >
            {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
          </button>

          {/* Stats Button */}
          <button
            onClick={onOpenStats}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-[#E8DDCB] text-[#71827C] hover:text-[#10625B] hover:border-[#127970]/40 transition-colors cursor-pointer"
            title="Statistik Menulis"
            aria-label="Statistik Menulis"
          >
            <BarChart3 className="w-4 h-4" />
          </button>

          {/* Backup / Export Button */}
          <button
            onClick={onOpenExport}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-[#E8DDCB] text-[#71827C] hover:text-[#10625B] hover:border-[#127970]/40 transition-colors cursor-pointer"
            title="Cadangan & Impor"
            aria-label="Cadangan & Impor"
          >
            <Database className="w-4 h-4" />
          </button>

          {/* + Catatan Baru Button (Tosca Accent CTA) */}
          <button
            onClick={onNewNote}
            className="px-3.5 sm:px-4 py-2 rounded-xl bg-[#127970] text-white text-xs font-medium hover:bg-[#10625B] active:scale-95 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline">Catatan Baru</span>
          </button>
        </div>
      </div>
    </header>
  );
};
