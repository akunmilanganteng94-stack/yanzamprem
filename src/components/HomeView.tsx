import React from 'react';
import ProductCard from './ProductCard';
import {
  Sparkles,
  ShieldCheck,
  Zap,
  Clock,
  HelpCircle,
  MessageCircle,
  Lock,
  ArrowRight
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

const YANZSTR_LOGO_URL = 'https://cdn.phototourl.com/free/2026-09-09-ad32f784-664e-4789-a562-cf7b35289053.jpg';
const ALIGHT_MOTION_LOGO_URL = 'https://cdn.phototourl.com/free/2026-09-09-e5328797-93d0-4dc6-a280-ff5610d81262.jpg';

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
        {/* Glow backdrop with purple ambient lighting */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Showcase Badges */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#120924] border border-purple-500/40 shadow-sm">
            <img
              src={YANZSTR_LOGO_URL}
              alt="YANZSTR"
              className="w-5 h-5 rounded-full object-cover border border-purple-400"
              referrerPolicy="no-referrer"
            />
            <span className="text-[11px] font-bold text-white tracking-wider">YANZSTR STORE</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#120924] border border-purple-500/40 shadow-sm">
            <img
              src={ALIGHT_MOTION_LOGO_URL}
              alt="Alight Motion"
              className="w-5 h-5 rounded-full object-cover border border-purple-400"
              referrerPolicy="no-referrer"
            />
            <span className="text-[11px] font-bold text-purple-300">Alight Motion Premium</span>
          </div>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.1]">
          Pusat Akun Alight Motion <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-white to-purple-300">
            Termurah & Serba Otomatis
          </span>
        </h1>

        <p className="mt-4 text-xs sm:text-sm md:text-base text-zinc-300 max-w-2xl mx-auto leading-relaxed">
          Nikmati editing video tanpa watermark, full efek pro, support preset XML & 5MB+,
          serta akun siap pakai dengan proses instan 24/7 di <strong className="text-purple-300">YANZSTR</strong>.
        </p>

        {/* Quick WhatsApp Banner link */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            id="hero-wa-banner-btn"
            onClick={onOpenWhatsApp}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-950/60 border border-purple-500/50 text-purple-200 hover:bg-purple-900/50 text-xs font-bold transition-all shadow-md shadow-purple-950/40"
          >
            <MessageCircle className="w-4 h-4 text-purple-400" />
            <span>Gabung Saluran WhatsApp Resmi</span>
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
          <span className="text-[11px] font-bold uppercase tracking-widest text-purple-400">
            Mengapa Memilih YANZSTR
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
            Keunggulan Layanan Kami
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0c0819] border border-purple-500/25 rounded-2xl p-5 space-y-2.5 shadow-lg shadow-purple-950/20 hover:border-purple-500/50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Proses Otomatis Instan</h4>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Setelah saldo terpotong, data email dan password akun langsung muncul di riwayat pesanan Anda secara otomatis.
            </p>
          </div>

          <div className="bg-[#0c0819] border border-purple-500/25 rounded-2xl p-5 space-y-2.5 shadow-lg shadow-purple-950/20 hover:border-purple-500/50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Full Garansi Akun</h4>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Semua akun terjamin kualitasnya. Jika ada kendala login, kami siap bantu melalui saluran resmi WhatsApp YANZSTR.
            </p>
          </div>

          <div className="bg-[#0c0819] border border-purple-500/25 rounded-2xl p-5 space-y-2.5 shadow-lg shadow-purple-950/20 hover:border-purple-500/50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Pembayaran Fleksibel</h4>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Dukungan QRIS All Payment (BCA, GoPay, OVO, ShopeePay) serta transfer langsung sesama nomor akun DANA.
            </p>
          </div>

          <div className="bg-[#0c0819] border border-purple-500/25 rounded-2xl p-5 space-y-2.5 shadow-lg shadow-purple-950/20 hover:border-purple-500/50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <Clock className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Harga Terbaik</h4>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Harga digital termurah di kelasnya hanya Rp500 tanpa kompromi fitur premium, preset besar, dan kualitas render.
            </p>
          </div>
        </div>
      </section>

      {/* Panduan Pembelian */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="bg-[#0b0717] border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-xl">
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight mb-6 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-purple-400" />
            <span>Cara Pembelian di YANZSTR</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="space-y-2">
              <span className="w-8 h-8 rounded-xl bg-purple-950 border border-purple-500/40 flex items-center justify-center text-xs font-bold text-purple-300">
                1
              </span>
              <h5 className="text-xs font-bold text-white">Daftar Akun</h5>
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                Buat akun YANZSTR dengan email dan password Anda dalam beberapa detik.
              </p>
            </div>

            <div className="space-y-2">
              <span className="w-8 h-8 rounded-xl bg-purple-950 border border-purple-500/40 flex items-center justify-center text-xs font-bold text-purple-300">
                2
              </span>
              <h5 className="text-xs font-bold text-white">Top Up Saldo</h5>
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                Pilih menu Deposit, transfer via QRIS atau DANA, lalu kirim konfirmasi transfer.
              </p>
            </div>

            <div className="space-y-2">
              <span className="w-8 h-8 rounded-xl bg-purple-950 border border-purple-500/40 flex items-center justify-center text-xs font-bold text-purple-300">
                3
              </span>
              <h5 className="text-xs font-bold text-white">Beli Akun</h5>
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                Pilih jumlah akun Alight Motion yang ingin dibeli dan klik tombol Beli Sekarang.
              </p>
            </div>

            <div className="space-y-2">
              <span className="w-8 h-8 rounded-xl bg-purple-950 border border-purple-500/40 flex items-center justify-center text-xs font-bold text-purple-300">
                4
              </span>
              <h5 className="text-xs font-bold text-white">Terima Akun</h5>
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                Buka tab Riwayat Pesanan untuk langsung menyalin Email dan Password akun Anda.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-900/40 pt-10 text-center text-xs text-zinc-400 max-w-5xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl overflow-hidden border border-purple-500/40">
              <img
                src={YANZSTR_LOGO_URL}
                alt="YANZSTR Logo"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="text-left">
              <span className="font-extrabold text-sm text-white tracking-wider block">YANZSTR</span>
              <span className="text-[10px] text-purple-400">Digital Premium Store</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              id="footer-wa-link"
              onClick={onOpenWhatsApp}
              className="text-purple-300 hover:text-white transition-colors"
            >
              Saluran WhatsApp Resmi
            </button>
            <span>•</span>
            <span className="text-zinc-400">
              Status Toko: {settings.storeStatus === 'OPEN' ? 'Buka' : 'Tutup'}
            </span>
          </div>
        </div>

        <p className="text-[10px] text-zinc-500">
          © {new Date().getFullYear()} YANZSTR. All rights reserved. Platform transaksi produk digital mandiri.
        </p>
      </footer>
    </div>
  );
}
