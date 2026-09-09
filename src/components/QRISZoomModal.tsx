import React from 'react';
import { X, ZoomIn } from 'lucide-react';
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
          className="relative max-w-sm w-full bg-[#0c0818] border border-purple-500/30 rounded-3xl p-5 shadow-2xl flex flex-col items-center shadow-purple-900/30"
        >
          <button
            id="close-qris-zoom-btn"
            onClick={onClose}
            className="absolute top-3 right-3 text-zinc-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 mb-3 self-start">
            <ZoomIn className="w-4 h-4 text-purple-400" />
            <h4 className="text-sm font-bold text-white">Scan QRIS Resmi YANZSTR</h4>
          </div>

          <div className="w-full bg-white rounded-2xl p-3 shadow-inner flex items-center justify-center overflow-hidden border border-purple-500/20">
            <img
              src={imageUrl}
              alt="QRIS YANZSTR"
              className="w-full h-auto object-contain rounded-xl select-none"
              referrerPolicy="no-referrer"
            />
          </div>

          <p className="text-[11px] text-zinc-300 text-center mt-3 leading-relaxed">
            Buka aplikasi BCA, GoPay, OVO, Dana, ShopeePay, atau m-Banking Anda, lalu scan QRIS di atas.
          </p>

          <div className="w-full flex gap-2 mt-4">
            <button
              id="qris-zoom-close-action"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition-colors shadow-lg shadow-purple-600/25"
            >
              Tutup QRIS
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
