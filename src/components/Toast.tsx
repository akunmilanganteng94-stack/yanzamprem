import React from 'react';
import { useStore } from '../context/StoreContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Toast() {
  const { toasts, removeToast } = useStore();

  return (
    <aside aria-label="Notifikasi sistem" className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-3 sm:px-0">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl border backdrop-blur-xl shadow-2xl ${
              t.type === 'success'
                ? 'bg-[#0f0920]/95 border-purple-500/50 text-purple-200 shadow-purple-500/10'
                : t.type === 'error'
                ? 'bg-[#1a0812]/95 border-rose-500/50 text-rose-200 shadow-rose-500/10'
                : t.type === 'warning'
                ? 'bg-[#1a1208]/95 border-amber-500/50 text-amber-200 shadow-amber-500/10'
                : 'bg-[#0c081c]/95 border-purple-800/60 text-zinc-200 shadow-purple-900/20'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-purple-400" />}
              {t.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
              {t.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
              {t.type === 'info' && <Info className="w-5 h-5 text-purple-300" />}
            </div>
            <div className="flex-1 text-sm">
              {t.title && <p className="font-bold text-white tracking-tight">{t.title}</p>}
              <p className="text-xs text-zinc-300 leading-relaxed">{t.message}</p>
            </div>
            <button
              id={`toast-close-${t.id}`}
              onClick={() => removeToast(t.id)}
              className="text-zinc-400 hover:text-white transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </aside>
  );
}
