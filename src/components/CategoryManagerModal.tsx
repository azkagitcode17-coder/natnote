import React, { useState } from 'react';
import { X, Plus, FolderPlus, Tag, Trash2, Check } from 'lucide-react';
import { CategoryItem } from '../types';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryItem[];
  onAddCategory: (categoryName: string) => void;
  onDeleteCategory: (categoryId: string) => void;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onDeleteCategory,
}) => {
  const [newCatName, setNewCatName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed) {
      setErrorMsg('Nama kategori tidak boleh kosong');
      return;
    }
    if (categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      setErrorMsg('Kategori ini sudah ada');
      return;
    }

    onAddCategory(trimmed);
    setNewCatName('');
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E2B27]/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div 
        className="w-full max-w-sm bg-[#FAF6EE] border border-[#E8DDCB] rounded-3xl p-6 shadow-xl text-[#1E2B27]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#E8DDCB]/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#127970]/10 flex items-center justify-center text-[#127970]">
              <FolderPlus className="w-4 h-4" />
            </div>
            <span className="font-serif text-base font-semibold text-[#10625B]">
              Kelola Kategori
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-[#71827C] hover:bg-[#F3ECE0] transition-colors"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form add */}
        <form onSubmit={handleCreate} className="mt-4">
          <label className="block text-xs font-medium text-[#71827C] mb-1.5">
            Tambah Kategori Baru
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newCatName}
              onChange={(e) => {
                setNewCatName(e.target.value);
                setErrorMsg('');
              }}
              placeholder="Contoh: Kuliah, Resep, Buku..."
              maxLength={30}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-[#E8DDCB] text-xs text-[#1E2B27] placeholder-[#71827C]/60 focus:outline-none focus:border-[#127970] focus:ring-1 focus:ring-[#127970]"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-[#127970] text-white text-xs font-medium hover:bg-[#10625B] active:scale-95 transition-all flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah</span>
            </button>
          </div>
          {errorMsg && <p className="text-[11px] text-rose-600 mt-1.5">{errorMsg}</p>}
        </form>

        {/* Existing categories list */}
        <div className="mt-5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#71827C]">
            Daftar Kategori Saat Ini
          </span>
          <div className="mt-2 space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {categories.map((cat) => {
              const isDefault = cat.id.startsWith('cat-');
              return (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#E8DDCB]/60 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-[#127970]" />
                    <span className="font-medium text-[#1E2B27]">{cat.name}</span>
                    {isDefault && (
                      <span className="text-[10px] text-[#71827C]/70 bg-[#F3ECE0] px-1.5 py-0.5 rounded">
                        bawaan
                      </span>
                    )}
                  </div>
                  {!isDefault && (
                    <button
                      onClick={() => onDeleteCategory(cat.id)}
                      className="text-[#71827C] hover:text-rose-600 p-1 rounded-md transition-colors"
                      title="Hapus kategori"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-[#E8DDCB]/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#F3ECE0] text-xs font-medium text-[#1E2B27] hover:bg-[#E8DDCB] transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
