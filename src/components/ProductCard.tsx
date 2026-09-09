import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import {
  Check,
  Zap,
  ShieldCheck,
  Clock,
  Sparkles,
  Layers,
  ChevronDown,
  Plus,
  Minus,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'motion/react';

interface ProductCardProps {
  onOpenConfirm: (quantity: number) => void;
  onOpenAuth: () => void;
}

export default function ProductCard({ onOpenConfirm, onOpenAuth }: ProductCardProps) {
  const { currentUser } = useAuth();
  const { settings, product, availableStockCount } = useStore();
  const [quantity, setQuantity] = useState<number>(1);

  const isStoreOpen = settings.storeStatus === 'OPEN';
  const unitPrice = settings.productPrice || product.price || 500;
  const isOutOfStock = availableStockCount <= 0;

  const handleIncrement = () => {
    if (quantity < availableStockCount) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleBuyClick = () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    onOpenConfirm(quantity);
  };

  return (
    <div className="relative w-full max-w-xl mx-auto">
      {/* Decorative Glow behind the card */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-zinc-700 via-zinc-500 to-zinc-700 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 animate-tilt pointer-events-none" />

      <div className="relative bg-[#0d0d12] border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden backdrop-blur-xl">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-1/4 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        {/* Header Ribbon & Stock Pill */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-700/80 text-[11px] font-semibold text-zinc-300">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>Best Seller Digital</span>
          </div>

          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
              !isStoreOpen
                ? 'bg-rose-950/60 border-rose-800/80 text-rose-300'
                : isOutOfStock
                ? 'bg-rose-950/60 border-rose-800/80 text-rose-300'
                : 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                !isStoreOpen
                  ? 'bg-rose-500'
                  : isOutOfStock
                  ? 'bg-rose-500'
                  : 'bg-emerald-400 animate-pulse'
              }`}
            />
            <span>
              {!isStoreOpen
                ? 'STORE CLOSED'
                : isOutOfStock
                ? 'STOK HABIS'
                : `Stok: ${availableStockCount} Akun`}
            </span>
          </div>
        </div>

        {/* Product Identity */}
        <div className="flex items-start gap-4 sm:gap-5 mb-6">
          {/* Alight Motion Logo */}
          <div className="relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border border-purple-400/40 p-2 shadow-xl flex items-center justify-center overflow-hidden group">
            <img src="https://cdn.phototourl.com/free/2026-09-09-96fa0c82-2c28-4a30-924b-954fb1e3af92.jpg" alt="Alight Motion" className="w-full h-full object-contain rounded-xl" />
            <div className="absolute inset-0 bg-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
              Alight Motion Premium
            </h2>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed line-clamp-2">
              Unlock All Features, No Watermark, Support Preset XML & 5MB+, Fast Server.
            </p>

            {/* Price Badge */}
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Rp{unitPrice.toLocaleString('id-ID')}
              </span>
              <span className="text-xs text-zinc-500 font-medium">/ akun</span>
              <span className="ml-2 px-2 py-0.5 rounded-md bg-zinc-800 text-[10px] text-zinc-400 line-through">
                Rp15.000
              </span>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 gap-2.5 py-4 my-4 border-y border-zinc-800/80 text-xs">
          <div className="flex items-center gap-2 text-zinc-300">
            <div className="w-5 h-5 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400 shrink-0">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span>No Watermark</span>
          </div>

          <div className="flex items-center gap-2 text-zinc-300">
            <div className="w-5 h-5 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400 shrink-0">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span>Support Preset 5MB+</span>
          </div>

          <div className="flex items-center gap-2 text-zinc-300">
            <div className="w-5 h-5 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400 shrink-0">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span>Pro Effects & Font</span>
          </div>

          <div className="flex items-center gap-2 text-zinc-300">
            <div className="w-5 h-5 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400 shrink-0">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span>Proses Cepat Otomatis</span>
          </div>
        </div>

        {/* Store Closed Alert if closed */}
        {!isStoreOpen && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
            <div>
              <p className="font-semibold text-white">Store sedang ditutup sementara.</p>
              <p className="text-[11px] text-rose-300/80">Admin sedang melakukan restok akun atau maintenance.</p>
            </div>
          </div>
        )}

        {/* Quantity Selector & Order Action */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between bg-zinc-900/90 border border-zinc-800 rounded-2xl p-2.5 px-4">
            <span className="text-xs font-semibold text-zinc-300">Pilih Jumlah:</span>

            <div className="flex items-center gap-3">
              <button
                id="quantity-decrease-btn"
                type="button"
                onClick={handleDecrement}
                disabled={quantity <= 1 || isOutOfStock || !isStoreOpen}
                className="w-8 h-8 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center transition-colors disabled:opacity-40"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <span className="w-8 text-center text-sm font-black text-white">
                {quantity}
              </span>

              <button
                id="quantity-increase-btn"
                type="button"
                onClick={handleIncrement}
                disabled={quantity >= availableStockCount || isOutOfStock || !isStoreOpen}
                className="w-8 h-8 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center transition-colors disabled:opacity-40"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Subtotal Preview */}
          <div className="flex justify-between items-center px-1 text-xs text-zinc-400">
            <span>Total Pembayaran:</span>
            <span className="text-sm font-bold text-white">
              Rp{(unitPrice * quantity).toLocaleString('id-ID')}
            </span>
          </div>

          {/* Main Action Button */}
          <button
            id="buy-product-btn"
            type="button"
            onClick={handleBuyClick}
            disabled={isOutOfStock || !isStoreOpen}
            className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm tracking-wide transition-all shadow-xl active:scale-[0.99] flex items-center justify-center gap-2 ${
              !isStoreOpen
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : isOutOfStock
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : 'bg-white text-black hover:bg-zinc-200 shadow-white/10'
            }`}
          >
            {!isStoreOpen ? (
              'STORE CLOSED'
            ) : isOutOfStock ? (
              'STOK HABIS'
            ) : (
              <>
                <Zap className="w-4 h-4 fill-current" />
                <span>Beli Sekarang — Rp{(unitPrice * quantity).toLocaleString('id-ID')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
