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
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border backdrop-blur-md shadow-2xl ${
              t.type === 'success'
                ? 'bg-zinc-900/90 border-emerald-500/40 text-emerald-300'
                : t.type === 'error'
                ? 'bg-zinc-900/90 border-rose-500/40 text-rose-300'
                : t.type === 'warning'
                ? 'bg-zinc-900/90 border-amber-500/40 text-amber-300'
                : 'bg-zinc-900/90 border-zinc-700 text-zinc-200'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {t.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
              {t.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
              {t.type === 'info' && <Info className="w-5 h-5 text-zinc-300" />}
            </div>
            <div className="flex-1 text-sm">
              {t.title && <p className="font-semibold text-white tracking-tight">{t.title}</p>}
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
