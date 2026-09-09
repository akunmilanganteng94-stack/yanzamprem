import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import {
  ShoppingBag,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  ShieldCheck
} from 'lucide-react';

export default function OrdersView({ onOpenAuth }: { onOpenAuth: () => void }) {
  const { currentUser } = useAuth();
  const { orders, addToast } = useStore();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#140b2a] border border-purple-500/30 mx-auto flex items-center justify-center text-purple-400 mb-4 shadow-lg shadow-purple-950/50">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-white mb-2">Riwayat Pesanan</h2>
        <p className="text-xs text-zinc-300 mb-6 max-w-xs mx-auto">
          Silakan masuk untuk melihat akun Alight Motion Premium yang telah Anda beli.
        </p>
        <button
          id="orders-login-btn"
          onClick={onOpenAuth}
          className="py-3 px-6 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs tracking-wide transition-all shadow-lg shadow-purple-600/30"
        >
          Masuk / Daftar Sekarang
        </button>
      </div>
    );
  }

  const handleCopy = (text: string, keyIdentifier: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyIdentifier);
    addToast(`${label} berhasil disalin!`, 'success');
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
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
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-purple-900/40">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-purple-400">
            Transaksi Akun Digital
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
            Riwayat Pesanan Saya
          </h2>
          <p className="text-xs text-zinc-300 mt-1">
            Klik pesanan untuk melihat detail email & password akun yang Anda dapatkan secara langsung.
          </p>
        </div>
        <div className="text-xs text-zinc-300 bg-[#140b2a] border border-purple-500/30 rounded-xl px-3.5 py-2 self-start sm:self-auto shadow-sm">
          Total: <span className="font-bold text-white">{orders.length}</span> Pesanan
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-purple-900/40 rounded-3xl bg-[#0c0819]">
          <ShoppingBag className="w-10 h-10 text-purple-400/60 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white">Belum Ada Pesanan</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1 mb-6">
            Anda belum pernah membeli produk di toko ini. Mulai beli Alight Motion Premium seharga Rp500!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const items = order.items || [];
            return (
              <div
                key={order.id}
                className="bg-[#0e081e] border border-purple-500/30 rounded-2xl overflow-hidden shadow-lg shadow-purple-950/30 transition-all"
              >
                {/* Order Summary Header */}
                <div
                  id={`order-header-${order.id}`}
                  onClick={() => toggleExpand(order.id)}
                  className="p-5 cursor-pointer hover:bg-[#150c2e]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-purple-300">
                        ORDER #YZ{order.id.substring(0, 6).toUpperCase()}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/40 text-[10px] font-bold text-purple-300">
                        {order.status}
                      </span>
                    </div>

                    <h4 className="text-base font-black text-white">
                      {order.productName || 'Alight Motion Premium'}
                    </h4>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-300">
                      <span>Jumlah: <strong className="text-white">{order.quantity} Akun</strong></span>
                      <span>•</span>
                      <span>Total: <strong className="text-white">Rp{order.totalPrice.toLocaleString('id-ID')}</strong></span>
                      <span>•</span>
                      <span className="text-[11px] text-zinc-400">{formatDate(order.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-purple-900/30">
                    <span className="text-xs font-bold text-purple-300 hover:text-white">
                      {isExpanded ? 'Sembunyikan Akun' : 'Lihat Akun'}
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-[#170e30] border border-purple-500/30 flex items-center justify-center text-purple-300">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Account Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-3 border-t border-purple-900/40 bg-[#090514]/70 space-y-4">
                    <p className="text-[11px] text-purple-300 font-bold uppercase tracking-wider">
                      Detail Akun Digital Anda ({items.length} Akun):
                    </p>

                    {items.length === 0 ? (
                      <p className="text-xs text-zinc-400">Data akun tidak tersedia dalam order ini.</p>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {items.map((item, idx) => (
                          <div
                            key={idx}
                            className="bg-[#120a26] border border-purple-500/30 rounded-xl p-4 space-y-3 shadow-inner"
                          >
                            <div className="flex items-center justify-between text-xs pb-2 border-b border-purple-900/40">
                              <span className="font-bold text-white">Akun #{idx + 1}</span>
                              <span className="text-[10px] text-purple-300 font-bold flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                                <span>Garansi Aktif</span>
                              </span>
                            </div>

                            {/* Email / Account Field */}
                            <div>
                              <span className="text-[10px] text-purple-300 font-bold">Email / Account</span>
                              <div className="flex items-center justify-between gap-2 mt-1 bg-[#090514] px-3 py-2 rounded-lg border border-purple-900/50">
                                <span className="font-mono text-xs text-white truncate select-all">
                                  {item.account}
                                </span>
                                <button
                                  id={`copy-email-${order.id}-${idx}`}
                                  type="button"
                                  onClick={() => handleCopy(item.account, `${order.id}-${idx}-email`, 'Email')}
                                  className="text-purple-300 hover:text-white p-1 shrink-0 transition-colors"
                                  title="Copy Email"
                                >
                                  {copiedKey === `${order.id}-${idx}-email` ? (
                                    <Check className="w-3.5 h-3.5 text-purple-400" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* Password Field */}
                            <div>
                              <span className="text-[10px] text-purple-300 font-bold">Password</span>
                              <div className="flex items-center justify-between gap-2 mt-1 bg-[#090514] px-3 py-2 rounded-lg border border-purple-900/50">
                                <span className="font-mono text-xs text-white select-all">
                                  {item.password}
                                </span>
                                <button
                                  id={`copy-pass-${order.id}-${idx}`}
                                  type="button"
                                  onClick={() => handleCopy(item.password, `${order.id}-${idx}-pass`, 'Password')}
                                  className="text-purple-300 hover:text-white p-1 shrink-0 transition-colors"
                                  title="Copy Password"
                                >
                                  {copiedKey === `${order.id}-${idx}-pass` ? (
                                    <Check className="w-3.5 h-3.5 text-purple-400" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* Installation Note */}
                            {item.installationNote && (
                              <div className="bg-[#090514]/80 p-2.5 rounded-lg border border-purple-900/30 text-[11px] text-zinc-300">
                                <strong className="text-purple-300">Catatan: </strong>
                                <span>{item.installationNote}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
