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
  History
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
        <div className="w-16 h-16 rounded-2xl bg-[#140b2a] border border-purple-500/30 mx-auto flex items-center justify-center text-purple-400 mb-4 shadow-lg shadow-purple-950/50">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-white mb-2">Profil Pengguna</h2>
        <p className="text-xs text-zinc-300 mb-6 max-w-xs mx-auto">
          Masuk ke akun Anda untuk melihat saldo, riwayat transaksi, dan pengaturan keamanan akun.
        </p>
        <button
          id="account-login-btn"
          onClick={onOpenAuth}
          className="py-3 px-6 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs tracking-wide transition-all shadow-lg shadow-purple-600/30"
        >
          Masuk / Daftar Sekarang
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
      <div className="bg-[#0e081e] border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-purple-900/40">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-purple-900 to-violet-700 border-2 border-purple-400/60 flex items-center justify-center text-white font-black text-2xl sm:text-3xl shadow-xl shadow-purple-950/60">
              {userProfile.name.charAt(0).toUpperCase()}
              {isAdmin && (
                <div
                  className="absolute -bottom-1 -right-1 bg-purple-500 text-white p-1 rounded-lg shadow-md"
                  title="Admin Toko"
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
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    userProfile.status === 'suspended'
                      ? 'bg-rose-950/80 border-rose-800 text-rose-300'
                      : 'bg-purple-950/80 border-purple-500/50 text-purple-300'
                  }`}
                >
                  {userProfile.status}
                </span>
              </div>
              <p className="text-xs text-zinc-300 flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-purple-400" />
                <span>{userProfile.email}</span>
              </p>
              <p className="text-[11px] text-zinc-400 flex items-center gap-1.5 mt-1">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
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
              className="py-2 px-4 rounded-xl border border-purple-500/30 hover:border-purple-400 bg-[#140b2a] text-xs font-bold text-purple-200 hover:text-white transition-all flex items-center gap-2"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>{isEditingName ? 'Tutup Edit' : 'Edit Profil'}</span>
            </button>

            <button
              id="change-pass-trigger-btn"
              onClick={() => setIsChangingPass(!isChangingPass)}
              className="py-2 px-4 rounded-xl border border-purple-500/30 hover:border-purple-400 bg-[#140b2a] text-xs font-bold text-purple-200 hover:text-white transition-all flex items-center gap-2"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isChangingPass ? 'Tutup Password' : 'Ganti Password'}</span>
            </button>

            <button
              id="account-logout-btn"
              onClick={logout}
              className="py-2 px-4 rounded-xl border border-rose-900/40 hover:bg-rose-950/40 text-xs font-bold text-rose-400 transition-all flex items-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Edit Name Inline Form */}
        {isEditingName && (
          <form onSubmit={handleSaveName} className="py-4 border-b border-purple-900/40 max-w-md space-y-3">
            <h4 className="text-xs font-bold text-purple-200">Ubah Nama Profil</h4>
            <div className="flex gap-2">
              <input
                id="edit-name-input"
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nama Anda"
                className="flex-1 px-3.5 py-2 bg-[#140b2a] border border-purple-500/40 rounded-xl text-xs text-white focus:outline-none focus:border-purple-400"
              />
              <button
                id="save-name-btn"
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition-colors"
              >
                Simpan
              </button>
            </div>
          </form>
        )}

        {/* Change Password Inline Form */}
        {isChangingPass && (
          <form onSubmit={handleChangePassword} className="py-4 border-b border-purple-900/40 max-w-md space-y-3">
            <h4 className="text-xs font-bold text-purple-200">Ganti Password Akun</h4>
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
              className="w-full px-3.5 py-2 bg-[#140b2a] border border-purple-500/40 rounded-xl text-xs text-white focus:outline-none focus:border-purple-400"
            />
            <input
              id="confirm-change-pass-input"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi password baru"
              className="w-full px-3.5 py-2 bg-[#140b2a] border border-purple-500/40 rounded-xl text-xs text-white focus:outline-none focus:border-purple-400"
            />
            <button
              id="save-new-pass-btn"
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition-colors"
            >
              Update Password
            </button>
          </form>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
          <div className="bg-[#140b2a] border border-purple-500/30 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="space-y-1">
              <span className="text-[11px] text-purple-300 font-bold">Saldo Dompet</span>
              <p className="text-xl font-black text-white">
                Rp{(userProfile.balance || 0).toLocaleString('id-ID')}
              </p>
              <button
                id="metric-deposit-btn"
                onClick={onGotoDeposit}
                className="text-[11px] font-bold text-purple-400 hover:text-purple-300 hover:underline inline-block pt-1"
              >
                + Top Up / Deposit
              </button>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Wallet className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#140b2a] border border-purple-500/30 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="space-y-1">
              <span className="text-[11px] text-purple-300 font-bold">Total Pesanan</span>
              <p className="text-xl font-black text-white">{orders.length}</p>
              <button
                id="metric-orders-btn"
                onClick={onGotoOrders}
                className="text-[11px] font-bold text-purple-300 hover:text-white hover:underline inline-block pt-1"
              >
                Lihat Riwayat
              </button>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#140b2a] border border-purple-500/30 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="space-y-1">
              <span className="text-[11px] text-purple-300 font-bold">Total Deposit</span>
              <p className="text-xl font-black text-white">{deposits.length}</p>
              <span className="text-[11px] text-purple-400 inline-block pt-1">
                {deposits.filter((d) => d.status === 'APPROVED').length} Berhasil
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <ArrowDownCircle className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Mutasi Saldo & Log Transaksi */}
      <div className="bg-[#0e081e] border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <History className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-black text-white tracking-tight">Mutasi & Riwayat Transaksi Saldo</h3>
          </div>
          <span className="text-xs text-purple-400 font-medium">Realtime Database</span>
        </div>

        {transactions.length === 0 ? (
          <div className="py-10 text-center border border-dashed border-purple-900/40 rounded-2xl">
            <p className="text-xs text-zinc-400">Belum ada catatan mutasi saldo.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#170e30]">
            {transactions.map((tx) => {
              const isPositive = tx.amount > 0;
              return (
                <div key={tx.id} className="py-3.5 flex items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <p className="font-bold text-white">{tx.description}</p>
                    <p className="text-[10px] text-zinc-400">
                      {formatDate(tx.createdAt)} • Saldo: Rp{tx.balanceBefore?.toLocaleString('id-ID')} → Rp{tx.balanceAfter?.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-mono font-black text-sm ${
                        isPositive ? 'text-purple-300' : 'text-rose-400'
                      }`}
                    >
                      {isPositive ? '+' : ''}Rp{tx.amount.toLocaleString('id-ID')}
                    </span>
                    <span className="block text-[10px] font-bold text-purple-400/80 uppercase tracking-wider">
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
