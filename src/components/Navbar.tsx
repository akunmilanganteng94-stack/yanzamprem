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

const YANZSTR_LOGO_URL = 'https://cdn.phototourl.com/free/2026-09-09-ad32f784-664e-4789-a562-cf7b35289053.jpg';

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
    <header className="sticky top-0 z-40 w-full bg-[#080512]/90 backdrop-blur-xl border-b border-purple-900/40 shadow-lg shadow-purple-950/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <button
              id="brand-logo-btn"
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-3 text-left group focus:outline-none"
            >
              <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-purple-500/50 shadow-md shadow-purple-600/30 group-hover:scale-105 transition-transform bg-black">
                <img
                  src={YANZSTR_LOGO_URL}
                  alt="YANZSTR Logo"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-wider text-white">
                    YANZSTR
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                </div>
                <span className="text-[10px] text-purple-300 font-semibold -mt-1 tracking-widest uppercase">
                  Digital Premium
                </span>
              </div>
            </button>

            {/* Store Status Pill */}
            <div
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${
                settings.storeStatus === 'OPEN'
                  ? 'bg-purple-950/60 border-purple-500/40 text-purple-300'
                  : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  settings.storeStatus === 'OPEN' ? 'bg-purple-400 animate-pulse' : 'bg-rose-400'
                }`}
              />
              <span>{settings.storeStatus === 'OPEN' ? 'STORE OPEN' : 'STORE CLOSED'}</span>
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
                      ? 'bg-purple-600/20 text-white border border-purple-500/40 shadow-inner'
                      : 'text-zinc-300 hover:text-white hover:bg-purple-950/30'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-zinc-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {isAdmin && (
              <button
                id="nav-admin-btn"
                onClick={() => handleNavClick('admin')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                  currentTab === 'admin'
                    ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-600/30'
                    : 'bg-[#150e2a] text-purple-200 border-purple-500/40 hover:bg-purple-900/50'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-purple-300" />
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
                  className="flex items-center gap-2.5 px-3 py-1.5 bg-[#120b24] border border-purple-500/30 hover:border-purple-400 rounded-xl transition-all shadow-sm shadow-purple-900/20 group"
                  title="Klik untuk Deposit Saldo"
                >
                  <div className="w-6 h-6 rounded-lg bg-purple-950 border border-purple-500/30 flex items-center justify-center text-purple-300 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <Wallet className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] text-purple-300/80 leading-none">Saldo</span>
                    <span className="text-xs font-black text-white tracking-tight leading-tight">
                      Rp{(userProfile.balance || 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                </button>

                {/* Profile quick button */}
                <button
                  id="navbar-user-btn"
                  onClick={() => handleNavClick('account')}
                  className="hidden sm:flex items-center justify-center w-9 h-9 rounded-xl bg-[#120b24] border border-purple-500/30 text-purple-200 hover:text-white hover:border-purple-400 transition-colors"
                  title={userProfile.name}
                >
                  <User className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                id="navbar-login-btn"
                onClick={onOpenAuth}
                className="px-4 py-2 rounded-xl bg-white hover:bg-purple-100 text-black text-xs font-bold tracking-wide transition-all shadow-md shadow-white/10 active:scale-95"
              >
                Masuk / Daftar
              </button>
            )}

            {/* Mobile Hamburger Button */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-[#120b24] border border-purple-900/50 text-purple-200 hover:text-white"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-purple-900/40 bg-[#090514] px-4 pt-3 pb-5 space-y-2">
          {/* Store status on mobile */}
          <div className="flex items-center justify-between py-2 px-3 bg-[#130d24] rounded-xl mb-3 border border-purple-900/50">
            <span className="text-xs text-purple-300">Status Toko:</span>
            <span
              className={`text-xs font-bold ${
                settings.storeStatus === 'OPEN' ? 'text-purple-300' : 'text-rose-400'
              }`}
            >
              {settings.storeStatus === 'OPEN' ? 'STORE OPEN' : 'STORE CLOSED'}
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
                  isActive
                    ? 'bg-purple-600/30 border border-purple-500/40 text-white font-bold'
                    : 'text-zinc-300 hover:bg-[#150e2a]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-zinc-400'}`} />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-purple-400/50" />
              </button>
            );
          })}

          {isAdmin && (
            <button
              id="mobile-nav-admin"
              onClick={() => handleNavClick('admin')}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold bg-[#170e2f] border border-purple-500/40 text-purple-200 hover:bg-purple-900/40"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-purple-300" />
                <span>Admin Panel</span>
              </div>
              <ChevronRight className="w-4 h-4 text-purple-400/50" />
            </button>
          )}

          <div className="pt-2 border-t border-purple-900/40 space-y-2">
            <button
              id="mobile-nav-wa-btn"
              onClick={() => {
                onOpenWhatsApp();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-purple-300 hover:bg-purple-950/40"
            >
              <MessageCircle className="w-4 h-4 text-purple-400" />
              <span>Saluran WhatsApp YANZSTR</span>
            </button>

            {currentUser && (
              <button
                id="mobile-nav-logout-btn"
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/30"
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
