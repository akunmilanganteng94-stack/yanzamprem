import React from 'react';
import { X, ZoomIn, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface QRISZoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
}

export default function QRISZoomModal({ isOpen, onClose, imageUrl }: QRISZoomModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative max-w-sm w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-2xl flex flex-col items-center"
        >
          <button
            id="close-qris-zoom-btn"
            onClick={onClose}
            className="absolute top-3 right-3 text-zinc-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-3 self-start">
            <ZoomIn className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-bold text-white">Scan QRIS YANZSTR</h4>
          </div>

          <div className="w-full bg-white rounded-xl p-3 shadow-inner flex items-center justify-center overflow-hidden">
            <img
              src={imageUrl}
              alt="QRIS YANZSTR"
              className="w-full h-auto object-contain rounded-lg select-none"
              referrerPolicy="no-referrer"
            />
          </div>

          <p className="text-[11px] text-zinc-400 text-center mt-3">
            Buka aplikasi BCA, GoPay, OVO, Dana, ShopeePay atau m-Banking Anda, lalu scan QRIS di atas.
          </p>

          <div className="w-full flex gap-2 mt-4">
            <button
              id="qris-zoom-close-action"
              onClick={onClose}
              className="w-full py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition-colors"
            >
              Tutup
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
