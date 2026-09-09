import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import {
  Wallet,
  Copy,
  Check,
  ZoomIn,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  QrCode,
  Smartphone,
  Loader2,
  RefreshCw
} from 'lucide-react';
import QRISZoomModal from './QRISZoomModal';

const QRIS_IMAGE_URL = 'https://cdn.phototourl.com/free/2026-09-09-c2bc2515-a9d0-4b09-8137-3f3fed5407e4.jpg';
const DANA_NUMBER = '081316779475';

const QUICK_AMOUNTS = [1000, 2000, 5000, 10000, 20000, 50000];

export default function DepositView({ onOpenAuth }: { onOpenAuth: () => void }) {
  const { currentUser, userProfile } = useAuth();
  const { settings, deposits, createDeposit, addToast } = useStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [amount, setAmount] = useState<number>(5000);
  const [customAmount, setCustomAmount] = useState<string>('5000');
  const [senderName, setSenderName] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'QRIS' | 'DANA'>('QRIS');
  const [isZoomOpen, setIsZoomOpen] = useState<boolean>(false);
  const [copiedDana, setCopiedDana] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 mx-auto flex items-center justify-center text-zinc-400 mb-4">
          <Wallet className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Deposit Saldo YANZSTR</h2>
        <p className="text-xs text-zinc-400 mb-6 max-w-xs mx-auto">
          Silakan masuk atau daftar terlebih dahulu untuk melakukan pengisian saldo.
        </p>
        <button
          id="deposit-login-btn"
          onClick={onOpenAuth}
          className="py-2.5 px-6 rounded-xl bg-white text-black font-bold text-xs tracking-wide hover:bg-zinc-200 transition-all shadow-lg"
        >
          Masuk / Daftar
        </button>
      </div>
    );
  }

  const handleCopyDana = () => {
    navigator.clipboard.writeText(DANA_NUMBER);
    setCopiedDana(true);
    addToast('Nomor DANA berhasil disalin ke clipboard!', 'success');
    setTimeout(() => setCopiedDana(false), 2500);
  };

  const handleSelectAmount = (val: number) => {
    setAmount(val);
    setCustomAmount(val.toString());
  };

  const handleCustomChange = (val: string) => {
    setCustomAmount(val);
    const parsed = parseInt(val.replace(/\D/g, ''), 10);
    if (!isNaN(parsed)) {
      setAmount(parsed);
    } else {
      setAmount(0);
    }
  };

  const handleNextStep = () => {
    setErrorMsg('');
    if (step === 1) {
      if (amount < 1000) {
        setErrorMsg('Minimal deposit adalah Rp1.000.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!senderName.trim()) {
        setErrorMsg('Nama pengirim wajib diisi untuk verifikasi pembayaran.');
        return;
      }
      setStep(3);
    }
  };

  const handleSubmitDeposit = async () => {
    if (settings.storeStatus === 'CLOSED') {
      setErrorMsg('Store sedang ditutup sementara.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      await createDeposit(amount, senderName, paymentMethod);
      setStep(1);
      setSenderName('');
      setAmount(5000);
      setCustomAmount('5000');
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengirim deposit.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Deposit Form Card */}
      <div className="bg-[#0c0c12] border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
              Formulir Isi Saldo
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
              Deposit Saldo YANZSTR
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Minimal deposit Rp1.000. Proses verifikasi admin cepat dan aman.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3 px-4 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-400">Saldo Saat Ini</p>
              <p className="text-sm font-black text-white">
                Rp{(userProfile?.balance || 0).toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between my-6 max-w-md mx-auto">
          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step >= 1 ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              1
            </span>
            <span className={`text-xs ${step >= 1 ? 'text-white font-medium' : 'text-zinc-500'}`}>
              Nominal
            </span>
          </div>
          <div className={`h-0.5 flex-1 mx-2 ${step >= 2 ? 'bg-white' : 'bg-zinc-800'}`} />
          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step >= 2 ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              2
            </span>
            <span className={`text-xs ${step >= 2 ? 'text-white font-medium' : 'text-zinc-500'}`}>
              Nama Pengirim
            </span>
          </div>
          <div className={`h-0.5 flex-1 mx-2 ${step >= 3 ? 'bg-white' : 'bg-zinc-800'}`} />
          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step >= 3 ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              3
            </span>
            <span className={`text-xs ${step >= 3 ? 'text-white font-medium' : 'text-zinc-500'}`}>
              Pembayaran
            </span>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: PILIH NOMINAL */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-2">
                Pilih Nominal Cepat (IDR):
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                {QUICK_AMOUNTS.map((val) => (
                  <button
                    key={val}
                    id={`quick-amount-${val}-btn`}
                    type="button"
                    onClick={() => handleSelectAmount(val)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                      amount === val
                        ? 'bg-white text-black border-white shadow-lg'
                        : 'bg-zinc-900/80 text-zinc-300 border-zinc-800 hover:border-zinc-600'
                    }`}
                  >
                    Rp{val.toLocaleString('id-ID')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-2">
                Atau Masukkan Nominal Sendiri:
              </label>
              <div className="relative max-w-sm">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500 font-bold text-sm">
                  Rp
                </span>
                <input
                  id="custom-amount-input"
                  type="text"
                  value={customAmount}
                  onChange={(e) => handleCustomChange(e.target.value)}
                  placeholder="5000"
                  className="w-full pl-11 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-bold text-sm focus:outline-none focus:border-white transition-colors"
                />
              </div>
              <p className="text-[11px] text-zinc-500 mt-1.5">
                Minimal deposit: Rp1.000
              </p>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                id="deposit-step1-next-btn"
                type="button"
                onClick={handleNextStep}
                className="py-3 px-6 rounded-xl bg-white text-black font-bold text-xs hover:bg-zinc-200 transition-all flex items-center gap-2"
              >
                <span>Lanjut: Masukkan Pengirim</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: NAMA PENGIRIM */}
        {step === 2 && (
          <div className="space-y-6 max-w-md">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Nama Pemilik Rekening / Akun E-Wallet Pengirim:
              </label>
              <input
                id="sender-name-input"
                type="text"
                required
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Contoh: Azril / Yanz Pratama"
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-white transition-colors"
              />
              <p className="text-[11px] text-zinc-500 mt-1.5">
                Pastikan nama sesuai dengan yang tertera di bukti transfer bank/e-wallet Anda.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                id="deposit-step2-back-btn"
                type="button"
                onClick={() => setStep(1)}
                className="py-3 px-5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold transition-colors"
              >
                Kembali
              </button>
              <button
                id="deposit-step2-next-btn"
                type="button"
                onClick={handleNextStep}
                className="flex-1 py-3 px-6 rounded-xl bg-white text-black font-bold text-xs hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
              >
                <span>Lanjut: Pembayaran</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PILIH PEMBAYARAN & TRANSFER */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-xs flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-zinc-400">Total Transfer: </span>
                <span className="font-black text-white text-sm">
                  Rp{amount.toLocaleString('id-ID')}
                </span>
              </div>
              <div>
                <span className="text-zinc-400">Pengirim: </span>
                <span className="font-semibold text-white">{senderName}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-2">
                Pilih Metode Pembayaran:
              </label>
              <div className="grid grid-cols-2 gap-3 max-w-md">
                <button
                  id="select-qris-btn"
                  type="button"
                  onClick={() => setPaymentMethod('QRIS')}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                    paymentMethod === 'QRIS'
                      ? 'bg-zinc-800 border-white text-white shadow-md'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">QRIS All Payment</p>
                    <p className="text-[10px] text-zinc-400">BCA, Gopay, OVO, ShopeePay</p>
                  </div>
                </button>

                <button
                  id="select-dana-btn"
                  type="button"
                  onClick={() => setPaymentMethod('DANA')}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                    paymentMethod === 'DANA'
                      ? 'bg-zinc-800 border-white text-white shadow-md'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-sky-400" />
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">DANA</p>
                    <p className="text-[10px] text-zinc-400">Transfer Saldo DANA</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Instruction Area */}
            {paymentMethod === 'QRIS' ? (
              <div className="bg-zinc-950 border border-zinc-800/90 rounded-2xl p-5 max-w-sm mx-auto text-center space-y-3">
                <p className="text-xs font-bold text-zinc-200">
                  Scan QRIS di bawah ini dengan nominal pas:
                </p>
                <div
                  id="qris-click-zoom-container"
                  onClick={() => setIsZoomOpen(true)}
                  className="relative group cursor-pointer w-52 h-52 mx-auto bg-white p-3 rounded-xl shadow-lg flex items-center justify-center overflow-hidden"
                  title="Klik untuk memperbesar QRIS"
                >
                  <img
                    src={QRIS_IMAGE_URL}
                    alt="QRIS YANZSTR"
                    className="w-full h-full object-contain rounded"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5 backdrop-blur-[1px]">
                    <ZoomIn className="w-4 h-4" />
                    <span>Perbesar</span>
                  </div>
                </div>
                <button
                  id="qris-zoom-trigger-btn"
                  type="button"
                  onClick={() => setIsZoomOpen(true)}
                  className="text-xs text-emerald-400 hover:underline inline-flex items-center gap-1"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>Klik untuk Zoom QRIS</span>
                </button>
              </div>
            ) : (
              <div className="bg-zinc-950 border border-zinc-800/90 rounded-2xl p-5 max-w-sm mx-auto space-y-4">
                <div className="text-center">
                  <p className="text-xs text-zinc-400">Nomor Akun DANA YANZSTR:</p>
                  <p className="text-xl font-mono font-black text-white tracking-widest mt-1">
                    {DANA_NUMBER}
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">a.n. YANZSTR DIGITAL</p>
                </div>

                <button
                  id="copy-dana-number-btn"
                  type="button"
                  onClick={handleCopyDana}
                  className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-white transition-all flex items-center justify-center gap-2"
                >
                  {copiedDana ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Nomor DANA Disalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Salin Nomor DANA</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Submit Action */}
            <div className="flex gap-3 pt-2">
              <button
                id="deposit-step3-back-btn"
                type="button"
                onClick={() => setStep(2)}
                disabled={loading}
                className="py-3 px-5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold transition-colors disabled:opacity-50"
              >
                Kembali
              </button>
              <button
                id="submit-deposit-done-btn"
                type="button"
                onClick={handleSubmitDeposit}
                disabled={loading}
                className="flex-1 py-3 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mengirim Bukti Deposit...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Saya Sudah Transfer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Riwayat Deposit Section (Requirement #11) */}
      <div className="bg-[#0c0c12] border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Riwayat Deposit</h3>
            <p className="text-xs text-zinc-400">Daftar mutasi saldo dan status konfirmasi admin</p>
          </div>
        </div>

        {deposits.length === 0 ? (
          <div className="py-10 text-center border border-dashed border-zinc-800 rounded-2xl">
            <Clock className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-zinc-400">Belum ada riwayat deposit</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Isi form di atas untuk melakukan deposit saldo pertama Anda.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 px-2">ID Deposit</th>
                  <th className="pb-3 px-2">Nominal</th>
                  <th className="pb-3 px-2">Pengirim</th>
                  <th className="pb-3 px-2">Metode</th>
                  <th className="pb-3 px-2">Waktu</th>
                  <th className="pb-3 px-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {deposits.map((dep) => (
                  <tr key={dep.id} className="hover:bg-zinc-900/30 transition-colors">
                    <td className="py-3.5 px-2 font-mono text-zinc-300 text-[11px]">
                      #{dep.id.substring(0, 8)}
                    </td>
                    <td className="py-3.5 px-2 font-bold text-white">
                      Rp{dep.amount.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3.5 px-2 text-zinc-300 font-medium">
                      {dep.senderName}
                    </td>
                    <td className="py-3.5 px-2 text-zinc-400">
                      <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-semibold">
                        {dep.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 text-zinc-400 text-[11px]">
                      {formatDate(dep.createdAt)}
                    </td>
                    <td className="py-3.5 px-2 text-right">
                      {dep.status === 'PENDING' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-950/50 border border-amber-500/30 text-amber-300 font-semibold text-[11px]">
                          🟡 PENDING
                        </span>
                      )}
                      {dep.status === 'APPROVED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 font-semibold text-[11px]">
                          🟢 APPROVED
                        </span>
                      )}
                      {dep.status === 'REJECTED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-950/50 border border-rose-500/30 text-rose-300 font-semibold text-[11px]">
                          🔴 REJECTED
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <QRISZoomModal
        isOpen={isZoomOpen}
        onClose={() => setIsZoomOpen(false)}
        imageUrl={QRIS_IMAGE_URL}
      />
    </div>
  );
}
