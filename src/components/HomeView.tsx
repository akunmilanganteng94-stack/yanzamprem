import React from 'react';
import ProductCard from './ProductCard';
import {
  Sparkles,
  ShieldCheck,
  Zap,
  Clock,
  HelpCircle,
  MessageCircle,
  CheckCircle2,
  Lock,
  ArrowRight
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface HomeViewProps {
  onOpenConfirm: (quantity: number) => void;
  onOpenAuth: () => void;
  onGotoDeposit: () => void;
  onOpenWhatsApp: () => void;
}

export default function HomeView({
  onOpenConfirm,
  onOpenAuth,
  onGotoDeposit,
  onOpenWhatsApp
}: HomeViewProps) {
  const { settings } = useStore();

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative pt-6 sm:pt-12 text-center max-w-4xl mx-auto px-4">
        {/* Glow backdrop */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-white/[0.03] rounded-full blur-3xl pointer-events-none" />

        {/* Top Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 shadow-sm mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Promo Spesial: Alight Motion Premium Hanya Rp500</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.1]">
          Penyedia Alight Motion Premium <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 via-white to-zinc-400">
            Terpercaya & Termurah
          </span>
        </h1>

        <p className="mt-4 text-xs sm:text-sm md:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Nikmati editing video profesional tanpa watermark, dukungan preset XML & 5MB+,
          serta akun siap pakai dengan proses instan 24/7 di <strong className="text-zinc-200">YANZSTR</strong>.
        </p>

        {/* Quick WhatsApp Banner link */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            id="hero-wa-banner-btn"
            onClick={onOpenWhatsApp}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/40 text-xs font-semibold transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>Gabung Saluran WhatsApp YANZSTR</span>
          </button>
        </div>
      </section>

      {/* Main Product Display Card */}
      <section className="px-4">
        <ProductCard onOpenConfirm={onOpenConfirm} onOpenAuth={onOpenAuth} />
      </section>

      {/* Keunggulan Toko YANZSTR */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-8">
          <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
            Mengapa Memilih Kami
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
            Keunggulan Layanan YANZSTR
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0d0d12] border border-zinc-800 rounded-2xl p-5 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Proses Otomatis Instan</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Setelah saldo terpotong, data email dan password akun langsung muncul di riwayat pesanan Anda.
            </p>
          </div>

          <div className="bg-[#0d0d12] border border-zinc-800 rounded-2xl p-5 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Full Garansi Akun</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Semua akun terjamin kualitasnya. Jika ada kendala login, kami siap bantu melalui saluran resmi WhatsApp.
            </p>
          </div>

          <div className="bg-[#0d0d12] border border-zinc-800 rounded-2xl p-5 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Pembayaran Fleksibel</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Dukungan QRIS All Payment (BCA, GoPay, OVO, ShopeePay) serta transfer langsung sesama nomor DANA.
            </p>
          </div>

          <div className="bg-[#0d0d12] border border-zinc-800 rounded-2xl p-5 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
              <Clock className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Harga Termurah Rp500</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Harga digital termurah di kelasnya tanpa mengorbankan fitur premium dan preset besar.
            </p>
          </div>
        </div>
      </section>

      {/* Panduan Pembelian (Step by Step) */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="bg-[#0b0b10] border border-zinc-800 rounded-3xl p-6 sm:p-8">
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight mb-6 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-zinc-400" />
            <span>Cara Pembelian di YANZSTR</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="space-y-2">
              <span className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-bold text-white">
                1
              </span>
              <h5 className="text-xs font-bold text-zinc-200">Daftar Akun</h5>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Buat akun YANZSTR dengan email dan password Anda dalam beberapa detik.
              </p>
            </div>

            <div className="space-y-2">
              <span className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-bold text-white">
                2
              </span>
              <h5 className="text-xs font-bold text-zinc-200">Top Up Saldo</h5>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Pilih menu Deposit, transfer via QRIS atau DANA, lalu kirim konfirmasi.
              </p>
            </div>

            <div className="space-y-2">
              <span className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-bold text-white">
                3
              </span>
              <h5 className="text-xs font-bold text-zinc-200">Beli Akun</h5>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Pilih jumlah akun Alight Motion yang ingin dibeli dan klik Beli Sekarang.
              </p>
            </div>

            <div className="space-y-2">
              <span className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-bold text-white">
                4
              </span>
              <h5 className="text-xs font-bold text-zinc-200">Terima Akun</h5>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Buka Riwayat Pesanan untuk langsung menyalin Email dan Password akun.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 pt-10 text-center text-xs text-zinc-500 max-w-5xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-8">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white text-black font-black flex items-center justify-center text-sm">
              Y
            </div>
            <span className="font-extrabold text-sm text-white tracking-wider">YANZSTR</span>
            <span className="text-zinc-600">|</span>
            <span className="text-[11px] text-zinc-400">Digital Premium Store</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              id="footer-wa-link"
              onClick={onOpenWhatsApp}
              className="text-zinc-400 hover:text-emerald-400 transition-colors"
            >
              Saluran WhatsApp Resmi
            </button>
            <span>•</span>
            <span className="text-zinc-400">
              Status Toko: {settings.storeStatus === 'OPEN' ? '🟢 Buka' : '🔴 Tutup'}
            </span>
          </div>
        </div>

        <p className="text-[10px] text-zinc-600">
          © {new Date().getFullYear()} YANZSTR. All rights reserved. Platform transaksi produk digital mandiri.
        </p>
      </footer>
    </div>
  );
}
