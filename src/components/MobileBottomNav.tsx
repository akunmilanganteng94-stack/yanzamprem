import React from 'react';
import { Home, ArrowDownCircle, ShoppingBag, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface MobileBottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenAuth: () => void;
}

export default function MobileBottomNav({ currentTab, setCurrentTab, onOpenAuth }: MobileBottomNavProps) {
  const { currentUser } = useAuth();

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'deposit', label: 'Deposit', icon: ArrowDownCircle },
    { id: 'orders', label: 'Pesanan', icon: ShoppingBag },
    { id: 'account', label: 'Akun', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#07070a]/95 backdrop-blur-xl border-t border-zinc-800/80 px-2 py-1.5 shadow-2xl">
      <div className="grid grid-cols-4 items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`bottom-nav-${tab.id}`}
              onClick={() => {
                if (tab.id !== 'home' && !currentUser) {
                  onOpenAuth();
                  return;
                }
                setCurrentTab(tab.id);
              }}
              className={`flex flex-col items-center justify-center min-h-[46px] py-1 rounded-xl transition-all ${
                isActive
                  ? 'text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
                )}
              </div>
              <span className={`text-[11px] mt-1 font-medium tracking-tight ${isActive ? 'font-semibold text-white' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
