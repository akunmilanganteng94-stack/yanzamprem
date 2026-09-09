import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import {
  collection,
  onSnapshot
} from 'firebase/firestore';
import { db, RECOMMENDED_FIRESTORE_RULES } from '../lib/firebase';
import {
  UserProfile,
  StockItem,
  Deposit,
  Order,
  AuditLog
} from '../types';
import {
  Shield,
  Users,
  Package,
  ArrowDownCircle,
  ShoppingBag,
  TrendingUp,
  Settings,
  FileText,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Power,
  DollarSign,
  Lock,
  Database,
  Copy,
  Check,
  ExternalLink,
  Code
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

export default function AdminView({ onOpenAuth }: { onOpenAuth: () => void }) {
  const { currentUser, isAdmin } = useAuth();
  const {
    settings,
    updateStoreSettings,
    approveDeposit,
    rejectDeposit,
    addStockItem,
    addMultipleStockItems,
    deleteStockItem,
    deleteAllAvailableStock,
    adjustBalance,
    toggleUserStatus,
    initializeSampleData,
    addToast
  } = useStore();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'stock' | 'deposits' | 'orders' | 'settings' | 'audit'>('dashboard');

  // Admin realtime collections
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [allStock, setAllStock] = useState<StockItem[]>([]);
  const [allDeposits, setAllDeposits] = useState<Deposit[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Filtering / Search
  const [userSearch, setUserSearch] = useState('');
  const [depositFilter, setDepositFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'AVAILABLE' | 'SOLD'>('ALL');

  // Stock Form Inputs
  const [stockAccount, setStockAccount] = useState('');
  const [stockPassword, setStockPassword] = useState('');
  const [stockNote, setStockNote] = useState('');
  const [bulkStockText, setBulkStockText] = useState('');
  const [showBulkStock, setShowBulkStock] = useState(false);

  // Stock Deletion Confirmation state
  const [stockToDelete, setStockToDelete] = useState<StockItem | null>(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);

  // Balance adjustment modal
  const [adjustModalUser, setAdjustModalUser] = useState<UserProfile | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('5000');
  const [adjustDirection, setAdjustDirection] = useState<'ADD' | 'SUBTRACT'>('ADD');
  const [adjustReason, setAdjustReason] = useState('Top Up Bonus Promo');

  // Settings form
  const [editPrice, setEditPrice] = useState(settings.productPrice.toString());
  const [editStoreName, setEditStoreName] = useState(settings.storeName);
  const [editWaChannel, setEditWaChannel] = useState(settings.whatsappChannel);
  const [loadingAction, setLoadingAction] = useState(false);

  // Firestore rules notice state
  const [rulesWarning, setRulesWarning] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [copiedRules, setCopiedRules] = useState(false);

  const handleCopyRules = () => {
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(RECOMMENDED_FIRESTORE_RULES);
      } else {
        const ta = document.createElement('textarea');
        ta.value = RECOMMENDED_FIRESTORE_RULES;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopiedRules(true);
      addToast('Aturan firestore.rules berhasil disalin!', 'success', 'Tersalin');
      setTimeout(() => setCopiedRules(false), 3000);
    } catch {
      addToast('Silakan pilih dan salin teks rules secara manual', 'info');
    }
  };

  useEffect(() => {
    setEditPrice((settings.productPrice || 500).toString());
    setEditStoreName(settings.storeName || 'YANZSTR');
    setEditWaChannel(settings.whatsappChannel || '');
  }, [settings]);

  useEffect(() => {
    if (!currentUser || !isAdmin) return;

    // 1. Users
    const unsubUsers = onSnapshot(
      collection(db, 'users'),
      (snap) => {
        const list: UserProfile[] = [];
        snap.forEach((d) => {
          const data = d.data();
          list.push({
            uid: d.id,
            email: data.email || '',
            name: data.name || 'User',
            role: data.role || 'user',
            balance: typeof data.balance === 'number' ? data.balance : Number(data.balance || 0),
            status: data.status || 'active',
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
          });
        });
        setAllUsers(list);
      },
      (error) => {
        console.warn('[Admin View] users listener access notice:', error.message);
        if (error.message.includes('permission-denied') || (error as any).code === 'permission-denied') {
          setRulesWarning(true);
        }
      }
    );

    // 2. Stock
    const unsubStock = onSnapshot(
      collection(db, 'stock'),
      (snap) => {
        const list: StockItem[] = [];
        snap.forEach((d) => {
          const data = d.data();
          list.push({
            id: d.id,
            productId: data.productId || 'alight-motion-premium-01',
            account: data.account || '',
            password: data.password || '',
            installationNote: data.installationNote || '',
            status: data.status || 'AVAILABLE',
            orderId: data.orderId || null,
            createdAt: data.createdAt,
            soldAt: data.soldAt
          });
        });
        list.sort((a, b) => {
          const tA = a.createdAt?.seconds || 0;
          const tB = b.createdAt?.seconds || 0;
          return tB - tA;
        });
        setAllStock(list);
      },
      (error) => {
        console.warn('[Admin View] stock listener access notice:', error.message);
        if (error.message.includes('permission-denied') || (error as any).code === 'permission-denied') {
          setRulesWarning(true);
        }
      }
    );

    // 3. Deposits
    const unsubDeposits = onSnapshot(
      collection(db, 'deposits'),
      (snap) => {
        const list: Deposit[] = [];
        snap.forEach((d) => {
          const data = d.data();
          list.push({
            id: d.id,
            userId: data.userId,
            userEmail: data.userEmail || '',
            amount: data.amount,
            senderName: data.senderName,
            paymentMethod: data.paymentMethod,
            status: data.status,
            adminId: data.adminId,
            createdAt: data.createdAt,
            approvedAt: data.approvedAt
          });
        });
        list.sort((a, b) => {
          const tA = a.createdAt?.seconds || 0;
          const tB = b.createdAt?.seconds || 0;
          return tB - tA;
        });
        setAllDeposits(list);
      },
      (error) => {
        console.warn('[Admin View] deposits listener access notice:', error.message);
        if (error.message.includes('permission-denied') || (error as any).code === 'permission-denied') {
          setRulesWarning(true);
        }
      }
    );

    // 4. Orders
    const unsubOrders = onSnapshot(
      collection(db, 'orders'),
      (snap) => {
        const list: Order[] = [];
        snap.forEach((d) => {
          const data = d.data();
          list.push({
            id: d.id,
            userId: data.userId,
            userEmail: data.userEmail || '',
            productId: data.productId,
            productName: data.productName,
            quantity: data.quantity,
            totalPrice: data.totalPrice,
            items: data.items || [],
            status: data.status,
            createdAt: data.createdAt
          });
        });
        list.sort((a, b) => {
          const tA = a.createdAt?.seconds || 0;
          const tB = b.createdAt?.seconds || 0;
          return tB - tA;
        });
        setAllOrders(list);
      },
      (error) => {
        console.warn('[Admin View] orders listener access notice:', error.message);
        if (error.message.includes('permission-denied') || (error as any).code === 'permission-denied') {
          setRulesWarning(true);
        }
      }
    );

    // 5. Audit Logs
    const unsubLogs = onSnapshot(
      collection(db, 'auditLogs'),
      (snap) => {
        const list: AuditLog[] = [];
        snap.forEach((d) => {
          const data = d.data();
          list.push({
            id: d.id,
            adminId: data.adminId,
            adminEmail: data.adminEmail,
            action: data.action,
            target: data.target,
            description: data.description,
            createdAt: data.createdAt
          });
        });
        list.sort((a, b) => {
          const tA = a.createdAt?.seconds || 0;
          const tB = b.createdAt?.seconds || 0;
          return tB - tA;
        });
        setAuditLogs(list);
      },
      (error) => {
        console.warn('[Admin View] auditLogs listener access notice:', error.message);
        if (error.message.includes('permission-denied') || (error as any).code === 'permission-denied') {
          setRulesWarning(true);
        }
      }
    );

    return () => {
      unsubUsers();
      unsubStock();
      unsubDeposits();
      unsubOrders();
      unsubLogs();
    };
  }, [currentUser, isAdmin]);

  if (!currentUser || !isAdmin) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#140b29] border border-purple-500/40 mx-auto flex items-center justify-center text-purple-400 mb-4 shadow-lg shadow-purple-950/50">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-white mb-2">Akses Khusus Administrator</h2>
        <p className="text-xs text-zinc-300 mb-6 leading-relaxed">
          Halaman ini khusus untuk manajemen toko digital YANZSTR. Silakan masuk menggunakan akun dengan hak akses admin.
        </p>
        <button
          id="admin-login-prompt-btn"
          onClick={onOpenAuth}
          className="py-3 px-6 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-lg shadow-purple-600/30"
        >
          Masuk dengan Akun Admin
        </button>
      </div>
    );
  }

  // Dashboard Stats Calculations
  const totalUsersCount = allUsers.length;
  const activeUsersCount = allUsers.filter((u) => u.status === 'active').length;
  const totalDepositAmount = allDeposits
    .filter((d) => d.status === 'APPROVED')
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const pendingDepositsCount = allDeposits.filter((d) => d.status === 'PENDING').length;
  const totalOrdersCount = allOrders.length;
  const totalRevenue = allOrders
    .filter((o) => o.status === 'SUCCESS')
    .reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);
  const totalStockCount = allStock.length;
  const availableStock = allStock.filter((s) => s.status === 'AVAILABLE').length;
  const soldStock = allStock.filter((s) => s.status === 'SOLD').length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const ordersToday = allOrders.filter((o) => {
    if (!o.createdAt) return false;
    const d = o.createdAt.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
    return d >= today;
  }).length;

  const chartData = [
    { day: 'Sen', order: 12, omset: 6000 },
    { day: 'Sel', order: 18, omset: 9000 },
    { day: 'Rab', order: 25, omset: 12500 },
    { day: 'Kam', order: 20, omset: 10000 },
    { day: 'Jum', order: 32, omset: 16000 },
    { day: 'Sab', order: 45, omset: 22500 },
    { day: 'Min', order: 54, omset: 27000 },
  ];

  // Stock deletion handlers (Requirement: "admin bisa hapus stok")
  const handleConfirmDeleteSingleStock = async () => {
    if (!stockToDelete) return;
    setLoadingAction(true);
    try {
      await deleteStockItem(stockToDelete.id);
      setStockToDelete(null);
    } catch (err: any) {
      addToast(err.message || 'Gagal menghapus stok', 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleConfirmDeleteAllAvailable = async () => {
    setLoadingAction(true);
    try {
      await deleteAllAvailableStock();
      setShowDeleteAllModal(false);
    } catch (err: any) {
      addToast(err.message || 'Gagal menghapus semua stok', 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  // Single stock add
  const handleAddSingleStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockAccount.trim() || !stockPassword.trim()) {
      addToast('Email/Akun dan Password stok wajib diisi', 'error');
      return;
    }
    setLoadingAction(true);
    try {
      await addStockItem(stockAccount, stockPassword, stockNote);
      setStockAccount('');
      setStockPassword('');
      setStockNote('');
    } catch (err: any) {
      addToast(err.message || 'Gagal menambahkan stok', 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  // Bulk stock add
  const handleBulkAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    const lines = bulkStockText.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) {
      addToast('Masukkan format akun per baris', 'error');
      return;
    }
    const items: { account: string; password: string; installationNote?: string }[] = [];
    for (const l of lines) {
      const parts = l.includes('|') ? l.split('|') : l.split(',');
      if (parts.length >= 2) {
        items.push({
          account: parts[0].trim(),
          password: parts[1].trim(),
          installationNote: parts[2]?.trim() || 'Akun Alight Motion Premium YANZSTR'
        });
      }
    }
    if (items.length === 0) {
      addToast('Format tidak valid. Gunakan format email|password per baris.', 'error');
      return;
    }
    setLoadingAction(true);
    try {
      const added = await addMultipleStockItems(items);
      setBulkStockText('');
      setShowBulkStock(false);
      addToast(`Berhasil menambahkan ${added} akun stok.`, 'success');
    } catch (err: any) {
      addToast(err.message || 'Gagal menambahkan bulk stok', 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  // Deposit handlers
  const handleApproveDeposit = async (depId: string) => {
    setLoadingAction(true);
    try {
      await approveDeposit(depId);
    } catch (err: any) {
      addToast(err.message || 'Gagal menyetujui deposit', 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleRejectDeposit = async (depId: string) => {
    if (!window.confirm('Tolak permintaan deposit ini?')) return;
    setLoadingAction(true);
    try {
      await rejectDeposit(depId);
    } catch (err: any) {
      addToast(err.message || 'Gagal menolak deposit', 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  // User management
  const handleOpenAdjust = (user: UserProfile) => {
    setAdjustModalUser(user);
    setAdjustAmount('5000');
    setAdjustDirection('ADD');
    setAdjustReason('Bonus promo YANZSTR');
  };

  const handleExecuteAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustModalUser) return;
    const amt = parseInt(adjustAmount.replace(/\D/g, ''), 10);
    if (isNaN(amt) || amt <= 0) {
      addToast('Nominal adjustment tidak valid', 'error');
      return;
    }
    setLoadingAction(true);
    try {
      await adjustBalance(adjustModalUser.uid, amt, adjustDirection, adjustReason);
      setAdjustModalUser(null);
    } catch (err: any) {
      addToast(err.message || 'Gagal menyesuaikan saldo', 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleToggleSuspend = async (user: UserProfile) => {
    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    if (!window.confirm(`Ubah status user ${user.email} menjadi ${nextStatus.toUpperCase()}?`)) return;
    try {
      await toggleUserStatus(user.uid, nextStatus);
    } catch (err: any) {
      addToast(err.message || 'Gagal mengubah status', 'error');
    }
  };

  // Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseInt(editPrice.replace(/\D/g, ''), 10);
    if (isNaN(priceNum) || priceNum <= 0) {
      addToast('Harga produk tidak valid', 'error');
      return;
    }
    setLoadingAction(true);
    try {
      await updateStoreSettings({
        productPrice: priceNum,
        storeName: editStoreName.trim() || 'YANZSTR',
        whatsappChannel: editWaChannel.trim()
      });
    } catch (err: any) {
      addToast(err.message || 'Gagal menyimpan pengaturan', 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleToggleStoreStatus = async () => {
    const nextStatus = settings.storeStatus === 'OPEN' ? 'CLOSED' : 'OPEN';
    try {
      await updateStoreSettings({ storeStatus: nextStatus });
    } catch (err: any) {
      addToast(err.message || 'Gagal mengubah status toko', 'error');
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0e081e] border border-purple-500/30 rounded-3xl p-6 shadow-2xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white font-black flex items-center justify-center shadow-lg shadow-purple-600/30">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white tracking-tight">YANZSTR Admin Panel</h2>
              <span className="px-2 py-0.5 rounded-md bg-purple-950 border border-purple-500/30 text-[10px] font-mono text-purple-300">
                PRO
              </span>
            </div>
            <p className="text-xs text-zinc-300">
              Pengelolaan database realtime, stok akun Alight Motion, deposit, dan otoritas toko
            </p>
          </div>
        </div>

        {/* Store Status Toggle & Quick Seed */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="admin-toggle-store-status-btn"
            type="button"
            onClick={handleToggleStoreStatus}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs tracking-wide transition-all border shadow-lg ${
              settings.storeStatus === 'OPEN'
                ? 'bg-purple-950/80 border-purple-500/50 text-purple-200 hover:bg-purple-900/60'
                : 'bg-rose-950/80 border-rose-500/50 text-rose-300 hover:bg-rose-900/60'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{settings.storeStatus === 'OPEN' ? 'STORE OPEN' : 'STORE CLOSED'}</span>
          </button>

          {allStock.length === 0 && (
            <button
              id="admin-seed-database-btn"
              type="button"
              onClick={initializeSampleData}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors shadow-md shadow-purple-600/20"
              title="Isi database dengan pengaturan awal dan 5 stok siap jual"
            >
              <Database className="w-4 h-4 text-white" />
              <span>Inisialisasi Stok Awal</span>
            </button>
          )}
        </div>
      </div>

      {/* Firestore Security Rules Banner (Shown if permission-denied or when clicked) */}
      {rulesWarning && (
        <div className="bg-gradient-to-r from-amber-950/60 via-purple-950/70 to-amber-950/60 border border-amber-500/40 rounded-3xl p-5 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-amber-200 tracking-wide">
                  Perhatian: Aturan Keamanan Firestore Perlu Diterapkan
                </h4>
                <p className="text-xs text-zinc-300 mt-0.5 leading-relaxed">
                  Firebase mengembalikan peringatan <span className="font-mono text-amber-300 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">permission-denied</span>. Salin aturan <span className="font-mono text-purple-300">firestore.rules</span> kami dan terapkan di Firebase Console agar hak admin dan realtime sync berjalan lancar.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <button
                type="button"
                onClick={handleCopyRules}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-all shadow-md shadow-amber-500/20 cursor-pointer"
              >
                {copiedRules ? <Check className="w-4 h-4 text-black" /> : <Copy className="w-4 h-4 text-black" />}
                <span>{copiedRules ? 'Tersalin!' : 'Salin firestore.rules'}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowRulesModal(!showRulesModal)}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#1d1238] border border-purple-500/30 text-purple-200 hover:bg-[#28194d] text-xs font-semibold transition-all cursor-pointer"
              >
                <Code className="w-4 h-4 text-purple-300" />
                <span>{showRulesModal ? 'Tutup Kode' : 'Lihat Kode'}</span>
              </button>
              <a
                href="https://console.firebase.google.com/project/ampremyanz-652ad/firestore/rules"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center p-2.5 rounded-xl bg-[#1d1238] border border-purple-500/30 text-purple-300 hover:text-white transition-all cursor-pointer"
                title="Buka Firebase Console Rules"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {showRulesModal && (
            <div className="mt-4 pt-4 border-t border-purple-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono text-purple-300">File: firestore.rules (Firebase Project: ampremyanz-652ad)</span>
                <button
                  type="button"
                  onClick={handleCopyRules}
                  className="text-xs text-amber-300 hover:text-amber-200 underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" /> Salin Seluruh Aturan
                </button>
              </div>
              <pre className="p-3 bg-[#0a0515] border border-purple-900/50 rounded-xl text-[11px] font-mono text-zinc-300 overflow-x-auto max-h-60 leading-relaxed select-all">
                {RECOMMENDED_FIRESTORE_RULES}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-purple-900/40 text-xs font-semibold">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
          { id: 'stock', label: `Kelola Stok (${availableStock})`, icon: Package },
          { id: 'deposits', label: `Deposit (${pendingDepositsCount})`, icon: ArrowDownCircle },
          { id: 'users', label: `Kelola User (${totalUsersCount})`, icon: Users },
          { id: 'orders', label: `Orders (${totalOrdersCount})`, icon: ShoppingBag },
          { id: 'settings', label: 'Pengaturan Toko', icon: Settings },
          { id: 'audit', label: 'Audit Log', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`admin-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-600/30'
                  : 'bg-[#120a24] text-zinc-300 hover:text-white hover:bg-[#1b0f34]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Stat Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-[#0e081e] border border-purple-500/20 rounded-2xl p-4 space-y-1">
              <div className="flex items-center justify-between text-purple-300">
                <span className="text-[11px] font-bold uppercase tracking-wider">Total User</span>
                <Users className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black text-white">{totalUsersCount}</p>
              <p className="text-[10px] text-zinc-400">Semua user terdaftar</p>
            </div>

            <div className="bg-[#0e081e] border border-purple-500/20 rounded-2xl p-4 space-y-1">
              <div className="flex items-center justify-between text-purple-300">
                <span className="text-[11px] font-bold uppercase tracking-wider">User Aktif</span>
                <Users className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-2xl font-black text-purple-300">{activeUsersCount}</p>
              <p className="text-[10px] text-zinc-400">Status active</p>
            </div>

            <div className="bg-[#0e081e] border border-purple-500/20 rounded-2xl p-4 space-y-1">
              <div className="flex items-center justify-between text-purple-300">
                <span className="text-[11px] font-bold uppercase tracking-wider">Total Deposit</span>
                <ArrowDownCircle className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-2xl font-black text-white">
                Rp{totalDepositAmount.toLocaleString('id-ID')}
              </p>
              <p className="text-[10px] text-zinc-400">Disetujui admin</p>
            </div>

            <div className="bg-[#0e081e] border border-purple-500/20 rounded-2xl p-4 space-y-1">
              <div className="flex items-center justify-between text-purple-300">
                <span className="text-[11px] font-bold uppercase tracking-wider">Deposit Pending</span>
                <ArrowDownCircle className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-black text-amber-300">{pendingDepositsCount}</p>
              <p className="text-[10px] text-zinc-400">Perlu persetujuan</p>
            </div>

            <div className="bg-[#0e081e] border border-purple-500/20 rounded-2xl p-4 space-y-1">
              <div className="flex items-center justify-between text-purple-300">
                <span className="text-[11px] font-bold uppercase tracking-wider">Total Order</span>
                <ShoppingBag className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black text-white">{totalOrdersCount}</p>
              <p className="text-[10px] text-zinc-400">Transaksi selesai</p>
            </div>

            <div className="bg-[#0e081e] border border-purple-500/20 rounded-2xl p-4 space-y-1">
              <div className="flex items-center justify-between text-purple-300">
                <span className="text-[11px] font-bold uppercase tracking-wider">Pendapatan Toko</span>
                <DollarSign className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-2xl font-black text-white">
                Rp{totalRevenue.toLocaleString('id-ID')}
              </p>
              <p className="text-[10px] text-zinc-400">Dari penjualan produk</p>
            </div>

            <div className="bg-[#0e081e] border border-purple-500/20 rounded-2xl p-4 space-y-1">
              <div className="flex items-center justify-between text-purple-300">
                <span className="text-[11px] font-bold uppercase tracking-wider">Total Stok</span>
                <Package className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black text-white">
                {availableStock} <span className="text-xs text-purple-300/60">/ {totalStockCount}</span>
              </p>
              <p className="text-[10px] text-zinc-400">{soldStock} akun telah terjual</p>
            </div>

            <div className="bg-[#0e081e] border border-purple-500/20 rounded-2xl p-4 space-y-1">
              <div className="flex items-center justify-between text-purple-300">
                <span className="text-[11px] font-bold uppercase tracking-wider">Order Hari Ini</span>
                <TrendingUp className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-2xl font-black text-white">{ordersToday}</p>
              <p className="text-[10px] text-zinc-400">24 jam terakhir</p>
            </div>
          </div>

          {/* Analytics Chart */}
          <div className="bg-[#0e081e] border border-purple-500/25 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-black text-white tracking-tight">Tren Penjualan & Pendapatan</h3>
                <p className="text-xs text-zinc-300">Aktivitas penjualan produk Alight Motion Premium</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-purple-950 border border-purple-500/30 text-[10px] font-bold text-purple-300">
                Grafik Mingguan
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorOmset" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9333ea" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#9333ea" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#a1a1aa" fontSize={11} />
                  <YAxis stroke="#a1a1aa" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0e081e',
                      border: '1px solid #7e22ce',
                      borderRadius: '12px',
                      fontSize: '11px',
                      color: '#fff'
                    }}
                  />
                  <Area type="monotone" dataKey="omset" stroke="#c084fc" strokeWidth={2} fillOpacity={1} fill="url(#colorOmset)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: KELOLA STOK (Requirement: "admin bisa hapus stok") */}
      {activeTab === 'stock' && (
        <div className="space-y-6">
          {/* Add Stock Card */}
          <div className="bg-[#0e081e] border border-purple-500/30 rounded-3xl p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-black text-white">Tambah Stok Akun Alight Motion</h3>
                <p className="text-xs text-zinc-300">Akun baru akan otomatis berstatus AVAILABLE dan siap dipesan pembeli</p>
              </div>
              <button
                id="toggle-bulk-stock-btn"
                onClick={() => setShowBulkStock(!showBulkStock)}
                className="text-xs font-semibold text-purple-300 hover:text-white underline self-start sm:self-auto"
              >
                {showBulkStock ? 'Gunakan Form Input Tunggal' : 'Input Banyak Sekaligus (Bulk)'}
              </button>
            </div>

            {showBulkStock ? (
              <form onSubmit={handleBulkAddStock} className="space-y-4">
                <p className="text-xs text-zinc-300">
                  Masukkan akun per baris dengan format: <code>email|password|catatan</code> (catatan opsional).
                </p>
                <textarea
                  id="bulk-stock-input"
                  rows={4}
                  value={bulkStockText}
                  onChange={(e) => setBulkStockText(e.target.value)}
                  placeholder="akun1@gmail.com|pass123&#10;akun2@gmail.com|pass456|Garansi full"
                  className="w-full p-3.5 bg-[#140b2a] border border-purple-500/30 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-purple-400"
                />
                <button
                  id="submit-bulk-stock-btn"
                  type="submit"
                  disabled={loadingAction}
                  className="py-2.5 px-5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors shadow-md disabled:opacity-50"
                >
                  Tambahkan Semua Akun Sekaligus
                </button>
              </form>
            ) : (
              <form onSubmit={handleAddSingleStock} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-purple-300 mb-1">
                    Email / Account
                  </label>
                  <input
                    id="single-stock-email-input"
                    type="text"
                    required
                    value={stockAccount}
                    onChange={(e) => setStockAccount(e.target.value)}
                    placeholder="contoh@gmail.com"
                    className="w-full px-3.5 py-2.5 bg-[#140b2a] border border-purple-500/30 rounded-xl text-xs text-white focus:outline-none focus:border-purple-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-purple-300 mb-1">
                    Password
                  </label>
                  <input
                    id="single-stock-pass-input"
                    type="text"
                    required
                    value={stockPassword}
                    onChange={(e) => setStockPassword(e.target.value)}
                    placeholder="PasswordAkun123"
                    className="w-full px-3.5 py-2.5 bg-[#140b2a] border border-purple-500/30 rounded-xl text-xs text-white focus:outline-none focus:border-purple-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-purple-300 mb-1">
                    Installation Note (Opsional)
                  </label>
                  <input
                    id="single-stock-note-input"
                    type="text"
                    value={stockNote}
                    onChange={(e) => setStockNote(e.target.value)}
                    placeholder="Login di aplikasi Alight Motion"
                    className="w-full px-3.5 py-2.5 bg-[#140b2a] border border-purple-500/30 rounded-xl text-xs text-white focus:outline-none focus:border-purple-400"
                  />
                </div>
                <div className="sm:col-span-3 pt-2">
                  <button
                    id="submit-single-stock-btn"
                    type="submit"
                    disabled={loadingAction}
                    className="py-2.5 px-6 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-md shadow-purple-600/30 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Simpan Stok Akun</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Stock Table & Deletion Controls */}
          <div className="bg-[#0e081e] border border-purple-500/30 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-white">Daftar Stok Akun ({allStock.length})</h3>
                <p className="text-xs text-zinc-300">
                  Tersedia: <strong className="text-purple-300">{availableStock}</strong> | Terjual: <strong className="text-zinc-400">{soldStock}</strong>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Batch Delete All Available Stock Button */}
                {availableStock > 0 && (
                  <button
                    id="admin-delete-all-stock-btn"
                    type="button"
                    onClick={() => setShowDeleteAllModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/80 border border-rose-600/50 hover:bg-rose-900 text-rose-200 text-xs font-bold transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Semua Stok Tersedia ({availableStock})</span>
                  </button>
                )}

                {/* Filter Pills */}
                <div className="flex items-center gap-1 bg-[#140b2a] p-1 rounded-xl border border-purple-500/30">
                  {(['ALL', 'AVAILABLE', 'SOLD'] as const).map((st) => (
                    <button
                      key={st}
                      id={`filter-stock-${st}`}
                      onClick={() => setStockFilter(st)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                        stockFilter === st
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-purple-900/40 text-purple-300 font-bold uppercase text-[10px]">
                    <th className="pb-3 px-2">Account / Email</th>
                    <th className="pb-3 px-2">Password</th>
                    <th className="pb-3 px-2">Status</th>
                    <th className="pb-3 px-2">Waktu Ditambahkan</th>
                    <th className="pb-3 px-2">Waktu Terjual</th>
                    <th className="pb-3 px-2 text-right">Aksi Admin (Hapus)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#170e30]">
                  {allStock
                    .filter((s) => stockFilter === 'ALL' || s.status === stockFilter)
                    .map((item) => (
                      <tr key={item.id} className="hover:bg-[#140b2a]/60 transition-colors">
                        <td className="py-3 px-2 font-mono text-white font-medium">{item.account}</td>
                        <td className="py-3 px-2 font-mono text-purple-200">{item.password}</td>
                        <td className="py-3 px-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              item.status === 'AVAILABLE'
                                ? 'bg-purple-950/80 text-purple-300 border-purple-500/40'
                                : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-zinc-400 text-[11px]">
                          {formatDate(item.createdAt)}
                        </td>
                        <td className="py-3 px-2 text-zinc-500 text-[11px]">
                          {item.soldAt ? formatDate(item.soldAt) : '-'}
                        </td>
                        <td className="py-3 px-2 text-right">
                          {/* Admin can delete stock */}
                          <button
                            id={`delete-stock-${item.id}`}
                            onClick={() => setStockToDelete(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-600/40 text-rose-300 text-xs font-bold transition-colors"
                            title="Hapus Stok Akun Ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  {allStock.filter((s) => stockFilter === 'ALL' || s.status === stockFilter).length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-zinc-400 text-xs">
                        Tidak ada stok akun dengan status {stockFilter}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: KELOLA DEPOSIT */}
      {activeTab === 'deposits' && (
        <div className="bg-[#0e081e] border border-purple-500/30 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-white">Kelola Verifikasi Deposit</h3>
              <p className="text-xs text-zinc-300">
                Persetujuan deposit menambah saldo user secara atomic dan mencatat audit log
              </p>
            </div>
            <div className="flex items-center gap-1 bg-[#140b2a] p-1 rounded-xl border border-purple-500/30">
              {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((df) => (
                <button
                  key={df}
                  id={`filter-dep-${df}`}
                  onClick={() => setDepositFilter(df)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    depositFilter === df
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {df}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-purple-900/40 text-purple-300 font-bold uppercase text-[10px]">
                  <th className="pb-3 px-2">User / Email</th>
                  <th className="pb-3 px-2">Nominal</th>
                  <th className="pb-3 px-2">Nama Pengirim</th>
                  <th className="pb-3 px-2">Metode</th>
                  <th className="pb-3 px-2">Waktu</th>
                  <th className="pb-3 px-2">Status</th>
                  <th className="pb-3 px-2 text-right">Tindakan Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#170e30]">
                {allDeposits
                  .filter((d) => depositFilter === 'ALL' || d.status === depositFilter)
                  .map((dep) => (
                    <tr key={dep.id} className="hover:bg-[#140b2a]/60 transition-colors">
                      <td className="py-3 px-2">
                        <span className="font-bold text-white block">{dep.userEmail || 'User'}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">UID: {dep.userId.substring(0, 8)}...</span>
                      </td>
                      <td className="py-3 px-2 font-black text-white text-sm">
                        Rp{dep.amount.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-2 text-zinc-300">{dep.senderName}</td>
                      <td className="py-3 px-2">
                        <span className="px-2 py-0.5 rounded bg-[#160c2e] border border-purple-500/30 text-[10px] font-bold text-purple-300">
                          {dep.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-zinc-400 text-[11px]">{formatDate(dep.createdAt)}</td>
                      <td className="py-3 px-2">
                        {dep.status === 'PENDING' && (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-950/60 border border-amber-500/40 text-[10px] font-bold text-amber-300">
                            PENDING
                          </span>
                        )}
                        {dep.status === 'APPROVED' && (
                          <span className="px-2.5 py-0.5 rounded-full bg-purple-950/60 border border-purple-500/40 text-[10px] font-bold text-purple-300">
                            APPROVED
                          </span>
                        )}
                        {dep.status === 'REJECTED' && (
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-950/60 border border-rose-500/40 text-[10px] font-bold text-rose-300">
                            REJECTED
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-right">
                        {dep.status === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              id={`approve-dep-${dep.id}`}
                              disabled={loadingAction}
                              onClick={() => handleApproveDeposit(dep.id)}
                              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors flex items-center gap-1 shadow-sm"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>APPROVE</span>
                            </button>
                            <button
                              id={`reject-dep-${dep.id}`}
                              disabled={loadingAction}
                              onClick={() => handleRejectDeposit(dep.id)}
                              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-rose-950 hover:text-rose-300 text-zinc-300 font-semibold text-xs transition-colors"
                            >
                              REJECT
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-zinc-500 font-mono">SELESAI</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: KELOLA USER */}
      {activeTab === 'users' && (
        <div className="bg-[#0e081e] border border-purple-500/30 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-white">Kelola Pengguna ({allUsers.length})</h3>
              <p className="text-xs text-zinc-300">
                Pencarian user, penyesuaian saldo manual, dan aktivasi/suspend akun
              </p>
            </div>
            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="search-user-input"
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Cari nama atau email..."
                className="w-full pl-10 pr-3.5 py-2 bg-[#140b2a] border border-purple-500/30 rounded-xl text-xs text-white focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-purple-900/40 text-purple-300 font-bold uppercase text-[10px]">
                  <th className="pb-3 px-2">Nama & Email</th>
                  <th className="pb-3 px-2">Role</th>
                  <th className="pb-3 px-2">Saldo</th>
                  <th className="pb-3 px-2">Status</th>
                  <th className="pb-3 px-2">Terdaftar</th>
                  <th className="pb-3 px-2 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#170e30]">
                {allUsers
                  .filter((u) => {
                    const q = userSearch.toLowerCase();
                    return u.email.toLowerCase().includes(q) || u.name.toLowerCase().includes(q);
                  })
                  .map((u) => (
                    <tr key={u.uid} className="hover:bg-[#140b2a]/60 transition-colors">
                      <td className="py-3 px-2">
                        <span className="font-bold text-white block">{u.name}</span>
                        <span className="text-[11px] text-zinc-400">{u.email}</span>
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            u.role === 'admin'
                              ? 'bg-purple-950 text-purple-300 border-purple-500/50'
                              : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                          }`}
                        >
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-2 font-black text-white">
                        Rp{(u.balance || 0).toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.status === 'active'
                              ? 'bg-purple-950/60 text-purple-300 border border-purple-500/40'
                              : 'bg-rose-950/60 text-rose-400 border border-rose-500/40'
                          }`}
                        >
                          {u.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-zinc-400 text-[11px]">{formatDate(u.createdAt)}</td>
                      <td className="py-3 px-2 text-right space-x-2">
                        <button
                          id={`adjust-balance-${u.uid}`}
                          onClick={() => handleOpenAdjust(u)}
                          className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold transition-colors"
                        >
                          Atur Saldo
                        </button>
                        <button
                          id={`toggle-suspend-${u.uid}`}
                          onClick={() => handleToggleSuspend(u)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                            u.status === 'active'
                              ? 'bg-rose-950/60 text-rose-300 hover:bg-rose-900/60'
                              : 'bg-purple-950/60 text-purple-300 hover:bg-purple-900/60'
                          }`}
                        >
                          {u.status === 'active' ? 'Suspend' : 'Aktifkan'}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: ORDERS LIST */}
      {activeTab === 'orders' && (
        <div className="bg-[#0e081e] border border-purple-500/30 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-white">Semua Pesanan Masuk ({allOrders.length})</h3>
            <span className="text-xs text-purple-300">Total Pendapatan: Rp{totalRevenue.toLocaleString('id-ID')}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-purple-900/40 text-purple-300 font-bold uppercase text-[10px]">
                  <th className="pb-3 px-2">Order ID</th>
                  <th className="pb-3 px-2">Pembeli</th>
                  <th className="pb-3 px-2">Produk</th>
                  <th className="pb-3 px-2">Qty</th>
                  <th className="pb-3 px-2">Total</th>
                  <th className="pb-3 px-2">Waktu</th>
                  <th className="pb-3 px-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#170e30]">
                {allOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#140b2a]/60 transition-colors">
                    <td className="py-3 px-2 font-mono text-purple-300 font-bold">
                      #YZ{ord.id.substring(0, 6).toUpperCase()}
                    </td>
                    <td className="py-3 px-2 text-white">{ord.userEmail || ord.userId}</td>
                    <td className="py-3 px-2 text-zinc-300">{ord.productName}</td>
                    <td className="py-3 px-2 font-bold text-white">{ord.quantity}</td>
                    <td className="py-3 px-2 font-black text-white">
                      Rp{ord.totalPrice.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-2 text-zinc-400 text-[11px]">{formatDate(ord.createdAt)}</td>
                    <td className="py-3 px-2 text-right">
                      <span className="px-2 py-0.5 rounded-full bg-purple-950/60 border border-purple-500/40 text-purple-300 text-[10px] font-bold">
                        {ord.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: PENGATURAN TOKO */}
      {activeTab === 'settings' && (
        <div className="max-w-xl bg-[#0e081e] border border-purple-500/30 rounded-3xl p-6 shadow-xl space-y-6">
          <div>
            <h3 className="text-base font-black text-white">Pengaturan Toko Digital YANZSTR</h3>
            <p className="text-xs text-zinc-300">
              Ubah harga produk dan tautan saluran WhatsApp. Pengaturan langsung tersimpan di database.
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-purple-300 mb-1.5">
                Nama Toko:
              </label>
              <input
                id="settings-store-name-input"
                type="text"
                required
                value={editStoreName}
                onChange={(e) => setEditStoreName(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#140b2a] border border-purple-500/30 rounded-xl text-xs text-white focus:outline-none focus:border-purple-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-purple-300 mb-1.5">
                Harga Produk Alight Motion Premium (IDR):
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-purple-400 text-xs font-bold">
                  Rp
                </span>
                <input
                  id="settings-product-price-input"
                  type="text"
                  required
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#140b2a] border border-purple-500/30 rounded-xl text-xs text-white font-black focus:outline-none focus:border-purple-400"
                />
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">Default harga toko: Rp500</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-purple-300 mb-1.5">
                Link Saluran WhatsApp:
              </label>
              <input
                id="settings-wa-channel-input"
                type="url"
                required
                value={editWaChannel}
                onChange={(e) => setEditWaChannel(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#140b2a] border border-purple-500/30 rounded-xl text-xs text-white focus:outline-none focus:border-purple-400"
              />
            </div>

            <div className="pt-2">
              <button
                id="save-settings-btn"
                type="submit"
                disabled={loadingAction}
                className="py-2.5 px-6 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors shadow-md shadow-purple-600/30 disabled:opacity-50"
              >
                Simpan Perubahan Pengaturan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 7: AUDIT LOG */}
      {activeTab === 'audit' && (
        <div className="bg-[#0e081e] border border-purple-500/30 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-white">Catatan Aktivitas Admin (Audit Logs)</h3>
              <p className="text-xs text-zinc-300">Riwayat aksi sensitif administrator untuk transparansi & audit</p>
            </div>
            <span className="text-xs font-mono text-purple-400">{auditLogs.length} Total Logs</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-purple-900/40 text-purple-300 font-bold uppercase text-[10px]">
                  <th className="pb-3 px-2">Waktu</th>
                  <th className="pb-3 px-2">Admin</th>
                  <th className="pb-3 px-2">Aksi</th>
                  <th className="pb-3 px-2">Target</th>
                  <th className="pb-3 px-2">Detail Deskripsi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#170e30]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#140b2a]/60 transition-colors">
                    <td className="py-3 px-2 text-zinc-400 text-[11px] whitespace-nowrap">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="py-3 px-2 text-zinc-300 font-medium whitespace-nowrap">
                      {log.adminEmail || log.adminId}
                    </td>
                    <td className="py-3 px-2">
                      <span className="px-2 py-0.5 rounded bg-[#180e32] border border-purple-500/30 font-mono text-[10px] font-bold text-purple-300">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-zinc-400 font-mono text-[11px] truncate max-w-[120px]">
                      {log.target || '-'}
                    </td>
                    <td className="py-3 px-2 text-zinc-200">{log.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: SINGLE STOCK DELETE CONFIRMATION (Requirement: "admin bisa hapus stok") */}
      {stockToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#0e081e] border border-rose-500/50 rounded-3xl p-6 shadow-2xl text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-950 border border-rose-600/50 flex items-center justify-center text-rose-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Hapus Stok Akun?</h3>
                <p className="text-xs text-zinc-300">Aksi ini akan menghapus stok dari database secara permanen.</p>
              </div>
            </div>

            <div className="bg-[#140b2a] p-4 rounded-2xl border border-purple-500/20 text-xs space-y-2 mb-5">
              <div>
                <span className="text-zinc-400">Akun / Email: </span>
                <span className="font-mono font-bold text-white">{stockToDelete.account}</span>
              </div>
              <div>
                <span className="text-zinc-400">Status Stok: </span>
                <span className="font-bold text-purple-300">{stockToDelete.status}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStockToDelete(null)}
                disabled={loadingAction}
                className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold"
              >
                Batal
              </button>
              <button
                id="confirm-delete-stock-btn"
                type="button"
                onClick={handleConfirmDeleteSingleStock}
                disabled={loadingAction}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors shadow-lg shadow-rose-600/30"
              >
                {loadingAction ? 'Menghapus...' : 'Ya, Hapus Stok'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: BATCH DELETE ALL AVAILABLE STOCKS (Requirement: "admin bisa hapus stok") */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#0e081e] border border-rose-500/50 rounded-3xl p-6 shadow-2xl text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-950 border border-rose-600/50 flex items-center justify-center text-rose-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Hapus Semua Stok Tersedia?</h3>
                <p className="text-xs text-zinc-300">
                  Seluruh {availableStock} akun berstatus AVAILABLE akan dihapus permanen.
                </p>
              </div>
            </div>

            <p className="text-xs text-rose-300/90 mb-5 bg-rose-950/40 p-3 rounded-xl border border-rose-900/50">
              Peringatan: Tindakan ini tidak dapat dibatalkan. Stok yang telah terjual (SOLD) tetap aman untuk riwayat pembelian user.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteAllModal(false)}
                disabled={loadingAction}
                className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold"
              >
                Batal
              </button>
              <button
                id="confirm-delete-all-stock-btn"
                type="button"
                onClick={handleConfirmDeleteAllAvailable}
                disabled={loadingAction}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors shadow-lg shadow-rose-600/30"
              >
                {loadingAction ? 'Menghapus Semua...' : `Hapus ${availableStock} Stok`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: BALANCE ADJUSTMENT */}
      {adjustModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#0e081e] border border-purple-500/40 rounded-3xl p-6 shadow-2xl text-white">
            <h3 className="text-base font-black mb-1">Penyesuaian Saldo Pengguna</h3>
            <p className="text-xs text-zinc-300 mb-4">
              User: <strong className="text-white">{adjustModalUser.email}</strong> (Saldo: Rp
              {(adjustModalUser.balance || 0).toLocaleString('id-ID')})
            </p>

            <form onSubmit={handleExecuteAdjust} className="space-y-4 text-xs">
              <div>
                <label className="block text-purple-300 mb-1 font-bold">Tipe Penyesuaian:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustDirection('ADD')}
                    className={`py-2 rounded-xl font-bold border transition-colors ${
                      adjustDirection === 'ADD'
                        ? 'bg-purple-950 border-purple-500 text-purple-300'
                        : 'bg-[#140b2a] border-purple-900/40 text-zinc-400'
                    }`}
                  >
                    + Tambah Saldo
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustDirection('SUBTRACT')}
                    className={`py-2 rounded-xl font-bold border transition-colors ${
                      adjustDirection === 'SUBTRACT'
                        ? 'bg-rose-950 border-rose-500 text-rose-300'
                        : 'bg-[#140b2a] border-purple-900/40 text-zinc-400'
                    }`}
                  >
                    - Kurangi Saldo
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-purple-300 mb-1 font-bold">Nominal (IDR):</label>
                <input
                  id="adjust-amount-input"
                  type="text"
                  required
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#140b2a] border border-purple-500/30 rounded-xl text-white font-black text-sm focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-purple-300 mb-1 font-bold">Alasan Penyesuaian (Audit):</label>
                <input
                  id="adjust-reason-input"
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="Misal: Bonus loyalitas / Koreksi deposit"
                  className="w-full px-3.5 py-2.5 bg-[#140b2a] border border-purple-500/30 rounded-xl text-white focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustModalUser(null)}
                  className="py-2.5 px-4 rounded-xl border border-zinc-700 text-zinc-300 hover:text-white"
                >
                  Batal
                </button>
                <button
                  id="submit-adjust-btn"
                  type="submit"
                  disabled={loadingAction}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-colors shadow-md shadow-purple-600/30"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
