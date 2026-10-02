import React from 'react';
import { X, BookOpen, CheckSquare, FileText, Lock, Calendar, Star } from 'lucide-react';
import { Note } from '../types';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: Note[];
}

export const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose, notes }) => {
  if (!isOpen) return null;

  const activeNotes = notes.filter((n) => !n.isDeleted);
  const totalNotes = activeNotes.length;
  const favoriteNotes = activeNotes.filter((n) => n.isFavorite).length;
  const lockedNotes = activeNotes.filter((n) => n.isLocked).length;

  let totalWords = 0;
  let totalChecklistItems = 0;
  let completedChecklistItems = 0;

  activeNotes.forEach((n) => {
    if (n.content) {
      const words = n.content.trim().split(/\s+/).filter(Boolean).length;
      totalWords += words;
    }
    if (n.checklists) {
      totalChecklistItems += n.checklists.length;
      completedChecklistItems += n.checklists.filter((item) => item.done).length;
    }
  });

  const categoryBreakdown: Record<string, number> = {};
  activeNotes.forEach((n) => {
    const cat = n.category || 'Tanpa Kategori';
    categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
  });

  const completionRate = totalChecklistItems > 0 
    ? Math.round((completedChecklistItems / totalChecklistItems) * 100) 
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E2B27]/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-[#FAF6EE] border border-[#E8DDCB] rounded-3xl p-6 shadow-xl text-[#1E2B27] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#E8DDCB]/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#127970]/10 flex items-center justify-center text-[#127970]">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-semibold text-[#10625B] leading-none">
                Statistik NatNOTE
              </h2>
              <p className="text-[11px] text-[#71827C] mt-1">Ringkasan aktivitas dan kebiasaan menulis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-[#71827C] hover:bg-[#F3ECE0] transition-colors"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Highlight Grid */}
        <div className="grid grid-cols-2 gap-3 my-5">
          <div className="bg-white border border-[#E8DDCB] rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-xs text-[#71827C] font-medium">Total Catatan Aktif</span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-3xl font-serif font-bold text-[#10625B]">{totalNotes}</span>
              <span className="text-[11px] text-[#71827C]">buah</span>
            </div>
          </div>

          <div className="bg-white border border-[#E8DDCB] rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-xs text-[#71827C] font-medium">Total Kata Ditulis</span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-3xl font-serif font-bold text-[#10625B]">{totalWords.toLocaleString('id-ID')}</span>
              <span className="text-[11px] text-[#71827C]">kata</span>
            </div>
          </div>

          <div className="bg-white border border-[#E8DDCB] rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-xs text-[#71827C] font-medium">Tugas Selesai</span>
            <div className="mt-2">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-serif font-bold text-[#10625B]">
                  {completedChecklistItems}/{totalChecklistItems}
                </span>
                <span className="text-[11px] text-[#127970] font-medium">({completionRate}%)</span>
              </div>
              <div className="w-full bg-[#E8DDCB] h-1.5 rounded-full mt-2 overflow-hidden">
                <div 
                  className="bg-[#127970] h-full transition-all duration-300" 
                  style={{ width: `${completionRate}%` }} 
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E8DDCB] rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-xs text-[#71827C] font-medium">Koleksi Khusus</span>
            <div className="mt-2 flex items-center gap-3 text-xs text-[#1E2B27]">
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span className="font-semibold">{favoriteNotes} Favorit</span>
              </span>
              <span className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-[#127970]" />
                <span className="font-semibold">{lockedNotes} Terkunci</span>
              </span>
            </div>
          </div>
        </div>

        {/* Category distribution */}
        <div className="pt-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#71827C] mb-3">
            Distribusi per Kategori
          </h3>
          <div className="space-y-2">
            {Object.entries(categoryBreakdown).length === 0 ? (
              <p className="text-xs text-[#71827C]">Belum ada catatan.</p>
            ) : (
              Object.entries(categoryBreakdown).map(([catName, count]) => {
                const pct = totalNotes > 0 ? Math.round((count / totalNotes) * 100) : 0;
                return (
                  <div key={catName} className="space-y-1">
                    <div className="flex justify-between text-xs text-[#1E2B27]">
                      <span className="font-medium truncate max-w-[200px]">{catName}</span>
                      <span className="text-[#71827C] text-[11px] tabular-nums">
                        {count} catatan ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#E8DDCB]/60 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#127970] h-full rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[#E8DDCB]/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#127970] text-white text-xs font-medium hover:bg-[#10625B] transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
