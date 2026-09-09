import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import {
  collection,
  query,
  getDocs,
  onSnapshot,
  orderBy,
  limit,
  doc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  UserProfile,
  StockItem,
  Deposit,
  Order,
  AuditLog,
  StoreSettings
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
  XCircle,
  AlertTriangle,
  RefreshCw,
  Edit,
  Power,
  DollarSign,
  Lock,
  Mail,
  Copy,
  Check,
  ChevronRight,
  Database
} from 'lucide-react';
import {
  BarChart,
  Bar,
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
    adjustBalance,
    toggleUserStatus,
    initializeSampleData,
    addToast
  } = useStore();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'stock' | 'deposits' | 'orders' | 'settings' | 'audit'>('dashboard');

  // Admin realtime states
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [allStock, setAllStock] = useState<StockItem[]>([]);
  const [allDeposits, setAllDeposits] = useState<Deposit[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Filtering / Search
  const [userSearch, setUserSearch] = useState('');
  const [depositFilter, setDepositFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'AVAILABLE' | 'SOLD'>('ALL');

  // Modal / Inputs
  const [stockAccount, setStockAccount] = useState('');
  const [stockPassword, setStockPassword] = useState('');
  const [stockNote, setStockNote] = useState('');

  // Bulk stock input
  const [bulkStockText, setBulkStockText] = useState('');
  const [showBulkStock, setShowBulkStock] = useState(false);

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

  // Sync settings inputs when loaded
  useEffect(() => {
    setEditPrice((settings.productPrice || 500).toString());
    setEditStoreName(settings.storeName || 'YANZSTR');
    setEditWaChannel(settings.whatsappChannel || '');
  }, [settings]);

  // Listen to admin collections when admin is authenticated
  useEffect(() => {
    if (!currentUser || !isAdmin) return;

    // 1. Users
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
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
    });

    // 2. Stock
    const unsubStock = onSnapshot(collection(db, 'stock'), (snap) => {
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
    });

    // 3. Deposits
    const unsubDeposits = onSnapshot(collection(db, 'deposits'), (snap) => {
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
    });

    // 4. Orders
    const unsubOrders = onSnapshot(collection(db, 'orders'), (snap) => {
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
    });

    // 5. Audit Logs
    const unsubLogs = onSnapshot(collection(db, 'auditLogs'), (snap) => {
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
    });

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
        <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 mx-auto flex items-center justify-center text-rose-400 mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Akses Terbatas: Administrator Only</h2>
        <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
          Halaman ini khusus untuk manajemen toko digital YANZSTR. Akun Anda tidak memiliki role administrator.
        </p>
        <button
          id="admin-login-prompt-btn"
          onClick={onOpenAuth}
          className="py-2.5 px-6 rounded-xl bg-white text-black font-bold text-xs hover:bg-zinc-200 transition-all shadow-lg"
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

  // Orders today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const ordersToday = allOrders.filter((o) => {
    if (!o.createdAt) return false;
    const d = o.createdAt.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
    return d >= today;
  }).length;

  // Chart data: 7 days mockup/aggregated
  const chartData = [
    { day: 'Sen', order: 12, omset: 6000 },
    { day: 'Sel', order: 18, omset: 9000 },
    { day: 'Rab', order: 25, omset: 12500 },
    { day: 'Kam', order: 20, omset: 10000 },
    { day: 'Jum', order: 32, omset: 16000 },
    { day: 'Sab', order: 45, omset: 22500 },
    { day: 'Min', order: 54, omset: 27000 },
  ];

  // User management handlers
  const handleOpenAdjust = (user: UserProfile) => {
    setAdjustModalUser(user);
    setAdjustAmount('5000');
    setAdjustDirection('ADD');
    setAdjustReason('Bonus top up promo YANZSTR');
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
    const confirmMsg = `Ubah status user ${user.email} menjadi ${nextStatus.toUpperCase()}?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await toggleUserStatus(user.uid, nextStatus);
    } catch (err: any) {
      addToast(err.message || 'Gagal mengubah status', 'error');
    }
  };

  // Stock management handlers
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

  const handleBulkAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    // format expected: email|password or email,password per line
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

  const handleDeleteStock = async (stockId: string) => {
    if (!window.confirm('Hapus stok akun ini?')) return;
    try {
      await deleteStockItem(stockId);
    } catch (err: any) {
      addToast(err.message || 'Gagal menghapus stok', 'error');
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

  // Settings handlers
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0d0d12] border border-zinc-800 rounded-3xl p-6 shadow-2xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-black font-extrabold flex items-center justify-center shadow-lg shadow-amber-400/10">
            <Shield className="w-6 h-6 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white tracking-tight">YANZSTR Admin Panel</h2>
              <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-[10px] font-mono text-zinc-300">
                v1.0.0
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Pengelolaan database realtime, stok akun, deposit, dan otoritas toko
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
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/60'
                : 'bg-rose-950/80 border-rose-500/50 text-rose-300 hover:bg-rose-900/60'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{settings.storeStatus === 'OPEN' ? '🟢 STORE OPEN' : '🔴 STORE CLOSED'}</span>
          </button>

          {allStock.length === 0 && (
            <button
              id="admin-seed-database-btn"
              type="button"
              onClick={initializeSampleData}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs transition-colors border border-zinc-700"
              title="Isi database dengan pengaturan awal dan 5 stok siap jual"
            >
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Inisialisasi Stok Awal</span>
            </button>
          )}
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-zinc-800/80 scrollbar-none text-xs font-semibold">
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
                  ? 'bg-white text-black font-bold shadow-lg'
                  : 'bg-zinc-900/70 text-zinc-400 hover:text-white hover:bg-zinc-850'
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
          {/* Stat Cards Grid (Requirement #16) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* 1. Total User */}
            <div className="bg-[#0d0d12] border border-zinc-800 rounded-2xl p-4 space-y-1">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[11px] font-medium uppercase tracking-wider">Total User</span>
                <Users className="w-4 h-4 text-zinc-500" />
              </div>
              <p className="text-2xl font-black text-white">{totalUsersCount}</p>
              <p className="text-[10px] text-zinc-500">Semua user terdaftar</p>
            </div>

            {/* 2. User Aktif */}
            <div className="bg-[#0d0d12] border border-zinc-800 rounded-2xl p-4 space-y-1">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[11px] font-medium uppercase tracking-wider">User Aktif</span>
                <Users className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-black text-emerald-400">{activeUsersCount}</p>
              <p className="text-[10px] text-zinc-500">Status active</p>
            </div>

            {/* 3. Total Deposit */}
            <div className="bg-[#0d0d12] border border-zinc-800 rounded-2xl p-4 space-y-1">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Deposit</span>
                <ArrowDownCircle className="w-4 h-4 text-zinc-500" />
              </div>
              <p className="text-2xl font-black text-white">
                Rp{totalDepositAmount.toLocaleString('id-ID')}
              </p>
              <p className="text-[10px] text-zinc-500">Disetujui admin</p>
            </div>

            {/* 4. Deposit Pending */}
            <div className="bg-[#0d0d12] border border-zinc-800 rounded-2xl p-4 space-y-1">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[11px] font-medium uppercase tracking-wider">Deposit Pending</span>
                <ArrowDownCircle className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-black text-amber-300">{pendingDepositsCount}</p>
              <p className="text-[10px] text-zinc-500">Perlu persetujuan</p>
            </div>

            {/* 5. Total Order */}
            <div className="bg-[#0d0d12] border border-zinc-800 rounded-2xl p-4 space-y-1">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Order</span>
                <ShoppingBag className="w-4 h-4 text-zinc-500" />
              </div>
              <p className="text-2xl font-black text-white">{totalOrdersCount}</p>
              <p className="text-[10px] text-zinc-500">Transaksi selesai</p>
            </div>

            {/* 6. Pendapatan */}
            <div className="bg-[#0d0d12] border border-zinc-800 rounded-2xl p-4 space-y-1">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[11px] font-medium uppercase tracking-wider">Pendapatan Toko</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-black text-white">
                Rp{totalRevenue.toLocaleString('id-ID')}
              </p>
              <p className="text-[10px] text-zinc-500">Dari penjualan produk</p>
            </div>

            {/* 7. Total Stok */}
            <div className="bg-[#0d0d12] border border-zinc-800 rounded-2xl p-4 space-y-1">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Stok</span>
                <Package className="w-4 h-4 text-zinc-500" />
              </div>
              <p className="text-2xl font-black text-white">
                {availableStock} <span className="text-xs text-zinc-500">/ {totalStockCount}</span>
              </p>
              <p className="text-[10px] text-zinc-500">{soldStock} terjual</p>
            </div>

            {/* 8. Order Hari Ini */}
            <div className="bg-[#0d0d12] border border-zinc-800 rounded-2xl p-4 space-y-1">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[11px] font-medium uppercase tracking-wider">Order Hari Ini</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-black text-white">{ordersToday}</p>
              <p className="text-[10px] text-zinc-500">24 jam terakhir</p>
            </div>
          </div>

          {/* Analytics Chart */}
          <div className="bg-[#0d0d12] border border-zinc-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Tren Penjualan & Pendapatan</h3>
                <p className="text-xs text-zinc-400">Statistik aktivitas pesanan produk Alight Motion Premium</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-semibold text-zinc-300">
                Minggu Ini
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorOmset" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ffffff" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#52525b" fontSize={11} />
                  <YAxis stroke="#52525b" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      border: '1px solid #27272a',
                      borderRadius: '12px',
                      fontSize: '11px',
                      color: '#fff'
                    }}
                  />
                  <Area type="monotone" dataKey="omset" stroke="#ffffff" fillOpacity={1} fill="url(#colorOmset)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: KELOLA STOK */}
      {activeTab === 'stock' && (
        <div className="space-y-6">
          {/* Add Stock Card */}
          <div className="bg-[#0d0d12] border border-zinc-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Tambah Stok Akun Alight Motion Premium</h3>
              <button
                id="toggle-bulk-stock-btn"
                onClick={() => setShowBulkStock(!showBulkStock)}
                className="text-xs text-zinc-400 hover:text-white underline"
              >
                {showBulkStock ? 'Gunakan Form Tunggal' : 'Tambah Banyak Sekaligus (Bulk)'}
              </button>
            </div>

            {showBulkStock ? (
              <form onSubmit={handleBulkAddStock} className="space-y-4">
                <p className="text-xs text-zinc-400">
                  Masukkan akun per baris dengan format: <code>email|password|catatan</code> (catatan opsional).
                </p>
                <textarea
                  id="bulk-stock-input"
                  rows={4}
                  value={bulkStockText}
                  onChange={(e) => setBulkStockText(e.target.value)}
                  placeholder="akun1@gmail.com|pass123&#10;akun2@gmail.com|pass456|Garansi full"
                  className="w-full p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-white"
                />
                <button
                  id="submit-bulk-stock-btn"
                  type="submit"
                  disabled={loadingAction}
                  className="py-2.5 px-5 rounded-xl bg-white text-black font-bold text-xs hover:bg-zinc-200 transition-colors disabled:opacity-50"
                >
                  Tambahkan Semua Akun
                </button>
              </form>
            ) : (
              <form onSubmit={handleAddSingleStock} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold uppercase text-zinc-400 mb-1">
                    Email / Account
                  </label>
                  <input
                    id="single-stock-email-input"
                    type="text"
                    required
                    value={stockAccount}
                    onChange={(e) => setStockAccount(e.target.value)}
                    placeholder="contoh@gmail.com"
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase text-zinc-400 mb-1">
                    Password
                  </label>
                  <input
                    id="single-stock-pass-input"
                    type="text"
                    required
                    value={stockPassword}
                    onChange={(e) => setStockPassword(e.target.value)}
                    placeholder="PasswordAkun123"
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase text-zinc-400 mb-1">
                    Installation Note (Opsional)
                  </label>
                  <input
                    id="single-stock-note-input"
                    type="text"
                    value={stockNote}
                    onChange={(e) => setStockNote(e.target.value)}
                    placeholder="Login di app Alight Motion"
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div className="sm:col-span-3 pt-2">
                  <button
                    id="submit-single-stock-btn"
                    type="submit"
                    disabled={loadingAction}
                    className="py-2.5 px-6 rounded-xl bg-white text-black font-bold text-xs hover:bg-zinc-200 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Stok</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Stock Table */}
          <div className="bg-[#0d0d12] border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white">Daftar Stok Akun ({allStock.length})</h3>
                <p className="text-xs text-zinc-400">Available: {availableStock} • Sold: {soldStock}</p>
              </div>

              <div className="flex items-center gap-2">
                {(['ALL', 'AVAILABLE', 'SOLD'] as const).map((st) => (
                  <button
                    key={st}
                    id={`filter-stock-${st}`}
                    onClick={() => setStockFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      stockFilter === st
                        ? 'bg-white text-black'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 font-semibold uppercase text-[10px]">
                    <th className="pb-3 px-2">Account / Email</th>
                    <th className="pb-3 px-2">Password</th>
                    <th className="pb-3 px-2">Status</th>
                    <th className="pb-3 px-2">Created</th>
                    <th className="pb-3 px-2">Sold At</th>
                    <th className="pb-3 px-2 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {allStock
                    .filter((s) => stockFilter === 'ALL' || s.status === stockFilter)
                    .map((item) => (
                      <tr key={item.id} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="py-3 px-2 font-mono text-white font-medium">{item.account}</td>
                        <td className="py-3 px-2 font-mono text-zinc-300">{item.password}</td>
                        <td className="py-3 px-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.status === 'AVAILABLE'
                                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                                : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
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
                          {item.status === 'AVAILABLE' && (
                            <button
                              id={`delete-stock-${item.id}`}
                              onClick={() => handleDeleteStock(item.id)}
                              className="text-zinc-500 hover:text-rose-400 p-1 transition-colors"
                              title="Hapus Stok Alight Motion"
                            aria-label="Hapus stok Alight Motion"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: KELOLA DEPOSIT */}
      {activeTab === 'deposits' && (
        <div className="bg-[#0d0d12] border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white">Kelola Verifikasi Deposit</h3>
              <p className="text-xs text-zinc-400">
                Persetujuan deposit menambah saldo user secara atomic dan mencatat audit log
              </p>
            </div>

            <div className="flex items-center gap-2">
              {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((df) => (
                <button
                  key={df}
                  id={`filter-dep-${df}`}
                  onClick={() => setDepositFilter(df)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    depositFilter === df
                      ? 'bg-white text-black'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white'
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
                <tr className="border-b border-zinc-800 text-zinc-400 font-semibold uppercase text-[10px]">
                  <th className="pb-3 px-2">User / Email</th>
                  <th className="pb-3 px-2">Nominal</th>
                  <th className="pb-3 px-2">Nama Pengirim</th>
                  <th className="pb-3 px-2">Metode</th>
                  <th className="pb-3 px-2">Waktu</th>
                  <th className="pb-3 px-2">Status</th>
                  <th className="pb-3 px-2 text-right">Tindakan Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {allDeposits
                  .filter((d) => depositFilter === 'ALL' || d.status === depositFilter)
                  .map((dep) => (
                    <tr key={dep.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="py-3 px-2">
                        <span className="font-semibold text-white block">{dep.userEmail || 'User'}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">UID: {dep.userId.substring(0, 8)}...</span>
                      </td>
                      <td className="py-3 px-2 font-bold text-white text-sm">
                        Rp{dep.amount.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-2 text-zinc-300">{dep.senderName}</td>
                      <td className="py-3 px-2">
                        <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-semibold text-zinc-300">
                          {dep.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-zinc-400 text-[11px]">{formatDate(dep.createdAt)}</td>
                      <td className="py-3 px-2">
                        {dep.status === 'PENDING' && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-500/40 text-[10px] font-bold text-amber-300">
                            PENDING
                          </span>
                        )}
                        {dep.status === 'APPROVED' && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-[10px] font-bold text-emerald-300">
                            APPROVED
                          </span>
                        )}
                        {dep.status === 'REJECTED' && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-950/60 border border-rose-500/40 text-[10px] font-bold text-rose-300">
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
                              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-colors flex items-center gap-1 shadow-sm"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>APPROVE</span>
                            </button>
                            <button
                              id={`reject-dep-${dep.id}`}
                              disabled={loadingAction}
                              onClick={() => handleRejectDeposit(dep.id)}
                              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-rose-950/80 hover:text-rose-300 text-zinc-300 font-semibold text-xs transition-colors"
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
        <div className="bg-[#0d0d12] border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white">Kelola Pengguna ({allUsers.length})</h3>
              <p className="text-xs text-zinc-400">
                Pencarian user, penyesuaian saldo manual, dan aktivasi/suspend akun
              </p>
            </div>

            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="search-user-input"
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Cari nama atau email..."
                className="w-full pl-10 pr-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 font-semibold uppercase text-[10px]">
                  <th className="pb-3 px-2">Nama & Email</th>
                  <th className="pb-3 px-2">Role</th>
                  <th className="pb-3 px-2">Saldo</th>
                  <th className="pb-3 px-2">Status</th>
                  <th className="pb-3 px-2">Terdaftar</th>
                  <th className="pb-3 px-2 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {allUsers
                  .filter((u) => {
                    const q = userSearch.toLowerCase();
                    return u.email.toLowerCase().includes(q) || u.name.toLowerCase().includes(q);
                  })
                  .map((u) => (
                    <tr key={u.uid} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="py-3 px-2">
                        <span className="font-semibold text-white block">{u.name}</span>
                        <span className="text-[11px] text-zinc-400">{u.email}</span>
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.role === 'admin'
                              ? 'bg-amber-950/80 text-amber-300 border border-amber-500/30'
                              : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                          }`}
                        >
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-2 font-bold text-white">
                        Rp{(u.balance || 0).toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.status === 'active'
                              ? 'bg-emerald-950/60 text-emerald-400'
                              : 'bg-rose-950/60 text-rose-400'
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
                          className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] font-semibold transition-colors"
                        >
                          Atur Saldo
                        </button>
                        <button
                          id={`toggle-suspend-${u.uid}`}
                          onClick={() => handleToggleSuspend(u)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                            u.status === 'active'
                              ? 'bg-rose-950/60 text-rose-300 hover:bg-rose-900/60'
                              : 'bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/60'
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
        <div className="bg-[#0d0d12] border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Semua Pesanan Masuk ({allOrders.length})</h3>
            <span className="text-xs text-zinc-400">Total Pendapatan: Rp{totalRevenue.toLocaleString('id-ID')}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 font-semibold uppercase text-[10px]">
                  <th className="pb-3 px-2">Order ID</th>
                  <th className="pb-3 px-2">Pembeli</th>
                  <th className="pb-3 px-2">Produk</th>
                  <th className="pb-3 px-2">Qty</th>
                  <th className="pb-3 px-2">Total</th>
                  <th className="pb-3 px-2">Waktu</th>
                  <th className="pb-3 px-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {allOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-3 px-2 font-mono text-zinc-300 font-bold">
                      #YZ{ord.id.substring(0, 6).toUpperCase()}
                    </td>
                    <td className="py-3 px-2 text-white">{ord.userEmail || ord.userId}</td>
                    <td className="py-3 px-2 text-zinc-300">{ord.productName}</td>
                    <td className="py-3 px-2 font-bold text-white">{ord.quantity}</td>
                    <td className="py-3 px-2 font-bold text-emerald-400">
                      Rp{ord.totalPrice.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-2 text-zinc-400 text-[11px]">{formatDate(ord.createdAt)}</td>
                    <td className="py-3 px-2 text-right">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
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

      {/* TAB 6: PENGATURAN TOKO (Requirement #20) */}
      {activeTab === 'settings' && (
        <div className="max-w-xl bg-[#0d0d12] border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div>
            <h3 className="text-base font-bold text-white">Pengaturan Toko (Firestore: settings/store)</h3>
            <p className="text-xs text-zinc-400">
              Ubah harga produk dan tautan saluran WhatsApp. Frontend akan membaca secara realtime.
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Nama Toko:
              </label>
              <input
                id="settings-store-name-input"
                type="text"
                required
                value={editStoreName}
                onChange={(e) => setEditStoreName(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Harga Produk Alight Motion Premium (IDR):
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500 text-xs font-bold">
                  Rp
                </span>
                <input
                  id="settings-product-price-input"
                  type="text"
                  required
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white font-bold focus:outline-none focus:border-white"
                />
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">Default harga: Rp500</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Link Saluran WhatsApp:
              </label>
              <input
                id="settings-wa-channel-input"
                type="url"
                required
                value={editWaChannel}
                onChange={(e) => setEditWaChannel(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-white"
              />
            </div>

            <div className="pt-2">
              <button
                id="save-settings-btn"
                type="submit"
                disabled={loadingAction}
                className="py-2.5 px-6 rounded-xl bg-white text-black font-bold text-xs hover:bg-zinc-200 transition-colors disabled:opacity-50"
              >
                Simpan Perubahan Pengaturan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 7: AUDIT LOG (Requirement #23) */}
      {activeTab === 'audit' && (
        <div className="bg-[#0d0d12] border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Catatan Aktivitas Admin (Audit Logs)</h3>
              <p className="text-xs text-zinc-400">Riwayat aksi sensitif administrator untuk transparansi & audit</p>
            </div>
            <span className="text-xs font-mono text-zinc-500">{auditLogs.length} Total Logs</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 font-semibold uppercase text-[10px]">
                  <th className="pb-3 px-2">Waktu</th>
                  <th className="pb-3 px-2">Admin</th>
                  <th className="pb-3 px-2">Aksi</th>
                  <th className="pb-3 px-2">Target</th>
                  <th className="pb-3 px-2">Detail Deskripsi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-3 px-2 text-zinc-400 text-[11px] whitespace-nowrap">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="py-3 px-2 text-zinc-300 font-medium whitespace-nowrap">
                      {log.adminEmail || log.adminId}
                    </td>
                    <td className="py-3 px-2">
                      <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 font-mono text-[10px] font-bold text-amber-300">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-zinc-400 font-mono text-[11px] truncate max-w-[120px]">
                      {log.target || '-'}
                    </td>
                    <td className="py-3 px-2 text-zinc-300">{log.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: BALANCE ADJUSTMENT (Requirement #17) */}
      {adjustModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl text-white">
            <h3 className="text-base font-bold mb-1">Penyesuaian Saldo Pengguna</h3>
            <p className="text-xs text-zinc-400 mb-4">
              User: <strong className="text-white">{adjustModalUser.email}</strong> (Saldo saat ini: Rp
              {(adjustModalUser.balance || 0).toLocaleString('id-ID')})
            </p>

            <form onSubmit={handleExecuteAdjust} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 mb-1 font-semibold">Tipe Penyesuaian:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustDirection('ADD')}
                    className={`py-2 rounded-xl font-bold border transition-colors ${
                      adjustDirection === 'ADD'
                        ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400'
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
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    - Kurangi Saldo
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-semibold">Nominal (IDR):</label>
                <input
                  id="adjust-amount-input"
                  type="text"
                  required
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-bold text-sm focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-semibold">Alasan Penyesuaian (Audit):</label>
                <input
                  id="adjust-reason-input"
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="Misal: Bonus loyalitas / Koreksi deposit"
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustModalUser(null)}
                  className="py-2.5 px-4 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  id="submit-adjust-btn"
                  type="submit"
                  disabled={loadingAction}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-white text-black font-bold hover:bg-zinc-200 transition-colors"
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
