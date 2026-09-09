import React, { useState, useEffect } from 'react';
import { MessageSquare, ExternalLink, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const STORAGE_KEY = 'yanzstr_wa_popup_dismissed';

export default function WhatsAppModal({ forceOpen, onClose }: { forceOpen?: boolean; onClose?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      return;
    }
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [forceOpen]);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsOpen(false);
    if (onClose) onClose();
  };

  const handleJoin = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    window.open('https://whatsapp.com/channel/0029Vb7mnNA05MUcyKEy2W1E', '_blank', 'noopener,noreferrer');
    setIsOpen(false);
    if (onClose) onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 10 }}
            className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl overflow-hidden"
          >
            {/* Ambient glow */}
            <div className="absolute -top-16 -right-16 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <button
              id="close-wa-modal-btn"
              onClick={handleDismiss}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
                {/* WhatsApp SVG Logo */}
                <svg className="w-9 h-9 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Gabung Saluran WhatsApp YANZSTR
                </h3>
                <p className="text-sm text-zinc-400 max-w-sm">
                  «Dapatkan update stok, promo, dan informasi terbaru YANZSTR.»
                </p>
              </div>

              <div className="flex flex-col w-full gap-2.5 pt-2">
                <button
                  id="join-wa-btn"
                  onClick={handleJoin}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
                >
                  <MessageSquare className="w-4 h-4" />
                  Gabung Sekarang
                  <ExternalLink className="w-4 h-4 ml-0.5" />
                </button>

                <button
                  id="dismiss-wa-btn"
                  onClick={handleDismiss}
                  className="w-full py-2.5 px-4 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 text-sm font-medium transition-all"
                >
                  Nanti
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
