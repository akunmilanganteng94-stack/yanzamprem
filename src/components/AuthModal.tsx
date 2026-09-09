import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { Eye, EyeOff, X, Lock, Mail, User as UserIcon, Loader2, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const { login, register } = useAuth();
  const { addToast } = useStore();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Semua field wajib diisi.');
      return;
    }

    if (mode === 'register') {
      if (!name.trim()) {
        setErrorMessage('Nama lengkap wajib diisi.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password minimal terdiri dari 6 karakter.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Konfirmasi password tidak cocok.');
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === 'register') {
        await register(email, password, name);
        addToast('Pendaftaran akun berhasil! Selamat datang di YANZSTR.', 'success', 'Akun Terdaftar');
      } else {
        await login(email, password);
        addToast('Login berhasil. Selamat datang kembali!', 'success', 'Login Berhasil');
      }
      onClose();
    } catch (err: any) {
      console.error('Auth error:', err);
      let userFriendlyMsg = 'Terjadi kesalahan. Silakan coba lagi.';
      const code = err?.code || '';

      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        userFriendlyMsg = 'Email atau password yang Anda masukkan salah.';
      } else if (code === 'auth/email-already-in-use') {
        userFriendlyMsg = 'Email sudah terdaftar. Silakan login.';
      } else if (code === 'auth/invalid-email') {
        userFriendlyMsg = 'Format email tidak valid.';
      } else if (code === 'auth/weak-password') {
        userFriendlyMsg = 'Password terlalu lemah (minimal 6 karakter).';
      } else if (code === 'auth/too-many-requests') {
        userFriendlyMsg = 'Terlalu banyak percobaan gagal. Silakan tunggu beberapa saat.';
      } else if (err?.message) {
        userFriendlyMsg = err.message;
      }

      setErrorMessage(userFriendlyMsg);
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
        className="relative w-full max-w-md bg-[#0a0a0f] border border-zinc-800/80 rounded-2xl p-6 sm:p-7 shadow-2xl text-white overflow-hidden"
      >
        {/* Glow corner */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <button
          id="close-auth-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-700/60 mb-3 shadow-inner">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            {mode === 'login' ? 'Masuk ke Akun YANZSTR' : 'Daftar Akun Baru'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            {mode === 'login'
              ? 'Kelola saldo, deposit, dan riwayat pesanan Anda'
              : 'Daftar sekarang untuk mulai membeli Alight Motion Premium'}
          </p>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Nama Lengkap
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  id="register-name-input"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Azril Yanz"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-900/90 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="auth-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-900/90 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="auth-password-input"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full pl-10 pr-10 py-2.5 bg-zinc-900/90 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Konfirmasi Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="register-confirm-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password Anda"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-900/90 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-colors"
                />
              </div>
            </div>
          )}

          <button
            id="auth-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-white text-black hover:bg-zinc-200 font-semibold text-sm transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : mode === 'login' ? (
              'Masuk Sekarang'
            ) : (
              'Daftar Akun'
            )}
          </button>
        </form>

        {/* Switch Mode Footer */}
        <div className="mt-5 pt-4 border-t border-zinc-800/80 text-center text-xs text-zinc-400">
          {mode === 'login' ? (
            <p>
              Belum punya akun?{' '}
              <button
                id="switch-to-register-btn"
                onClick={() => {
                  setMode('register');
                  setErrorMessage('');
                }}
                className="font-semibold text-white hover:underline ml-1"
              >
                Daftar sekarang
              </button>
            </p>
          ) : (
            <p>
              Sudah punya akun?{' '}
              <button
                id="switch-to-login-btn"
                onClick={() => {
                  setMode('login');
                  setErrorMessage('');
                }}
                className="font-semibold text-white hover:underline ml-1"
              >
                Masuk di sini
              </button>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
