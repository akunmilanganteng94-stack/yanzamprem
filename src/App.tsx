/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StoreProvider } from './context/StoreContext';
import Navbar from './components/Navbar';
import MobileBottomNav from './components/MobileBottomNav';
import HomeView from './components/HomeView';
import DepositView from './components/DepositView';
import OrdersView from './components/OrdersView';
import AccountView from './components/AccountView';
import AdminView from './components/AdminView';
import AuthModal from './components/AuthModal';
import WhatsAppModal from './components/WhatsAppModal';
import ConfirmationModal from './components/ConfirmationModal';
import Toast from './components/Toast';

function StoreApp() {
  const { currentUser, isAdmin } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');
  const [whatsappModalOpen, setWhatsappModalOpen] = useState<boolean>(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
  const [orderQuantity, setOrderQuantity] = useState<number>(1);

  // Hash route support (e.g., #admin, #deposit, #orders)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (['home', 'deposit', 'orders', 'account', 'admin'].includes(hash)) {
        setCurrentTab(hash);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    window.location.hash = tab === 'home' ? '' : `#${tab}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthInitialMode(mode);
    setAuthModalOpen(true);
  };

  const handleOpenConfirm = (quantity: number) => {
    setOrderQuantity(quantity);
    setConfirmModalOpen(true);
  };

  const handleSuccessOrder = (_orderId: string) => {
    handleTabChange('orders');
  };

  const handleNeedDeposit = () => {
    handleTabChange('deposit');
  };

  return (
    <div className="min-h-screen bg-[#07050e] text-[#f4f4f6] flex flex-col selection:bg-purple-600 selection:text-white">
      {/* Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={handleTabChange}
        onOpenAuth={() => handleOpenAuth('login')}
        onOpenWhatsApp={() => setWhatsappModalOpen(true)}
      />

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto pb-24 md:pb-12 px-2 sm:px-4">
        {currentTab === 'home' && (
          <HomeView
            onOpenConfirm={handleOpenConfirm}
            onOpenAuth={() => handleOpenAuth('register')}
            onGotoDeposit={() => handleTabChange('deposit')}
            onOpenWhatsApp={() => setWhatsappModalOpen(true)}
          />
        )}
        {currentTab === 'deposit' && (
          <DepositView onOpenAuth={() => handleOpenAuth('login')} />
        )}
        {currentTab === 'orders' && (
          <OrdersView onOpenAuth={() => handleOpenAuth('login')} />
        )}
        {currentTab === 'account' && (
          <AccountView
            onOpenAuth={() => handleOpenAuth('login')}
            onGotoDeposit={() => handleTabChange('deposit')}
            onGotoOrders={() => handleTabChange('orders')}
          />
        )}
        {currentTab === 'admin' && (
          <AdminView onOpenAuth={() => handleOpenAuth('login')} />
        )}
      </main>

      {/* Mobile Floating Bottom Navigation */}
      <MobileBottomNav
        currentTab={currentTab}
        setCurrentTab={handleTabChange}
        onOpenAuth={() => handleOpenAuth('login')}
      />

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authInitialMode}
      />

      <WhatsAppModal
        isOpen={whatsappModalOpen}
        onClose={() => setWhatsappModalOpen(false)}
      />

      <ConfirmationModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        quantity={orderQuantity}
        onSuccessOrder={handleSuccessOrder}
        onNeedDeposit={handleNeedDeposit}
      />

      {/* Toast Notification Container */}
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <StoreApp />
      </StoreProvider>
    </AuthProvider>
  );
}
