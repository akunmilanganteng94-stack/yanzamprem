import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import {
  User,
  Mail,
  Wallet,
  ShoppingBag,
  ArrowDownCircle,
  Calendar,
  Lock,
  Edit2,
  LogOut,
  Shield,
  History,
  Check,
  AlertCircle,
  Loader2
} from 'lucide-react';

export default function AccountView({
  onOpenAuth,
  onGotoDeposit,
  onGotoOrders
}: {
  onOpenAuth: () => void;
  onGotoDeposit: () => void;
  onGotoOrders: () => void;
}) {
  const { currentUser, userProfile, isAdmin, logout, updateName, changePassword } = useAuth();
  const { orders, deposits, transactions, addToast } = useStore();

  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(userProfile?.name || '');
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!currentUser || !userProfile) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 mx-auto flex items-center justify-center text-zinc-400 mb-4">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Profil Pengguna</h2>
        <p className="text-xs text-zinc-400 mb-6 max-w-xs mx-auto">
          Masuk ke akun Anda untuk melihat saldo, riwayat transaksi, dan pengaturan keamanan.
        </p>
        <button
          id="account-login-btn"
          onClick={onOpenAuth}
          className="py-2.5 px-6 rounded-xl bg-white text-black font-bold text-xs tracking-wide hover:bg-zinc-200 transition-all shadow-lg"
        >
          Masuk / Daftar
        </button>
      </div>
    );
  }

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setLoading(true);
    setErrorMsg('');
    try {
      await updateName(newName.trim());
      setIsEditingName(false);
      addToast('Nama profil berhasil diperbarui!', 'success');
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengubah nama.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setErrorMsg('Password baru minimal 6 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Konfirmasi password tidak cocok.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      await changePassword(newPassword);
      setIsChangingPass(false);
      setNewPassword('');
      setConfirmPassword('');
      addToast('Password berhasil diubah!', 'success');
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengganti password. Coba login ulang.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Profile Overview Card */}
      <div className="bg-[#0d0d12] border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-zinc-800/80">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-zinc-800 to-zinc-700 border border-zinc-600/50 flex items-center justify-center text-white font-extrabold text-2xl sm:text-3xl shadow-xl">
              {userProfile.name.charAt(0).toUpperCase()}
              {isAdmin && (
                <div
                  className="absolute -bottom-1 -right-1 bg-amber-400 text-black p-1 rounded-lg shadow"
                  title="Admin Store"
                >
                  <Shield className="w-3.5 h-3.5 fill-current" />
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {userProfile.name}
                </h2>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    userProfile.status === 'suspended'
                      ? 'bg-rose-950/80 border border-rose-800 text-rose-300'
                      : 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300'
                  }`}
                >
                  {userProfile.status}
                </span>
              </div>
              <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-zinc-500" />
                <span>{userProfile.email}</span>
              </p>
              <p className="text-[11px] text-zinc-500 flex items-center gap-1.5 mt-1">
                <Calendar className="w-3.5 h-3.5 text-zinc-600" />
                <span>Bergabung sejak {formatDate(userProfile.createdAt)}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
            <button
              id="edit-profile-trigger-btn"
              onClick={() => {
                setNewName(userProfile.name);
                setIsEditingName(!isEditingName);
              }}
              className="py-2 px-4 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900 text-xs font-semibold text-zinc-300 hover:text-white transition-all flex items-center gap-2"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>{isEditingName ? 'Tutup Edit' : 'Edit Profil'}</span>
            </button>

            <button
              id="change-pass-trigger-btn"
              onClick={() => setIsChangingPass(!isChangingPass)}
              className="py-2 px-4 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900 text-xs font-semibold text-zinc-300 hover:text-white transition-all flex items-center gap-2"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isChangingPass ? 'Tutup Password' : 'Ganti Password'}</span>
            </button>

            <button
              id="account-logout-btn"
              onClick={logout}
              className="py-2 px-4 rounded-xl border border-rose-900/40 hover:bg-rose-950/30 text-xs font-semibold text-rose-400 transition-all flex items-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Edit Name Inline Form */}
        {isEditingName && (
          <form onSubmit={handleSaveName} className="py-4 border-b border-zinc-800 max-w-md space-y-3">
            <h4 className="text-xs font-bold text-white">Ubah Nama Profil</h4>
            <div className="flex gap-2">
              <input
                id="edit-name-input"
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nama Anda"
                className="flex-1 px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-white"
              />
              <button
                id="save-name-btn"
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-white text-black font-bold text-xs rounded-xl hover:bg-zinc-200 transition-colors"
              >
                Simpan
              </button>
            </div>
          </form>
        )}

        {/* Change Password Inline Form */}
        {isChangingPass && (
          <form onSubmit={handleChangePassword} className="py-4 border-b border-zinc-800 max-w-md space-y-3">
            <h4 className="text-xs font-bold text-white">Ganti Password Akun</h4>
            {errorMsg && (
              <p className="text-xs text-rose-400">{errorMsg}</p>
            )}
            <input
              id="change-pass-input"
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Password baru (min. 6 karakter)"
              className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-white"
            />
            <input
              id="confirm-change-pass-input"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi password baru"
              className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-white"
            />
            <button
              id="save-new-pass-btn"
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-white text-black font-bold text-xs rounded-xl hover:bg-zinc-200 transition-colors"
            >
              Update Password
            </button>
          </form>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
          {/* Metric 1: Saldo */}
          <div className="bg-zinc-900/80 border border-zinc-800/90 rounded-2xl p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] text-zinc-400 font-medium">Saldo Dompet</span>
              <p className="text-xl font-black text-white">
                Rp{(userProfile.balance || 0).toLocaleString('id-ID')}
              </p>
              <button
                id="metric-deposit-btn"
                onClick={onGotoDeposit}
                className="text-[11px] font-semibold text-emerald-400 hover:underline inline-block pt-1"
              >
                + Top Up / Deposit
              </button>
            </div>
            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-300">
              <Wallet className="w-5 h-5" />
            </div>
          </div>

          {/* Metric 2: Orders */}
          <div className="bg-zinc-900/80 border border-zinc-800/90 rounded-2xl p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] text-zinc-400 font-medium">Total Pesanan</span>
              <p className="text-xl font-black text-white">{orders.length}</p>
              <button
                id="metric-orders-btn"
                onClick={onGotoOrders}
                className="text-[11px] font-semibold text-zinc-300 hover:underline inline-block pt-1"
              >
                Lihat Riwayat →
              </button>
            </div>
            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-300">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>

          {/* Metric 3: Deposits */}
          <div className="bg-zinc-900/80 border border-zinc-800/90 rounded-2xl p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] text-zinc-400 font-medium">Total Deposit</span>
              <p className="text-xl font-black text-white">{deposits.length}</p>
              <span className="text-[11px] text-zinc-500 inline-block pt-1">
                {deposits.filter((d) => d.status === 'APPROVED').length} Sukses
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-300">
              <ArrowDownCircle className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Mutasi Saldo & Log Transaksi */}
      <div className="bg-[#0d0d12] border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <History className="w-5 h-5 text-zinc-400" />
            <h3 className="text-lg font-bold text-white tracking-tight">Mutasi & Riwayat Transaksi Saldo</h3>
          </div>
          <span className="text-xs text-zinc-500">Realtime dari Firestore</span>
        </div>

        {transactions.length === 0 ? (
          <div className="py-10 text-center border border-dashed border-zinc-800 rounded-2xl">
            <p className="text-xs text-zinc-500">Belum ada catatan transaksi saldo.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-900">
            {transactions.map((tx) => {
              const isPositive = tx.amount > 0;
              return (
                <div key={tx.id} className="py-3.5 flex items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-zinc-200">{tx.description}</p>
                    <p className="text-[10px] text-zinc-500">
                      {formatDate(tx.createdAt)} • Saldo: Rp{tx.balanceBefore?.toLocaleString('id-ID')} → Rp{tx.balanceAfter?.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-mono font-bold text-sm ${
                        isPositive ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isPositive ? '+' : ''}Rp{tx.amount.toLocaleString('id-ID')}
                    </span>
                    <span className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                      {tx.type}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
