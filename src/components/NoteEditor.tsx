import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Check, Lock, Unlock, Star, Trash2, 
  CheckSquare, Plus, X, Share2, 
  Download, Printer, Clock
} from 'lucide-react';
import { Note, ChecklistItem, NoteColorTone, CategoryItem } from '../types';
import { formatDateDetailed } from '../utils/storage';

interface NoteEditorProps {
  note: Note;
  categories: CategoryItem[];
  onSave: (updatedNote: Note) => void;
  onClose: () => void;
  onDelete: (id: string) => void;
  onRequestPinModal: (note: Note, isSettingNewPin: boolean) => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  note,
  categories,
  onSave,
  onClose,
  onDelete,
  onRequestPinModal,
}) => {
  const [title, setTitle] = useState(note.title || '');
  const [content, setContent] = useState(note.content || '');
  const [category, setCategory] = useState(note.category || 'Catatan Pribadi');
  const [tags, setTags] = useState<string[]>(note.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [isFavorite, setIsFavorite] = useState(note.isFavorite || false);
  const [isPinned, setIsPinned] = useState(note.isPinned || false);
  const [isLocked, setIsLocked] = useState(note.isLocked || false);
  const [pinCode, setPinCode] = useState(note.pinCode || '');
  const [colorTone, setColorTone] = useState<NoteColorTone>(note.colorTone || 'default');
  const [checklists, setChecklists] = useState<ChecklistItem[]>(note.checklists || []);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [showChecklistMode, setShowChecklistMode] = useState((note.checklists && note.checklists.length > 0) || false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>('Tersimpan');
  const [copiedToast, setCopiedToast] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<number | null>(null);
  const isClosingRef = useRef<boolean>(false);

  // Sync if note prop updates from outside (e.g. PIN modal)
  useEffect(() => {
    setTitle(note.title || '');
    setContent(note.content || '');
    setCategory(note.category || 'Catatan Pribadi');
    setTags(note.tags || []);
    setIsFavorite(note.isFavorite || false);
    setIsPinned(note.isPinned || false);
    setIsLocked(note.isLocked || false);
    setPinCode(note.pinCode || '');
    setColorTone(note.colorTone || 'default');
    setChecklists(note.checklists || []);
    setShowChecklistMode((note.checklists && note.checklists.length > 0) || false);
  }, [note.id, note.isLocked, note.pinCode]);

  // Construct current state of the note
  const getNoteSnapshot = (overrides?: Partial<Note>): Note => {
    return {
      ...note,
      title,
      content,
      category,
      tags,
      isFavorite,
      isPinned,
      isLocked,
      pinCode,
      colorTone,
      checklists,
      ...overrides,
      updatedAt: new Date().toISOString(),
    };
  };

  // Immediate synchronous save
  const saveImmediately = (overrides?: Partial<Note>) => {
    if (isClosingRef.current) return;
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    const snapshot = getNoteSnapshot(overrides);
    onSave(snapshot);
    setIsSaving(false);
    setLastSavedTime('Tersimpan otomatis');
  };

  // Debounced auto-save on keystrokes
  const triggerDebouncedSave = (overrides?: Partial<Note>) => {
    if (isClosingRef.current) return;
    setIsSaving(true);
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = window.setTimeout(() => {
      saveImmediately(overrides);
    }, 350);
  };

  // Safe close handler: guarantees save and then closes without glitch
  const handleSafeClose = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isClosingRef.current) return;
    isClosingRef.current = true;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    // Save final version synchronously
    const finalNote = getNoteSnapshot();
    onSave(finalNote);

    // Call close to exit editor
    onClose();
  };

  // Auto-resize textarea so content expands naturally
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, 220)}px`;
    }
  }, [content]);

  // Text formatting helper
  const insertFormatting = (prefix: string, suffix: string = '') => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const currentText = el.value;
    const selectedText = currentText.substring(start, end);
    const newText = currentText.substring(0, start) + prefix + selectedText + suffix + currentText.substring(end);
    
    setContent(newText);
    triggerDebouncedSave({ content: newText });

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 50);
  };

  // Add tag
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const clean = tagInput.trim().replace(/^#/, '');
      if (clean && !tags.includes(clean)) {
        const nextTags = [...tags, clean];
        setTags(nextTags);
        saveImmediately({ tags: nextTags });
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const nextTags = tags.filter((t) => t !== tagToRemove);
    setTags(nextTags);
    saveImmediately({ tags: nextTags });
  };

  // Checklist actions
  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;
    const newItem: ChecklistItem = {
      id: 'chk-' + Date.now(),
      text: newChecklistText.trim(),
      done: false,
    };
    const nextChecklists = [...checklists, newItem];
    setChecklists(nextChecklists);
    setNewChecklistText('');
    saveImmediately({ checklists: nextChecklists });
  };

  const handleToggleChecklist = (id: string) => {
    const nextChecklists = checklists.map((c) =>
      c.id === id ? { ...c, done: !c.done } : c
    );
    setChecklists(nextChecklists);
    saveImmediately({ checklists: nextChecklists });
  };

  const handleDeleteChecklist = (id: string) => {
    const nextChecklists = checklists.filter((c) => c.id !== id);
    setChecklists(nextChecklists);
    saveImmediately({ checklists: nextChecklists });
  };

  // Export note actions
  const handleCopyContent = () => {
    let fullText = `${title}\n\n${content}`;
    if (checklists.length > 0) {
      fullText += '\n\n--- DAFTAR TUGAS ---\n' + checklists.map((c) => `[${c.done ? 'X' : ' '}] ${c.text}`).join('\n');
    }
    navigator.clipboard.writeText(fullText);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    let md = `# ${title || 'Catatan'}\n\n`;
    md += `*Kategori: ${category} | Diperbarui: ${formatDateDetailed(note.updatedAt)}*\n\n`;
    if (tags.length > 0) {
      md += `Tags: ${tags.map((t) => `#${t}`).join(' ')}\n\n`;
    }
    md += `${content}\n\n`;
    if (checklists.length > 0) {
      md += `## Daftar Tugas\n`;
      checklists.forEach((c) => {
        md += `- [${c.done ? 'x' : ' '}] ${c.text}\n`;
      });
    }

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(title || 'catatan').toLowerCase().replace(/\s+/g, '-')}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  // Word count & stats
  const wordCount = content.trim() ? content.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = content.length;
  const readTimeMin = Math.ceil(wordCount / 200) || 1;

  // Background tone classes
  let containerBg = 'bg-[#FAF8F5]';
  if (colorTone === 'cream') containerBg = 'bg-[#FAF6EE]';
  if (colorTone === 'tosca-light') containerBg = 'bg-[#EBF7F5]';
  if (colorTone === 'sage') containerBg = 'bg-[#F2F7F4]';
  if (colorTone === 'sand') containerBg = 'bg-[#F7F3EA]';

  return (
    <div className={`fixed inset-0 z-40 flex flex-col ${containerBg} text-[#1E2B27] transition-colors duration-200 overflow-y-auto`}>
      {/* Editor Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E8DDCB] px-3 sm:px-6 py-2.5 flex items-center justify-between no-print shadow-xs">
        <div className="flex items-center gap-2">
          {/* Back button */}
          <button
            type="button"
            onClick={handleSafeClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#10625B] hover:bg-[#E8DDCB]/50 transition-colors cursor-pointer"
            aria-label="Kembali ke daftar catatan"
            title="Kembali dan simpan"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="hidden sm:flex flex-col">
            <span className="font-semibold text-sm text-[#10625B] truncate max-w-[200px]">
              {title || 'Catatan Baru'}
            </span>
            <span className="text-[10px] text-[#71827C] flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${isSaving ? 'bg-amber-500 animate-ping' : 'bg-[#127970]'}`} />
              <span>{isSaving ? 'Menyimpan...' : lastSavedTime}</span>
            </span>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Tone Picker Button */}
          <div className="relative group">
            <div className="flex items-center gap-1 bg-white/70 border border-[#E8DDCB] rounded-xl px-1.5 py-1">
              {(['default', 'cream', 'tosca-light', 'sage', 'sand'] as NoteColorTone[]).map((t) => {
                let col = 'bg-white border-[#E8DDCB]';
                if (t === 'cream') col = 'bg-[#FAF6EE] border-[#E8DDCB]';
                if (t === 'tosca-light') col = 'bg-[#D2EFEB] border-[#127970]';
                if (t === 'sage') col = 'bg-[#DCE8E1] border-[#71827C]';
                if (t === 'sand') col = 'bg-[#E8DFC9] border-[#D8C7AE]';
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setColorTone(t);
                      saveImmediately({ colorTone: t });
                    }}
                    className={`w-5 h-5 rounded-full border transition-transform cursor-pointer ${col} ${
                      colorTone === t ? 'ring-2 ring-[#127970] scale-110' : 'opacity-80 hover:opacity-100'
                    }`}
                    title={`Warna: ${t}`}
                  />
                );
              })}
            </div>
          </div>

          {/* Favorite Toggle */}
          <button
            type="button"
            onClick={() => {
              const nextFav = !isFavorite;
              setIsFavorite(nextFav);
              saveImmediately({ isFavorite: nextFav });
            }}
            className={`min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl hover:bg-black/5 transition-colors cursor-pointer ${
              isFavorite ? 'text-amber-500 fill-amber-500' : 'text-[#71827C]'
            }`}
            title="Tandai Favorit"
            aria-label="Tandai Favorit"
          >
            <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-500' : ''}`} />
          </button>

          {/* Lock Note with PIN */}
          <button
            type="button"
            onClick={() => {
              onRequestPinModal(getNoteSnapshot(), !isLocked);
            }}
            className={`min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl hover:bg-black/5 transition-colors cursor-pointer ${
              isLocked ? 'text-[#127970] bg-[#EBF7F5]' : 'text-[#71827C]'
            }`}
            title={isLocked ? 'Ubah atau Buka Kunci PIN' : 'Kunci dengan PIN'}
            aria-label="Kunci Catatan"
          >
            {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </button>

          {/* Copy to clipboard */}
          <button
            type="button"
            onClick={handleCopyContent}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-[#71827C] hover:bg-black/5 transition-colors cursor-pointer relative"
            title="Salin Teks"
            aria-label="Salin Teks"
          >
            <Share2 className="w-4 h-4" />
            {copiedToast && (
              <span className="absolute -bottom-7 right-0 text-[10px] bg-[#127970] text-white px-2 py-0.5 rounded shadow-sm whitespace-nowrap animate-fade-in">
                Tersalin!
              </span>
            )}
          </button>

          {/* Markdown Download */}
          <button
            type="button"
            onClick={handleDownloadMarkdown}
            className="hidden sm:flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl text-[#71827C] hover:bg-black/5 transition-colors cursor-pointer"
            title="Unduh Markdown (.md)"
            aria-label="Unduh Markdown"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Print PDF */}
          <button
            type="button"
            onClick={handlePrint}
            className="hidden sm:flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl text-[#71827C] hover:bg-black/5 transition-colors cursor-pointer"
            title="Cetak atau Simpan PDF"
            aria-label="Cetak Catatan"
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* Done / Save Button (Calls handleSafeClose) */}
          <button
            type="button"
            onClick={handleSafeClose}
            className="px-4 py-2 rounded-xl bg-[#127970] text-white text-xs font-semibold hover:bg-[#10625B] active:scale-95 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ml-1"
            title="Simpan dan tutup"
          >
            <Check className="w-4 h-4" />
            <span>Selesai</span>
          </button>
        </div>
      </header>

      {/* Editor Main Canvas */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-8 py-6 pb-28 flex flex-col">
        {/* Category & Info Row */}
        <div className="flex flex-wrap items-center gap-3 pb-4 mb-4 border-b border-[#E8DDCB]/60 text-xs text-[#71827C] no-print">
          {/* Category selection */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-[#71827C]">Kategori:</span>
            <select
              value={category}
              onChange={(e) => {
                const newCat = e.target.value;
                setCategory(newCat);
                saveImmediately({ category: newCat });
              }}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-[#E8DDCB] text-xs text-[#1E2B27] font-medium focus:outline-none focus:border-[#127970] cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <span aria-hidden="true" className="text-[#D8C7AE]">·</span>

          {/* Pin toggle status (Sematkan di Atas) */}
          <button
            type="button"
            onClick={() => {
              const nextPin = !isPinned;
              setIsPinned(nextPin);
              saveImmediately({ isPinned: nextPin });
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              isPinned ? 'bg-[#EBF7F5] text-[#10625B] border border-[#D2EFEB]' : 'hover:bg-black/5 text-[#71827C] border border-transparent'
            }`}
            title={isPinned ? 'Lepas sematan' : 'Sematkan di atas'}
          >
            <span className={`w-2 h-2 rounded-full ${isPinned ? 'bg-[#127970]' : 'bg-[#71827C]/40'}`} />
            <span>{isPinned ? 'Disematkan di Atas' : 'Sematkan ke Atas'}</span>
          </button>

          <span aria-hidden="true" className="text-[#D8C7AE]">·</span>

          {/* Time display */}
          <div className="flex items-center gap-1 text-[11px] text-[#71827C]">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatDateDetailed(note.updatedAt || new Date().toISOString())}</span>
          </div>
        </div>

        {/* 1. Title Input */}
        <div className="mb-2">
          <input
            type="text"
            value={title}
            onChange={(e) => {
              const val = e.target.value;
              setTitle(val);
              triggerDebouncedSave({ title: val });
            }}
            onBlur={() => saveImmediately({ title })}
            placeholder="Judul Catatan..."
            className="w-full text-2xl sm:text-3xl font-bold text-[#1E2B27] placeholder-[#71827C]/40 bg-transparent border-none focus:outline-none tracking-tight break-words"
          />
        </div>

        {/* 2. Formatting Toolbar */}
        <div className="flex items-center flex-wrap gap-1 py-1.5 px-2 rounded-xl bg-white/80 border border-[#E8DDCB] my-3 text-[#3A4B45] text-xs no-print shadow-xs">
          <button
            type="button"
            onClick={() => insertFormatting('**', '**')}
            className="px-2 py-1 rounded hover:bg-[#F3ECE0] font-bold text-xs cursor-pointer"
            title="Tebal (Bold)"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('*', '*')}
            className="px-2 py-1 rounded hover:bg-[#F3ECE0] italic text-xs cursor-pointer"
            title="Miring (Italic)"
          >
            I
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('~~', '~~')}
            className="px-2 py-1 rounded hover:bg-[#F3ECE0] line-through text-xs cursor-pointer"
            title="Coret (Strikethrough)"
          >
            S
          </button>
          <div className="w-px h-3.5 bg-[#E8DDCB] mx-1" />
          <button
            type="button"
            onClick={() => insertFormatting('# ')}
            className="px-2 py-1 rounded hover:bg-[#F3ECE0] font-bold text-xs cursor-pointer"
            title="Judul Bab 1"
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('## ')}
            className="px-2 py-1 rounded hover:bg-[#F3ECE0] font-bold text-xs cursor-pointer"
            title="Judul Bab 2"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('> ')}
            className="px-2 py-1 rounded hover:bg-[#F3ECE0] text-xs cursor-pointer"
            title="Kutipan / Quote"
          >
            “ ”
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('- ')}
            className="px-2 py-1 rounded hover:bg-[#F3ECE0] text-xs cursor-pointer"
            title="Daftar Poin"
          >
            • Poin
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('1. ')}
            className="px-2 py-1 rounded hover:bg-[#F3ECE0] text-xs cursor-pointer"
            title="Daftar Nomor"
          >
            1. Angka
          </button>

          <div className="w-px h-3.5 bg-[#E8DDCB] mx-1" />

          {/* Checklist Mode toggle button */}
          <button
            type="button"
            onClick={() => {
              setShowChecklistMode(!showChecklistMode);
            }}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors font-medium cursor-pointer ${
              showChecklistMode
                ? 'bg-[#127970] text-white shadow-xs'
                : 'hover:bg-[#F3ECE0] text-[#10625B]'
            }`}
            title="Aktifkan Mode Checklist"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Checklist</span>
          </button>
        </div>

        {/* 3. Interactive Checklist Area (if enabled) */}
        {showChecklistMode && (
          <div className="mb-4 p-4 rounded-2xl bg-white border border-[#E8DDCB] shadow-xs">
            <div className="flex items-center justify-between mb-3 text-xs text-[#71827C]">
              <span className="font-semibold text-[#10625B] flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-[#127970]" />
                <span>Daftar Tugas Interaktif</span>
              </span>
              <span className="tabular-nums">
                {checklists.filter((c) => c.done).length} dari {checklists.length} selesai
              </span>
            </div>

            {/* Checklist items list */}
            <div className="space-y-2 mb-3">
              {checklists.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2.5 group p-2 rounded-xl hover:bg-[#FAF6EE] transition-colors"
                >
                  <label className="flex items-center gap-2.5 flex-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => handleToggleChecklist(item.id)}
                      className="w-4 h-4 rounded text-[#127970] focus:ring-[#127970] accent-[#127970] cursor-pointer"
                    />
                    <span
                      className={`text-xs sm:text-sm break-words ${
                        item.done ? 'line-through text-[#71827C]' : 'text-[#1E2B27]'
                      }`}
                    >
                      {item.text}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleDeleteChecklist(item.id)}
                    className="opacity-40 group-hover:opacity-100 text-[#71827C] hover:text-rose-600 p-1 transition-opacity cursor-pointer"
                    title="Hapus tugas"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add checklist input */}
            <form onSubmit={handleAddChecklist} className="flex gap-2">
              <input
                type="text"
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                placeholder="+ Tambah tugas baru..."
                className="flex-1 px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8DDCB] text-xs text-[#1E2B27] placeholder-[#71827C]/60 focus:outline-none focus:border-[#127970]"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#127970] text-white text-xs font-medium hover:bg-[#10625B] transition-colors cursor-pointer"
              >
                Tambah
              </button>
            </form>
          </div>
        )}

        {/* 4. Description / Note Content Area */}
        <div className="w-full flex-1 mt-1">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => {
              const val = e.target.value;
              setContent(val);
              triggerDebouncedSave({ content: val });
            }}
            onBlur={() => saveImmediately({ content })}
            placeholder="Tuliskan deskripsi atau isi catatan di sini..."
            className="w-full min-h-[260px] bg-transparent border-none text-[#1E2B27] placeholder-[#71827C]/50 text-sm sm:text-base leading-relaxed focus:outline-none resize-none font-sans font-normal break-words whitespace-pre-wrap block overflow-hidden"
          />
        </div>

        {/* 5. Tags management */}
        <div className="flex flex-wrap items-center gap-1.5 mt-4 pt-3 border-t border-[#E8DDCB]/40 no-print">
          <span className="text-[11px] text-[#71827C] font-medium mr-1">Tag:</span>
          {tags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 text-xs text-[#10625B] bg-[#EBF7F5] border border-[#D2EFEB] px-2.5 py-0.5 rounded-full"
            >
              <span>#{t}</span>
              <button
                type="button"
                onClick={() => handleRemoveTag(t)}
                className="hover:text-rose-600 transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="+ Tambah tag (Enter)"
            className="text-xs bg-transparent border-none text-[#1E2B27] placeholder-[#71827C]/50 px-2 py-0.5 focus:outline-none max-w-[150px]"
          />
        </div>

        {/* Footer Statistics */}
        <footer className="pt-4 mt-6 border-t border-[#E8DDCB]/60 flex items-center justify-between text-[11px] text-[#71827C] no-print">
          <div className="flex items-center gap-3">
            <span>{wordCount} kata</span>
            <span aria-hidden="true">·</span>
            <span>{charCount} karakter</span>
            <span aria-hidden="true">·</span>
            <span>~{readTimeMin} mnt baca</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Pindahkan catatan ini ke sampah?')) {
                  onDelete(note.id);
                  onClose();
                }
              }}
              className="text-[#71827C] hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Catatan</span>
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
};
