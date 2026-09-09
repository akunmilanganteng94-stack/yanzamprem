import React, { useState, useEffect } from 'react';
import { MessageSquare, ExternalLink, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const STORAGE_KEY = 'yanzstr_wa_popup_dismissed';
const YANZSTR_LOGO_URL = 'https://cdn.phototourl.com/free/2026-09-09-ad32f784-664e-4789-a562-cf7b35289053.jpg';

export default function WhatsAppModal({ isOpen: propIsOpen, forceOpen, onClose }: { isOpen?: boolean; forceOpen?: boolean; onClose?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (typeof propIsOpen === 'boolean') {
      setIsOpen(propIsOpen);
      return;
    }
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
  }, [propIsOpen, forceOpen]);

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 10 }}
            className="relative w-full max-w-md bg-[#0d071a] border border-purple-500/40 rounded-3xl p-6 shadow-2xl overflow-hidden shadow-purple-900/40"
          >
            {/* Ambient purple glow */}
            <div className="absolute -top-20 -right-20 w-44 h-44 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

            <button
              id="close-wa-modal-btn"
              onClick={handleDismiss}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center space-y-4">
              {/* YANZSTR Logo */}
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-purple-500/60 shadow-xl shadow-purple-600/20 group">
                <img
                  src={YANZSTR_LOGO_URL}
                  alt="YANZSTR Logo"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/30 text-[10px] font-bold text-purple-300 mb-1 uppercase tracking-wider">
                  Official Community
                </div>
                <h3 className="text-xl font-black text-white tracking-tight">
                  Saluran WhatsApp YANZSTR
                </h3>
                <p className="text-xs text-zinc-300 max-w-sm leading-relaxed">
                  Dapatkan update restok akun Alight Motion tercepat, giveaway promo eksklusif, serta layanan bantuan pelanggan resmi.
                </p>
              </div>

              <div className="flex flex-col w-full gap-2.5 pt-2">
                <button
                  id="join-wa-btn"
                  onClick={handleJoin}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs tracking-wide transition-all shadow-lg shadow-purple-600/30 active:scale-[0.98]"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Gabung Saluran WhatsApp</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                </button>
                <button
                  id="dismiss-wa-btn"
                  onClick={handleDismiss}
                  className="w-full py-2.5 px-4 rounded-xl border border-purple-900/60 text-zinc-400 hover:text-white hover:bg-purple-950/30 text-xs font-semibold transition-all"
                >
                  Nanti Saja
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
