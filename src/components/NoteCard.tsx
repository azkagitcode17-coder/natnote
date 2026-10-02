import React, { useState } from 'react';
import { Pin, Star, Lock, CheckSquare, Trash2, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { Note } from '../types';
import { formatTimeAgo } from '../utils/storage';

interface NoteCardProps {
  note: Note;
  onOpen: (note: Note) => void;
  onTogglePin: (id: string, e: React.MouseEvent) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onRestore?: (id: string, e: React.MouseEvent) => void;
  onPermanentDelete?: (id: string, e: React.MouseEvent) => void;
  isTrashView?: boolean;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onOpen,
  onTogglePin,
  onToggleFavorite,
  onDelete,
  onRestore,
  onPermanentDelete,
  isTrashView = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Determine color tone background
  let bgClass = 'bg-white border-[#EFECE6] hover:border-[#127970]/40';
  if (note.colorTone === 'cream') {
    bgClass = 'bg-[#FAF6EE] border-[#E8DFC9] hover:border-[#127970]/40';
  } else if (note.colorTone === 'tosca-light') {
    bgClass = 'bg-[#EBF7F5] border-[#D2EFEB] hover:border-[#199489]/50';
  } else if (note.colorTone === 'sage') {
    bgClass = 'bg-[#F2F7F4] border-[#DCE8E1] hover:border-[#127970]/40';
  } else if (note.colorTone === 'sand') {
    bgClass = 'bg-[#F7F3EA] border-[#E8DFC9] hover:border-[#127970]/40';
  }

  // Checklist stats
  const checklists = note.checklists || [];
  const hasChecklists = checklists.length > 0;
  const completedChecklists = checklists.filter((c) => c.done).length;
  const checklistPct = hasChecklists
    ? Math.round((completedChecklists / checklists.length) * 100)
    : 0;

  const isLongContent = note.content && note.content.length > 180;

  return (
    <article
      onClick={() => onOpen(note)}
      className={`group relative rounded-2xl border p-4.5 sm:p-5 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between ${bgClass} select-none`}
    >
      <div>
        {/* Top meta row with zero-pill discipline */}
        <div className="flex items-center justify-between gap-2 mb-2 text-xs text-[#71827C]">
          <div className="flex items-center gap-1.5 truncate">
            {note.isPinned && (
              <span className="flex items-center gap-1 text-[#10625B] font-semibold text-[11px]">
                <Pin className="w-3 h-3 rotate-45 fill-[#10625B]" />
                <span>Disematkan</span>
                <span aria-hidden="true" className="text-[#D8C7AE]">·</span>
              </span>
            )}
            <span className="font-medium text-[#10625B] truncate max-w-[130px]">
              {note.category || 'Catatan Pribadi'}
            </span>
            <span aria-hidden="true" className="text-[#D8C7AE]">·</span>
            <span className="shrink-0">{formatTimeAgo(note.updatedAt)}</span>
          </div>

          {/* Quick interaction buttons */}
          {!isTrashView && (
            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={(e) => onTogglePin(note.id, e)}
                className={`p-1.5 rounded-lg hover:bg-black/5 transition-colors ${
                  note.isPinned ? 'text-[#127970]' : 'text-[#71827C]/70 hover:text-[#127970]'
                }`}
                title={note.isPinned ? 'Lepas sematan' : 'Sematkan di atas'}
                aria-label="Sematkan catatan"
              >
                <Pin className={`w-3.5 h-3.5 ${note.isPinned ? 'rotate-45 fill-[#127970]' : ''}`} />
              </button>
              <button
                type="button"
                onClick={(e) => onToggleFavorite(note.id, e)}
                className={`p-1.5 rounded-lg hover:bg-black/5 transition-colors ${
                  note.isFavorite ? 'text-amber-500 fill-amber-500' : 'text-[#71827C]/70 hover:text-amber-500'
                }`}
                title={note.isFavorite ? 'Hapus dari favorit' : 'Tambah ke favorit'}
                aria-label="Tandai favorit"
              >
                <Star className={`w-3.5 h-3.5 ${note.isFavorite ? 'fill-amber-400 text-amber-500' : ''}`} />
              </button>
            </div>
          )}
        </div>

        {/* Note Title */}
        <h3 className="font-serif text-base sm:text-lg font-semibold text-[#1E2B27] leading-snug tracking-tight mb-2 group-hover:text-[#10625B] transition-colors break-words">
          {note.title || 'Catatan Tanpa Judul'}
        </h3>

        {/* Content Preview or Locked State */}
        {note.isLocked ? (
          <div className="py-4 my-1 px-3.5 rounded-xl bg-black/5 border border-black/5 flex items-center gap-2.5 text-xs text-[#71827C]">
            <Lock className="w-4 h-4 text-[#127970] shrink-0" />
            <span className="font-medium text-[#1E2B27]">Catatan Terkunci dengan PIN</span>
          </div>
        ) : (
          <>
            {/* Checklist preview if present */}
            {hasChecklists && (
              <div className="my-2.5 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-[#71827C]">
                  <span className="flex items-center gap-1 font-medium">
                    <CheckSquare className="w-3.5 h-3.5 text-[#127970]" />
                    <span>Daftar Tugas</span>
                  </span>
                  <span className="tabular-nums">
                    {completedChecklists}/{checklists.length} ({checklistPct}%)
                  </span>
                </div>
                <div className="w-full bg-[#E8DDCB]/60 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#127970] h-full transition-all duration-300 rounded-full"
                    style={{ width: `${checklistPct}%` }}
                  />
                </div>
                <ul className="text-xs text-[#3A4B45] space-y-1 pt-1">
                  {checklists.slice(0, 4).map((item) => (
                    <li key={item.id} className="flex items-center gap-2">
                      <span
                        className={`w-3 h-3 rounded-[3px] border flex items-center justify-center shrink-0 ${
                          item.done
                            ? 'bg-[#127970] border-[#127970] text-white'
                            : 'border-[#D8C7AE] bg-white'
                        }`}
                      >
                        {item.done && <span className="text-[9px] leading-none">✓</span>}
                      </span>
                      <span className={`text-xs break-words ${item.done ? 'line-through text-[#71827C]' : ''}`}>
                        {item.text}
                      </span>
                    </li>
                  ))}
                  {checklists.length > 4 && (
                    <li className="text-[11px] text-[#71827C] italic pl-5">
                      +{checklists.length - 4} butir tugas lainnya...
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Note text description without being awkwardly cut off */}
            {note.content && (!hasChecklists || note.content.length > 15) && (
              <div className="mb-3">
                <p 
                  className={`text-xs sm:text-[13px] text-[#3A4B45] leading-relaxed whitespace-pre-line font-sans font-normal break-words ${
                    !isExpanded && isLongContent ? 'line-clamp-6' : ''
                  }`}
                >
                  {note.content}
                </p>
                {isLongContent && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsExpanded(!isExpanded);
                    }}
                    className="mt-1 text-[11px] font-medium text-[#127970] hover:text-[#10625B] flex items-center gap-0.5 cursor-pointer py-0.5"
                  >
                    <span>{isExpanded ? 'Sembunyikan' : 'Baca selengkapnya'}</span>
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer info: tags & actions */}
      <div className="pt-3 mt-2 border-t border-[#E8DDCB]/40 flex items-center justify-between text-xs text-[#71827C]">
        <div className="flex items-center gap-1.5 flex-wrap truncate max-w-[70%]">
          {note.tags && note.tags.length > 0 ? (
            note.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="text-[11px] text-[#10625B]/90 font-medium">
                #{tag}
              </span>
            ))
          ) : (
            <span className="text-[11px] text-[#71827C]/70">Pribadi</span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {isTrashView ? (
            <>
              <button
                type="button"
                onClick={(e) => onRestore && onRestore(note.id, e)}
                className="p-1.5 rounded-lg text-[#127970] hover:bg-[#EBF7F5] transition-colors"
                title="Pulihkan catatan"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => onPermanentDelete && onPermanentDelete(note.id, e)}
                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                title="Hapus permanen"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={(e) => onDelete(note.id, e)}
              className="p-1.5 rounded-lg text-[#71827C]/60 hover:text-rose-600 hover:bg-rose-50/50 transition-colors"
              title="Pindahkan ke sampah"
              aria-label="Hapus catatan"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
