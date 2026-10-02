import React, { useState, useEffect } from 'react';
import { Lock, X, Check, KeyRound } from 'lucide-react';

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  correctPin?: string;
  isSettingNewPin?: boolean;
  onSetPin?: (newPin: string) => void;
  noteTitle?: string;
}

export const PinModal: React.FC<PinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  correctPin,
  isSettingNewPin = false,
  onSetPin,
  noteTitle,
}) => {
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [confirmStep, setConfirmStep] = useState<boolean>(false);
  const [firstPin, setFirstPin] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setErrorMsg('');
      setConfirmStep(false);
      setFirstPin('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      setErrorMsg('');

      if (nextPin.length === 4) {
        handleCompletePin(nextPin);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleCompletePin = (enteredPin: string) => {
    if (isSettingNewPin) {
      if (!confirmStep) {
        setFirstPin(enteredPin);
        setConfirmStep(true);
        setPin('');
      } else {
        if (enteredPin === firstPin) {
          if (onSetPin) onSetPin(enteredPin);
          onSuccess();
          onClose();
        } else {
          setErrorMsg('PIN konfirmasi tidak cocok. Coba lagi.');
          setPin('');
          setConfirmStep(false);
          setFirstPin('');
        }
      }
    } else {
      if (enteredPin === correctPin) {
        onSuccess();
        onClose();
      } else {
        setErrorMsg('PIN salah. Silakan coba lagi.');
        setPin('');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E2B27]/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xs bg-[#FAF6EE] border border-[#E8DDCB] rounded-3xl p-6 shadow-xl text-[#1E2B27]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#E8DDCB]/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#127970]/10 flex items-center justify-center text-[#127970]">
              <Lock className="w-4 h-4" />
            </div>
            <span className="font-serif text-base font-semibold tracking-tight text-[#10625B]">
              {isSettingNewPin
                ? confirmStep
                  ? 'Konfirmasi PIN Baru'
                  : 'Atur PIN Keamanan'
                : 'Catatan Terkunci'}
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

        <div className="py-5 text-center">
          <p className="text-xs text-[#71827C] mb-4 line-clamp-1">
            {noteTitle
              ? `Akses: ${noteTitle}`
              : isSettingNewPin
              ? confirmStep
                ? 'Masukkan kembali 4 angka PIN Anda'
                : 'Buat 4 angka PIN untuk mengunci catatan ini'
              : 'Masukkan 4 angka PIN untuk membuka catatan'}
          </p>

          {/* 4 dots indicator */}
          <div className="flex justify-center items-center gap-4 my-3">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                  pin.length > idx
                    ? 'bg-[#127970] scale-110 shadow-xs'
                    : 'bg-[#E8DDCB] border border-[#D8C7AE]'
                }`}
              />
            ))}
          </div>

          {errorMsg ? (
            <p className="text-xs font-medium text-rose-700 mt-3 animate-shake">{errorMsg}</p>
          ) : (
            <p className="text-[11px] text-[#71827C]/70 mt-3">
              {!isSettingNewPin && correctPin === '1234' ? 'Petunjuk demo: PIN bawaan adalah 1234' : 'Gunakan 4 digit angka'}
            </p>
          )}
        </div>

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2.5 pt-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeyPress(digit)}
              className="h-12 rounded-2xl bg-white border border-[#E8DDCB] text-lg font-medium text-[#1E2B27] hover:bg-[#EBF7F5] hover:text-[#127970] active:scale-95 transition-all shadow-xs flex items-center justify-center cursor-pointer"
            >
              {digit}
            </button>
          ))}
          <div className="flex items-center justify-center">
            {isSettingNewPin && (
              <button
                type="button"
                onClick={() => {
                  if (onSetPin) onSetPin('');
                  onSuccess();
                  onClose();
                }}
                className="text-[11px] text-rose-600 hover:underline px-2 py-1"
                title="Hapus Kunci PIN"
              >
                Hapus Kunci
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="h-12 rounded-2xl bg-white border border-[#E8DDCB] text-lg font-medium text-[#1E2B27] hover:bg-[#EBF7F5] hover:text-[#127970] active:scale-95 transition-all shadow-xs flex items-center justify-center cursor-pointer"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="h-12 rounded-2xl bg-[#F3ECE0] border border-[#E8DDCB] text-xs font-medium text-[#71827C] hover:bg-[#E8DDCB] active:scale-95 transition-all flex items-center justify-center cursor-pointer"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
};
