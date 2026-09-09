import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from './AuthContext';
import {
  Product,
  StoreSettings,
  StockItem,
  Deposit,
  Order,
  TransactionRecord,
  ToastMessage,
  AuditLog
} from '../types';

interface StoreContextType {
  settings: StoreSettings;
  product: Product;
  availableStockCount: number;
  orders: Order[];
  deposits: Deposit[];
  transactions: TransactionRecord[];
  toasts: ToastMessage[];
  addToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning', title?: string) => void;
  removeToast: (id: string) => void;
  createOrder: (quantity: number) => Promise<string>;
  createDeposit: (amount: number, senderName: string, method: 'QRIS' | 'DANA') => Promise<string>;
  // Admin helpers
  approveDeposit: (depositId: string) => Promise<void>;
  rejectDeposit: (depositId: string) => Promise<void>;
  addStockItem: (account: string, password: string, installationNote?: string) => Promise<void>;
  addMultipleStockItems: (items: { account: string; password: string; installationNote?: string }[]) => Promise<number>;
  deleteStockItem: (stockId: string) => Promise<void>;
  adjustBalance: (targetUserId: string, amount: number, direction: 'ADD' | 'SUBTRACT', reason: string) => Promise<void>;
  toggleUserStatus: (targetUserId: string, newStatus: 'active' | 'suspended') => Promise<void>;
  updateStoreSettings: (newSettings: Partial<StoreSettings>) => Promise<void>;
  initializeSampleData: () => Promise<void>;
}

const DEFAULT_PRODUCT_ID = 'alight-motion-premium-01';

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'YANZSTR',
  storeStatus: 'OPEN',
  productPrice: 500,
  whatsappChannel: 'https://whatsapp.com/channel/0029Vb7mnNA05MUcyKEy2W1E'
};

const DEFAULT_PRODUCT: Product = {
  id: DEFAULT_PRODUCT_ID,
  name: 'Alight Motion Premium',
  price: 500,
  image: 'https://cdn.phototourl.com/free/2026-09-09-96fa0c82-2c28-4a30-924b-954fb1e3af92.jpg',
  description: 'Alight Motion Pro / Premium unlock full fitur, export tanpa watermark, support Preset XML & 5MB+, garansi aktif & login mudah.',
  active: true
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { currentUser, userProfile, isAdmin } = useAuth();

  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [product, setProduct] = useState<Product>(DEFAULT_PRODUCT);
  const [availableStockCount, setAvailableStockCount] = useState<number>(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', title?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, title }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 1. Realtime listener for settings/store
  useEffect(() => {
    const settingsDocRef = doc(db, 'settings', 'store');
    const unsubscribe = onSnapshot(
      settingsDocRef,
      async (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSettings({
            storeName: data.storeName || 'YANZSTR',
            storeStatus: data.storeStatus === 'CLOSED' ? 'CLOSED' : 'OPEN',
            productPrice: typeof data.productPrice === 'number' ? data.productPrice : 500,
            whatsappChannel: data.whatsappChannel || DEFAULT_SETTINGS.whatsappChannel
          });
        } else {
          // Document does not exist yet; create it
          try {
            await setDoc(settingsDocRef, DEFAULT_SETTINGS);
          } catch {
            // Ignored if permissions don't allow initial write until logged in
          }
        }
      },
      (error) => {
        console.warn('Settings snapshot listener note:', error.message);
      }
    );

    return () => unsubscribe();
  }, []);

  // 2. Realtime listener for default product
  useEffect(() => {
    const productDocRef = doc(db, 'products', DEFAULT_PRODUCT_ID);
    const unsubscribe = onSnapshot(
      productDocRef,
      async (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProduct({
            id: docSnap.id,
            name: data.name || DEFAULT_PRODUCT.name,
            price: typeof data.price === 'number' ? data.price : 500,
            image: data.image || DEFAULT_PRODUCT.image,
            description: data.description || DEFAULT_PRODUCT.description,
            active: data.active !== false
          });
        } else {
          try {
            await setDoc(productDocRef, DEFAULT_PRODUCT);
          } catch {
            // Ignored
          }
        }
      },
      (error) => {
        console.warn('Product snapshot note:', error.message);
      }
    );

    return () => unsubscribe();
  }, []);

  // 3. Realtime listener for available stock
  useEffect(() => {
    const stockColRef = collection(db, 'stock');
    const q = query(
      stockColRef,
      where('productId', '==', DEFAULT_PRODUCT_ID),
      where('status', '==', 'AVAILABLE')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setAvailableStockCount(snapshot.size);
      },
      (error) => {
        console.warn('Stock query note:', error.message);
      }
    );

    return () => unsubscribe();
  }, []);

  // 4. Realtime listener for user orders
  useEffect(() => {
    if (!currentUser) {
      setOrders([]);
      return;
    }

    const ordersColRef = collection(db, 'orders');
    const q = query(
      ordersColRef,
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: Order[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          list.push({
            id: docSnap.id,
            userId: d.userId,
            userEmail: d.userEmail,
            productId: d.productId,
            productName: d.productName || 'Alight Motion Premium',
            quantity: d.quantity,
            totalPrice: d.totalPrice,
            items: d.items || [],
            status: d.status,
            createdAt: d.createdAt
          });
        });

        // Sort descending by createdAt
        list.sort((a, b) => {
          const tA = a.createdAt?.seconds ? a.createdAt.seconds : 0;
          const tB = b.createdAt?.seconds ? b.createdAt.seconds : 0;
          return tB - tA;
        });

        setOrders(list);
      },
      (error) => {
        console.warn('Orders snapshot note:', error.message);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // 5. Realtime listener for user deposits
  useEffect(() => {
    if (!currentUser) {
      setDeposits([]);
      return;
    }

    const depositsColRef = collection(db, 'deposits');
    const q = query(
      depositsColRef,
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: Deposit[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          list.push({
            id: docSnap.id,
            userId: d.userId,
            userEmail: d.userEmail,
            amount: d.amount,
            senderName: d.senderName,
            paymentMethod: d.paymentMethod,
            status: d.status,
            adminId: d.adminId,
            createdAt: d.createdAt,
            approvedAt: d.approvedAt
          });
        });

        list.sort((a, b) => {
          const tA = a.createdAt?.seconds ? a.createdAt.seconds : 0;
          const tB = b.createdAt?.seconds ? b.createdAt.seconds : 0;
          return tB - tA;
        });

        setDeposits(list);
      },
      (error) => {
        console.warn('Deposits snapshot note:', error.message);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // 6. Realtime listener for user transactions
  useEffect(() => {
    if (!currentUser) {
      setTransactions([]);
      return;
    }

    const txColRef = collection(db, 'transactions');
    const q = query(
      txColRef,
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: TransactionRecord[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          list.push({
            id: docSnap.id,
            userId: d.userId,
            type: d.type,
            amount: d.amount,
            balanceBefore: d.balanceBefore,
            balanceAfter: d.balanceAfter,
            referenceId: d.referenceId,
            description: d.description,
            createdAt: d.createdAt
          });
        });

        list.sort((a, b) => {
          const tA = a.createdAt?.seconds ? a.createdAt.seconds : 0;
          const tB = b.createdAt?.seconds ? b.createdAt.seconds : 0;
          return tB - tA;
        });

        setTransactions(list);
      },
      (error) => {
        console.warn('Transactions snapshot note:', error.message);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // --- ACTIONS ---

  /**
   * ATOMIC ORDER CREATION (FIRESTORE TRANSACTION)
   * Prevents race conditions: verifies store open, verifies user active and balance,
   * claims stock documents atomically, and updates balance.
   */
  const createOrder = async (quantity: number): Promise<string> => {
    if (!currentUser) {
      throw new Error('Silakan login terlebih dahulu.');
    }
    if (userProfile?.status === 'suspended') {
      throw new Error('Akun Anda sedang disuspend. Hubungi admin.');
    }
    if (quantity <= 0) {
      throw new Error('Jumlah pesanan tidak valid.');
    }

    // Step 1: Pre-fetch available stock candidates
    const stockColRef = collection(db, 'stock');
    const availableStockQuery = query(
      stockColRef,
      where('productId', '==', DEFAULT_PRODUCT_ID),
      where('status', '==', 'AVAILABLE'),
      limit(quantity * 2) // query a buffer in case of concurrent claims
    );

    const stockSnap = await getDocs(availableStockQuery);
    if (stockSnap.size < quantity) {
      throw new Error(`Stok Alight Motion Premium tidak mencukupi! Hanya tersisa ${stockSnap.size} akun.`);
    }

    const candidateStockDocs = stockSnap.docs.slice(0, quantity);
    const userDocRef = doc(db, 'users', currentUser.uid);
    const settingsDocRef = doc(db, 'settings', 'store');
    const newOrderRef = doc(collection(db, 'orders'));
    const newTxRef = doc(collection(db, 'transactions'));

    let finalOrderId = '';

    await runTransaction(db, async (transaction) => {
      // 1. Check Store Settings in transaction
      const storeDoc = await transaction.get(settingsDocRef);
      const storeData = storeDoc.data();
      if (storeData && storeData.storeStatus === 'CLOSED') {
        throw new Error('Store sedang ditutup sementara oleh admin.');
      }
      const actualUnitPrice = storeData && typeof storeData.productPrice === 'number'
        ? storeData.productPrice
        : (settings.productPrice || 500);

      const totalPrice = actualUnitPrice * quantity;

      // 2. Check User Balance in transaction
      const userDoc = await transaction.get(userDocRef);
      if (!userDoc.exists()) {
        throw new Error('Data profil user tidak ditemukan.');
      }
      const userData = userDoc.data();
      if (userData.status === 'suspended') {
        throw new Error('Akun sedang disuspend.');
      }
      const currentBalance = typeof userData.balance === 'number'
        ? userData.balance
        : Number(userData.balance || 0);

      if (currentBalance < totalPrice) {
        throw new Error(`Saldo tidak mencukupi! Saldo Anda Rp${currentBalance.toLocaleString('id-ID')}, dibutuhkan Rp${totalPrice.toLocaleString('id-ID')}. Silakan deposit terlebih dahulu.`);
      }

      // 3. Verify that candidate stock docs are still AVAILABLE inside the transaction
      const claimedItems: { account: string; password: string; installationNote: string; stockDocId: string }[] = [];

      for (const stockDocSnap of candidateStockDocs) {
        const freshStock = await transaction.get(stockDocSnap.ref);
        if (!freshStock.exists() || freshStock.data().status !== 'AVAILABLE') {
          throw new Error('Beberapa stok baru saja dibeli oleh user lain. Silakan coba lagi.');
        }
        const sData = freshStock.data();
        claimedItems.push({
          stockDocId: freshStock.id,
          account: sData.account || '',
          password: sData.password || '',
          installationNote: sData.installationNote || 'Login melalui browser atau app Alight Motion. Jangan ubah password akun bersama.',
        });
      }

      if (claimedItems.length < quantity) {
        throw new Error('Stok tidak mencukupi pada saat verifikasi transaksi.');
      }

      // 4. Update Stock Docs -> SOLD
      for (const item of claimedItems) {
        const sRef = doc(db, 'stock', item.stockDocId);
        transaction.update(sRef, {
          status: 'SOLD',
          orderId: newOrderRef.id,
          soldAt: serverTimestamp()
        });
      }

      // 5. Update User Balance
      const newBalance = currentBalance - totalPrice;
      transaction.update(userDocRef, {
        balance: newBalance,
        updatedAt: serverTimestamp()
      });

      // 6. Create Order Doc
      transaction.set(newOrderRef, {
        userId: currentUser.uid,
        userEmail: currentUser.email || '',
        productId: DEFAULT_PRODUCT_ID,
        productName: 'Alight Motion Premium',
        quantity,
        totalPrice,
        items: claimedItems.map(c => ({
          account: c.account,
          password: c.password,
          installationNote: c.installationNote
        })),
        status: 'SUCCESS',
        createdAt: serverTimestamp()
      });

      // 7. Create Transaction Record
      transaction.set(newTxRef, {
        userId: currentUser.uid,
        type: 'ORDER',
        amount: -totalPrice,
        balanceBefore: currentBalance,
        balanceAfter: newBalance,
        referenceId: newOrderRef.id,
        description: `Pembelian ${quantity}x Alight Motion Premium`,
        createdAt: serverTimestamp()
      });

      finalOrderId = newOrderRef.id;
    });

    addToast(`Pesanan berhasil! ${quantity} akun telah ditambahkan ke Riwayat Pesanan.`, 'success', '✓ Pesanan Berhasil');
    return finalOrderId;
  };

  /**
   * DEPOSIT CREATION
   */
  const createDeposit = async (amount: number, senderName: string, method: 'QRIS' | 'DANA'): Promise<string> => {
    if (!currentUser) throw new Error('Silakan login untuk melakukan deposit.');
    if (settings.storeStatus === 'CLOSED') {
      throw new Error('Deposit sedang tidak dapat diproses karena store closed.');
    }
    if (amount < 1000) {
      throw new Error('Minimal deposit adalah Rp1.000.');
    }
    if (!senderName.trim()) {
      throw new Error('Nama pengirim wajib diisi untuk verifikasi transfer.');
    }

    const depositDocRef = await addDoc(collection(db, 'deposits'), {
      userId: currentUser.uid,
      userEmail: currentUser.email || '',
      amount,
      senderName: senderName.trim(),
      paymentMethod: method,
      status: 'PENDING',
      adminId: null,
      createdAt: serverTimestamp(),
      approvedAt: null
    });

    addToast('Permintaan deposit berhasil dibuat. Menunggu konfirmasi admin.', 'info', '✓ Deposit Terkirim');
    return depositDocRef.id;
  };

  // --- ADMIN ACTIONS ---

  /**
   * ADMIN APPROVE DEPOSIT (ATOMIC)
   */
  const approveDeposit = async (depositId: string) => {
    if (!isAdmin || !currentUser) throw new Error('Akses ditolak. Anda bukan admin.');

    const depositRef = doc(db, 'deposits', depositId);
    const newTxRef = doc(collection(db, 'transactions'));
    const newLogRef = doc(collection(db, 'auditLogs'));

    await runTransaction(db, async (transaction) => {
      const depSnap = await transaction.get(depositRef);
      if (!depSnap.exists()) throw new Error('Deposit tidak ditemukan.');
      const depData = depSnap.data();

      if (depData.status !== 'PENDING') {
        throw new Error(`Deposit ini sudah ${depData.status} sebelumnya.`);
      }

      const userRef = doc(db, 'users', depData.userId);
      const userSnap = await transaction.get(userRef);
      if (!userSnap.exists()) throw new Error('User pemilik deposit tidak ditemukan.');

      const userData = userSnap.data();
      const currentBalance = typeof userData.balance === 'number'
        ? userData.balance
        : Number(userData.balance || 0);

      const newBalance = currentBalance + depData.amount;

      // 1. Update deposit status
      transaction.update(depositRef, {
        status: 'APPROVED',
        adminId: currentUser.uid,
        approvedAt: serverTimestamp()
      });

      // 2. Add user balance
      transaction.update(userRef, {
        balance: newBalance,
        updatedAt: serverTimestamp()
      });

      // 3. Record transaction
      transaction.set(newTxRef, {
        userId: depData.userId,
        type: 'DEPOSIT',
        amount: depData.amount,
        balanceBefore: currentBalance,
        balanceAfter: newBalance,
        referenceId: depositId,
        description: `Deposit ${depData.paymentMethod} sebesar Rp${depData.amount.toLocaleString('id-ID')} disetujui`,
        createdAt: serverTimestamp()
      });

      // 4. Record audit log
      transaction.set(newLogRef, {
        adminId: currentUser.uid,
        adminEmail: currentUser.email || '',
        action: 'APPROVE_DEPOSIT',
        target: depositId,
        description: `Menyetujui deposit user ${depData.userEmail || depData.userId} sebesar Rp${depData.amount}`,
        createdAt: serverTimestamp()
      });
    });

    addToast('Deposit berhasil disetujui & saldo user telah bertambah.', 'success', '✓ Deposit Disetujui');
  };

  /**
   * ADMIN REJECT DEPOSIT
   */
  const rejectDeposit = async (depositId: string) => {
    if (!isAdmin || !currentUser) throw new Error('Akses ditolak.');

    const depositRef = doc(db, 'deposits', depositId);
    const depSnap = await getDoc(depositRef);
    if (!depSnap.exists()) throw new Error('Deposit tidak ditemukan.');
    const depData = depSnap.data();

    if (depData.status !== 'PENDING') {
      throw new Error(`Deposit ini sudah berstatus ${depData.status}.`);
    }

    await updateDoc(depositRef, {
      status: 'REJECTED',
      adminId: currentUser.uid,
      approvedAt: serverTimestamp()
    });

    await addDoc(collection(db, 'auditLogs'), {
      adminId: currentUser.uid,
      adminEmail: currentUser.email || '',
      action: 'REJECT_DEPOSIT',
      target: depositId,
      description: `Menolak deposit ${depData.userEmail || depData.userId} sejumlah Rp${depData.amount}`,
      createdAt: serverTimestamp()
    });

    addToast('Deposit telah ditolak.', 'info', 'Deposit Ditolak');
  };

  /**
   * ADMIN ADD SINGLE STOCK
   */
  const addStockItem = async (account: string, pass: string, installationNote?: string) => {
    if (!isAdmin || !currentUser) throw new Error('Akses ditolak.');
    if (!account.trim() || !pass.trim()) throw new Error('Email/Akun dan Password wajib diisi.');

    await addDoc(collection(db, 'stock'), {
      productId: DEFAULT_PRODUCT_ID,
      account: account.trim(),
      password: pass.trim(),
      installationNote: installationNote?.trim() || 'Login via aplikasi Alight Motion. Gunakan profil pro.',
      status: 'AVAILABLE',
      orderId: null,
      createdAt: serverTimestamp(),
      soldAt: null
    });

    await addDoc(collection(db, 'auditLogs'), {
      adminId: currentUser.uid,
      adminEmail: currentUser.email || '',
      action: 'ADD_STOCK',
      target: account.trim(),
      description: `Menambahkan 1 stok baru untuk Alight Motion Premium (${account.trim()})`,
      createdAt: serverTimestamp()
    });

    addToast('1 stok akun berhasil ditambahkan!', 'success', '✓ Stok Ditambahkan');
  };

  /**
   * ADMIN ADD MULTIPLE STOCKS (Bulk)
   */
  const addMultipleStockItems = async (items: { account: string; password: string; installationNote?: string }[]): Promise<number> => {
    if (!isAdmin || !currentUser) throw new Error('Akses ditolak.');
    if (items.length === 0) return 0;

    let count = 0;
    for (const it of items) {
      if (!it.account?.trim() || !it.password?.trim()) continue;
      await addDoc(collection(db, 'stock'), {
        productId: DEFAULT_PRODUCT_ID,
        account: it.account.trim(),
        password: it.password.trim(),
        installationNote: it.installationNote?.trim() || 'Login via aplikasi Alight Motion. Gunakan profil pro.',
        status: 'AVAILABLE',
        orderId: null,
        createdAt: serverTimestamp(),
        soldAt: null
      });
      count++;
    }

    if (count > 0) {
      await addDoc(collection(db, 'auditLogs'), {
        adminId: currentUser.uid,
        adminEmail: currentUser.email || '',
        action: 'ADD_STOCK',
        target: `${count} akun`,
        description: `Menambahkan ${count} stok akun baru`,
        createdAt: serverTimestamp()
      });
      addToast(`${count} akun stok berhasil ditambahkan!`, 'success', '✓ Stok Ditambahkan');
    }
    return count;
  };

  /**
   * ADMIN DELETE STOCK
   */
  const deleteStockItem = async (stockId: string) => {
    if (!isAdmin || !currentUser) throw new Error('Akses ditolak.');
    const stockRef = doc(db, 'stock', stockId);
    const stockSnap = await getDoc(stockRef);
    if (!stockSnap.exists()) return;
    const sData = stockSnap.data();

    if (sData.status === 'SOLD') {
      throw new Error('Akun yang sudah terjual tidak dapat dihapus untuk integritas order.');
    }

    await deleteDoc(stockRef);

    await addDoc(collection(db, 'auditLogs'), {
      adminId: currentUser.uid,
      adminEmail: currentUser.email || '',
      action: 'DELETE_STOCK',
      target: stockId,
      description: `Menghapus stok akun ${sData.account}`,
      createdAt: serverTimestamp()
    });

    addToast('Stok berhasil dihapus.', 'info');
  };

  /**
   * ADMIN ADJUST BALANCE
   */
  const adjustBalance = async (targetUserId: string, amount: number, direction: 'ADD' | 'SUBTRACT', reason: string) => {
    if (!isAdmin || !currentUser) throw new Error('Akses ditolak.');
    if (amount <= 0) throw new Error('Nominal adjustment harus lebih besar dari 0.');
    if (!reason.trim()) throw new Error('Alasan adjustment wajib diisi.');

    const userRef = doc(db, 'users', targetUserId);
    const newTxRef = doc(collection(db, 'transactions'));
    const newLogRef = doc(collection(db, 'auditLogs'));

    await runTransaction(db, async (transaction) => {
      const userSnap = await transaction.get(userRef);
      if (!userSnap.exists()) throw new Error('User tidak ditemukan.');
      const userData = userSnap.data();

      const currentBalance = typeof userData.balance === 'number'
        ? userData.balance
        : Number(userData.balance || 0);

      const change = direction === 'ADD' ? amount : -amount;
      const newBalance = Math.max(0, currentBalance + change);

      transaction.update(userRef, {
        balance: newBalance,
        updatedAt: serverTimestamp()
      });

      transaction.set(newTxRef, {
        userId: targetUserId,
        type: 'ADJUSTMENT',
        amount: change,
        balanceBefore: currentBalance,
        balanceAfter: newBalance,
        description: `Manual adjustment oleh admin: ${reason.trim()}`,
        createdAt: serverTimestamp()
      });

      transaction.set(newLogRef, {
        adminId: currentUser.uid,
        adminEmail: currentUser.email || '',
        action: 'ADJUST_BALANCE',
        target: targetUserId,
        description: `${direction === 'ADD' ? 'Menambah' : 'Mengurangi'} saldo user ${userData.email} sebesar Rp${amount.toLocaleString('id-ID')}. Alasan: ${reason.trim()}`,
        createdAt: serverTimestamp()
      });
    });

    addToast(`Saldo user berhasil diatur (${direction === 'ADD' ? '+' : '-'}Rp${amount.toLocaleString('id-ID')}).`, 'success');
  };

  /**
   * ADMIN TOGGLE USER STATUS (Suspend / Activate)
   */
  const toggleUserStatus = async (targetUserId: string, newStatus: 'active' | 'suspended') => {
    if (!isAdmin || !currentUser) throw new Error('Akses ditolak.');
    const userRef = doc(db, 'users', targetUserId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) throw new Error('User tidak ditemukan.');
    const userData = userSnap.data();

    await updateDoc(userRef, {
      status: newStatus,
      updatedAt: serverTimestamp()
    });

    await addDoc(collection(db, 'auditLogs'), {
      adminId: currentUser.uid,
      adminEmail: currentUser.email || '',
      action: newStatus === 'suspended' ? 'SUSPEND_USER' : 'ACTIVATE_USER',
      target: targetUserId,
      description: `Mengubah status user ${userData.email} menjadi ${newStatus}`,
      createdAt: serverTimestamp()
    });

    addToast(`Status user diubah menjadi ${newStatus}.`, 'info');
  };

  /**
   * ADMIN UPDATE STORE SETTINGS
   */
  const updateStoreSettings = async (newSettings: Partial<StoreSettings>) => {
    if (!isAdmin || !currentUser) throw new Error('Akses ditolak.');
    const settingsDocRef = doc(db, 'settings', 'store');

    await updateDoc(settingsDocRef, newSettings);

    if (newSettings.storeStatus) {
      await addDoc(collection(db, 'auditLogs'), {
        adminId: currentUser.uid,
        adminEmail: currentUser.email || '',
        action: 'CHANGE_STORE_STATUS',
        target: 'settings/store',
        description: `Status toko diubah menjadi ${newSettings.storeStatus}`,
        createdAt: serverTimestamp()
      });
    }

    if (typeof newSettings.productPrice === 'number') {
      await addDoc(collection(db, 'auditLogs'), {
        adminId: currentUser.uid,
        adminEmail: currentUser.email || '',
        action: 'CHANGE_PRODUCT_PRICE',
        target: 'settings/store',
        description: `Harga produk diubah menjadi Rp${newSettings.productPrice.toLocaleString('id-ID')}`,
        createdAt: serverTimestamp()
      });
    }

    addToast('Pengaturan toko berhasil diperbarui.', 'success');
  };

  /**
   * INITIALIZE SAMPLE DATA & STOCK
   */
  const initializeSampleData = async () => {
    if (!isAdmin || !currentUser) throw new Error('Akses ditolak.');

    // 1. Settings
    const settingsDocRef = doc(db, 'settings', 'store');
    await setDoc(settingsDocRef, DEFAULT_SETTINGS, { merge: true });

    // 2. Product
    const productDocRef = doc(db, 'products', DEFAULT_PRODUCT_ID);
    await setDoc(productDocRef, DEFAULT_PRODUCT, { merge: true });

    // 3. Sample Accounts for initial stock
    const sampleAccounts = [
      { account: 'yanzstr.amprem01@gmail.com', password: 'YanzPasswordPro#1', installationNote: 'Akun Alight Motion Pro Premium. Garansi aktif.' },
      { account: 'yanzstr.amprem02@gmail.com', password: 'YanzPasswordPro#2', installationNote: 'Akun Alight Motion Pro Premium. Garansi aktif.' },
      { account: 'yanzstr.amprem03@gmail.com', password: 'YanzPasswordPro#3', installationNote: 'Akun Alight Motion Pro Premium. Garansi aktif.' },
      { account: 'yanzstr.amprem04@gmail.com', password: 'YanzPasswordPro#4', installationNote: 'Akun Alight Motion Pro Premium. Garansi aktif.' },
      { account: 'yanzstr.amprem05@gmail.com', password: 'YanzPasswordPro#5', installationNote: 'Akun Alight Motion Pro Premium. Garansi aktif.' },
    ];

    for (const item of sampleAccounts) {
      await addDoc(collection(db, 'stock'), {
        productId: DEFAULT_PRODUCT_ID,
        account: item.account,
        password: item.password,
        installationNote: item.installationNote,
        status: 'AVAILABLE',
        orderId: null,
        createdAt: serverTimestamp(),
        soldAt: null
      });
    }

    await addDoc(collection(db, 'auditLogs'), {
      adminId: currentUser.uid,
      adminEmail: currentUser.email || '',
      action: 'INIT_STORE',
      target: 'store/seed',
      description: 'Inisialisasi pengaturan toko dan 5 akun stok awal',
      createdAt: serverTimestamp()
    });

    addToast('Data toko dan 5 stok awal berhasil diinisialisasi!', 'success', '✓ Inisialisasi Berhasil');
  };

  return (
    <StoreContext.Provider
      value={{
        settings,
        product,
        availableStockCount,
        orders,
        deposits,
        transactions,
        toasts,
        addToast,
        removeToast,
        createOrder,
        createDeposit,
        approveDeposit,
        rejectDeposit,
        addStockItem,
        addMultipleStockItems,
        deleteStockItem,
        adjustBalance,
        toggleUserStatus,
        updateStoreSettings,
        initializeSampleData
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
