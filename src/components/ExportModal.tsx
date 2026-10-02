import React, { useRef, useState } from 'react';
import { X, Download, Upload, RefreshCw, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Note } from '../types';
import { exportNotesToJson, INITIAL_SEED_NOTES, saveNotesToStorage } from '../utils/storage';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: Note[];
  onImportNotes: (importedNotes: Note[]) => void;
  onClearAllNotes?: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  notes,
  onImportNotes,
  onClearAllNotes,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError?: boolean } | null>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    exportNotesToJson(notes);
    setStatusMsg({ text: 'Cadangan data NatNOTE berhasil diunduh!' });
    setTimeout(() => setStatusMsg(null), 3500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          onImportNotes(parsed);
          saveNotesToStorage(parsed);
          setStatusMsg({ text: `Berhasil memuat ${parsed.length} catatan dari file!` });
          setTimeout(() => {
            setStatusMsg(null);
            onClose();
          }, 1500);
        } else {
          setStatusMsg({ text: 'Format file tidak sesuai. Pastikan file JSON dari NatNOTE.', isError: true });
        }
      } catch (err) {
        setStatusMsg({ text: 'Gagal membaca file JSON. Cek integritas file.', isError: true });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E2B27]/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-[#FAF6EE] border border-[#E8DDCB] rounded-3xl p-6 shadow-xl text-[#1E2B27]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#E8DDCB]/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#127970]/10 flex items-center justify-center text-[#127970]">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-semibold text-[#10625B]">
                Cadangan & Impor NatNOTE
              </h2>
              <p className="text-[11px] text-[#71827C]">Kelola data catatan pribadi Anda secara mandiri & privat</p>
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

        {statusMsg && (
          <div className={`mt-4 p-3 rounded-xl flex items-center gap-2 text-xs font-medium ${statusMsg.isError ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-[#EBF7F5] text-[#127970] border border-[#ABE1D9]'}`}>
            {statusMsg.isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        <div className="space-y-3 my-5">
          {/* Export button */}
          <div className="bg-white border border-[#E8DDCB] rounded-2xl p-4 flex items-center justify-between hover:border-[#127970]/40 transition-colors">
            <div>
              <h3 className="text-xs font-semibold text-[#1E2B27]">Unduh Cadangan (JSON)</h3>
              <p className="text-[11px] text-[#71827C] mt-0.5">Simpan semua {notes.length} catatan ke file lokal</p>
            </div>
            <button
              onClick={handleExport}
              className="px-3.5 py-2 rounded-xl bg-[#127970] text-white text-xs font-medium hover:bg-[#10625B] active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh</span>
            </button>
          </div>

          {/* Import button */}
          <div className="bg-white border border-[#E8DDCB] rounded-2xl p-4 flex items-center justify-between hover:border-[#127970]/40 transition-colors">
            <div>
              <h3 className="text-xs font-semibold text-[#1E2B27]">Pulihkan dari File</h3>
              <p className="text-[11px] text-[#71827C] mt-0.5">Muat file cadangan JSON NatNOTE yang tersimpan</p>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 rounded-xl bg-white border border-[#127970] text-[#127970] text-xs font-medium hover:bg-[#EBF7F5] active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Pilih File</span>
              </button>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-[#E8DDCB]/60 flex items-center justify-between text-[11px] text-[#71827C]">
          <span>Data tersimpan privat offline di peramban Anda</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-medium text-[#71827C] hover:bg-[#F3ECE0] transition-colors"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
