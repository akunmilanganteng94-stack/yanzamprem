import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import {
  Check,
  Zap,
  Sparkles,
  Plus,
  Minus,
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';

const ALIGHT_MOTION_LOGO_URL = 'https://cdn.phototourl.com/free/2026-09-09-e5328797-93d0-4dc6-a280-ff5610d81262.jpg';

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
      {/* Decorative Purple Glow behind card */}
      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-60 transition duration-700 pointer-events-none" />

      <div className="relative bg-[#0d071d] border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden backdrop-blur-xl">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-1/4 w-52 h-52 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header Ribbon & Stock Pill */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/70 border border-purple-500/40 text-[11px] font-bold text-purple-200 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Best Seller Digital</span>
          </div>

          <div
            className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black border transition-colors ${
              !isStoreOpen
                ? 'bg-rose-950/70 border-rose-800/80 text-rose-300'
                : isOutOfStock
                ? 'bg-rose-950/70 border-rose-800/80 text-rose-300'
                : 'bg-purple-950/70 border-purple-500/50 text-purple-300'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                !isStoreOpen
                  ? 'bg-rose-500'
                  : isOutOfStock
                  ? 'bg-rose-500'
                  : 'bg-purple-400 animate-pulse'
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
          {/* Official Alight Motion Logo image provided by user */}
          <div className="relative shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-black border-2 border-purple-500/40 p-1.5 shadow-xl shadow-purple-950/50 flex items-center justify-center overflow-hidden group">
            <img
              src={ALIGHT_MOTION_LOGO_URL}
              alt="Alight Motion Logo"
              className="w-full h-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                Alight Motion Premium
              </h2>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-purple-600/30 border border-purple-500/40 text-[10px] font-bold text-purple-200">
                PRO
              </span>
            </div>
            
            <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed">
              Unlock All Features, Export No Watermark, Support Preset XML & 5MB+, Garansi Aktif.
            </p>

            {/* Price Badge */}
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Rp{unitPrice.toLocaleString('id-ID')}
              </span>
              <span className="text-xs text-purple-300/80 font-medium">/ akun</span>
              <span className="ml-2 px-2 py-0.5 rounded-md bg-[#1d1235] text-[10px] text-zinc-400 line-through">
                Rp15.000
              </span>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 gap-2.5 py-4 my-4 border-y border-purple-900/40 text-xs">
          <div className="flex items-center gap-2 text-zinc-200">
            <div className="w-5 h-5 rounded-md bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span>No Watermark</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-200">
            <div className="w-5 h-5 rounded-md bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span>Support Preset 5MB+</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-200">
            <div className="w-5 h-5 rounded-md bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span>Pro Effects & Font</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-200">
            <div className="w-5 h-5 rounded-md bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span>Pengiriman Instan</span>
          </div>
        </div>

        {/* Store Closed Alert */}
        {!isStoreOpen && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
            <div>
              <p className="font-bold text-white">Store sedang ditutup sementara.</p>
              <p className="text-[11px] text-rose-300/80">Admin sedang melakukan pembaruan stok atau verifikasi sistem.</p>
            </div>
          </div>
        )}

        {/* Quantity Selector & Order Action */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between bg-[#150d2e] border border-purple-500/30 rounded-2xl p-2.5 px-4">
            <span className="text-xs font-bold text-purple-200">Pilih Jumlah Akun:</span>
            <div className="flex items-center gap-3">
              <button
                id="quantity-decrease-btn"
                type="button"
                onClick={handleDecrement}
                disabled={quantity <= 1 || isOutOfStock || !isStoreOpen}
                className="w-8 h-8 rounded-xl bg-purple-950 hover:bg-purple-900 text-purple-200 border border-purple-500/40 flex items-center justify-center transition-colors disabled:opacity-30"
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
                className="w-8 h-8 rounded-xl bg-purple-950 hover:bg-purple-900 text-purple-200 border border-purple-500/40 flex items-center justify-center transition-colors disabled:opacity-30"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Subtotal Preview */}
          <div className="flex justify-between items-center px-1 text-xs text-purple-300/90">
            <span>Total Tagihan:</span>
            <span className="text-base font-black text-white">
              Rp{(unitPrice * quantity).toLocaleString('id-ID')}
            </span>
          </div>

          {/* Main Action Button */}
          <button
            id="buy-product-btn"
            type="button"
            onClick={handleBuyClick}
            disabled={isOutOfStock || !isStoreOpen}
            className={`w-full py-4 px-6 rounded-2xl font-black text-sm tracking-wide transition-all shadow-xl active:scale-[0.99] flex items-center justify-center gap-2 ${
              !isStoreOpen
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : isOutOfStock
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : 'bg-white text-black hover:bg-purple-100 shadow-purple-600/30'
            }`}
          >
            {!isStoreOpen ? (
              'STORE CLOSED'
            ) : isOutOfStock ? (
              'STOK HABIS'
            ) : (
              <>
                <Zap className="w-4 h-4 fill-current text-purple-600" />
                <span>Beli Sekarang — Rp{(unitPrice * quantity).toLocaleString('id-ID')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
