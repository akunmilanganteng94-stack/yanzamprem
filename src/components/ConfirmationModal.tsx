import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { X, AlertCircle, ShoppingCart, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  quantity: number;
  onSuccessOrder: (orderId: string) => void;
  onNeedDeposit: () => void;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  quantity,
  onSuccessOrder,
  onNeedDeposit
}: ConfirmationModalProps) {
  const { userProfile } = useAuth();
  const { settings, product, availableStockCount, createOrder } = useStore();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const unitPrice = settings.productPrice || product.price || 500;
  const totalPrice = unitPrice * quantity;
  const currentBalance = userProfile?.balance || 0;
  const balanceAfter = currentBalance - totalPrice;
  const hasEnoughBalance = balanceAfter >= 0;
  const hasEnoughStock = availableStockCount >= quantity;
  const isStoreOpen = settings.storeStatus === 'OPEN';

  const handleConfirm = async () => {
    setErrorMsg('');
    if (!isStoreOpen) {
      setErrorMsg('Store sedang ditutup sementara.');
      return;
    }
    if (!hasEnoughBalance) {
      setErrorMsg('Saldo tidak mencukupi untuk melakukan pembelian ini.');
      return;
    }
    if (!hasEnoughStock) {
      setErrorMsg(`Stok tidak mencukupi. Tersedia ${availableStockCount} akun.`);
      return;
    }

    setLoading(true);
    try {
      const orderId = await createOrder(quantity);
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }
      onSuccessOrder(orderId);
      onClose();
    } catch (err: any) {
      console.error('Order confirmation error', err);
      setErrorMsg(err.message || 'Gagal memproses pesanan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-md bg-[#0e081e] border border-purple-500/40 rounded-3xl p-6 shadow-2xl text-white overflow-hidden shadow-purple-900/40"
      >
        <button
          id="close-confirmation-modal-btn"
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors p-1 disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-purple-950 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-inner">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-lg text-white tracking-tight">Konfirmasi Pembelian</h3>
            <p className="text-xs text-zinc-300">Verifikasi rincian pesanan digital Anda</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{errorMsg}</span>
              {!hasEnoughBalance && (
                <button
                  id="error-goto-deposit-btn"
                  onClick={() => {
                    onClose();
                    onNeedDeposit();
                  }}
                  className="block mt-1 font-bold text-purple-300 underline hover:text-white"
                >
                  Deposit saldo sekarang →
                </button>
              )}
            </div>
          </div>
        )}

        {/* Breakdown Card */}
        <div className="bg-[#140b2a] border border-purple-500/30 rounded-2xl p-4 space-y-3 mb-5">
          <div className="flex justify-between items-center text-sm">
            <span className="text-zinc-300">Produk</span>
            <span className="font-black text-white">Alight Motion Premium</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-zinc-300">Jumlah Akun</span>
            <span className="font-black text-purple-300">{quantity} Akun</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-zinc-300">Harga Satuan</span>
            <span className="text-zinc-200">Rp{unitPrice.toLocaleString('id-ID')}</span>
          </div>
          <div className="pt-2 border-t border-purple-900/40 flex justify-between items-center">
            <span className="text-sm font-bold text-zinc-200">Total Pembayaran</span>
            <span className="text-base font-black text-white">
              Rp{totalPrice.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* Balance Simulation */}
        <div className="bg-[#090514] border border-purple-500/30 rounded-2xl p-3.5 space-y-2 mb-6 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-zinc-300">Saldo sekarang:</span>
            <span className="font-bold text-white">
              Rp{currentBalance.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-300">Setelah pembelian:</span>
            <span
              className={`font-black ${
                hasEnoughBalance ? 'text-purple-300' : 'text-rose-400'
              }`}
            >
              Rp{Math.max(0, balanceAfter).toLocaleString('id-ID')}
            </span>
          </div>
          {!hasEnoughBalance && (
            <p className="text-rose-400 text-[11px] pt-1">
              ⚠️ Saldo kurang Rp{Math.abs(balanceAfter).toLocaleString('id-ID')}.
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            id="cancel-order-modal-btn"
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 px-4 rounded-xl border border-zinc-700 text-zinc-300 hover:text-white text-xs font-bold transition-all disabled:opacity-50"
          >
            Batal
          </button>
          
          {hasEnoughBalance ? (
            <button
              id="confirm-order-now-btn"
              type="button"
              onClick={handleConfirm}
              disabled={loading || !isStoreOpen || !hasEnoughStock}
              className="flex-1 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs transition-all shadow-lg shadow-purple-600/30 active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <span>Beli Sekarang</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          ) : (
            <button
              id="goto-deposit-btn"
              type="button"
              onClick={() => {
                onClose();
                onNeedDeposit();
              }}
              className="flex-1 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs transition-all shadow-lg shadow-purple-600/30"
            >
              Deposit Saldo Sekarang
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
