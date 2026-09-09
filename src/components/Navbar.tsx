import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import {
  Wallet,
  User,
  ShoppingBag,
  ArrowDownCircle,
  Shield,
  Menu,
  X,
  LogOut,
  ChevronRight,
  MessageCircle
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenAuth: () => void;
  onOpenWhatsApp: () => void;
}

export default function Navbar({ currentTab, setCurrentTab, onOpenAuth, onOpenWhatsApp }: NavbarProps) {
  const { currentUser, userProfile, isAdmin, logout } = useAuth();
  const { settings } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: ShoppingBag },
    { id: 'deposit', label: 'Deposit', icon: ArrowDownCircle },
    { id: 'orders', label: 'Riwayat Pesanan', icon: ShoppingBag },
    { id: 'account', label: 'Akun', icon: User },
  ];

  const handleNavClick = (tabId: string) => {
    setCurrentTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#050507]/90 backdrop-blur-xl border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <button
              id="brand-logo-btn"
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center overflow-hidden border border-purple-400/40 shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
                <img src="https://cdn.phototourl.com/free/2026-09-09-ad32f784-664e-4789-a562-cf7b35289053.jpg" alt="YANZSTR" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-wider text-white">
                  YANZSTR
                </span>
                <span className="text-[10px] text-zinc-400 font-medium -mt-1 tracking-widest uppercase">
                  Premium Store
                </span>
              </div>
            </button>

            {/* Store Status Pill */}
            <div
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                settings.storeStatus === 'OPEN'
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-950/40 border-rose-500/30 text-rose-400'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  settings.storeStatus === 'OPEN' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                }`}
              />
              <span>{settings.storeStatus === 'OPEN' ? 'OPEN' : 'CLOSED'}</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}-btn`}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-zinc-800 text-white shadow-inner'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {isAdmin && (
              <button
                id="nav-admin-btn"
                onClick={() => handleNavClick('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  currentTab === 'admin'
                    ? 'bg-white text-black border-white'
                    : 'bg-zinc-900 text-zinc-200 border-zinc-700 hover:border-zinc-500'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin Panel</span>
              </button>
            )}
          </nav>

          {/* Right Section: Saldo & Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            {currentUser && userProfile ? (
              <>
                {/* Saldo Badge */}
                <button
                  id="navbar-balance-btn"
                  onClick={() => handleNavClick('deposit')}
                  className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 rounded-xl transition-all shadow-sm"
                  title="Klik untuk Deposit Saldo"
                >
                  <div className="w-6 h-6 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300">
                    <Wallet className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] text-zinc-400 leading-none">Saldo</span>
                    <span className="text-xs font-bold text-white tracking-tight leading-tight">
                      Rp{(userProfile.balance || 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                </button>

                {/* Profile quick button */}
                <button
                  id="navbar-user-btn"
                  onClick={() => handleNavClick('account')}
                  className="hidden sm:flex items-center justify-center w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
                  title={userProfile.name}
                >
                  <User className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                id="navbar-login-btn"
                onClick={onOpenAuth}
                className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold tracking-wide transition-all shadow-md active:scale-95"
              >
                Masuk / Daftar
              </button>
            )}

            {/* Mobile Hamburger Button */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-800/80 bg-[#07070b] px-4 pt-3 pb-5 space-y-2">
          {/* Store status on mobile */}
          <div className="flex items-center justify-between py-2 px-3 bg-zinc-900/60 rounded-xl mb-3 border border-zinc-800">
            <span className="text-xs text-zinc-400">Status Toko:</span>
            <span
              className={`text-xs font-semibold ${
                settings.storeStatus === 'OPEN' ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {settings.storeStatus === 'OPEN' ? '● Toko Buka' : '● Toko Tutup'}
            </span>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-nav-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-300 hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-zinc-400" />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600" />
              </button>
            );
          })}

          {isAdmin && (
            <button
              id="mobile-nav-admin"
              onClick={() => handleNavClick('admin')}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold bg-zinc-900 border border-amber-500/30 text-amber-300 hover:bg-zinc-850"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-amber-400" />
                <span>Admin Panel</span>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-400/50" />
            </button>
          )}

          <div className="pt-2 border-t border-zinc-800 space-y-2">
            <button
              id="mobile-nav-wa-btn"
              onClick={() => {
                onOpenWhatsApp();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-medium text-emerald-400 hover:bg-emerald-950/20"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Saluran WhatsApp YANZSTR</span>
            </button>

            {currentUser && (
              <button
                id="mobile-nav-logout-btn"
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-950/20"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
