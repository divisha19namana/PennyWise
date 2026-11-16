import React, { useState } from 'react';
import { 
  LayoutDashboard, ReceiptText, PieChart, Sparkles, 
  Menu, X, Building2, Target, Calendar, Wallet, 
  Trophy, Settings, TrendingUp, Bot, FileSpreadsheet 
} from 'lucide-react';

interface MobileNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentPage, onNavigate }) => {
  const [isMoreOpen, setIsMoreOpen] = useState<boolean>(false);

  const mainTabs = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'transactions', label: 'Activity', icon: ReceiptText },
    { id: 'budget', label: 'Budget', icon: PieChart },
    { id: 'ai', label: 'PennyAI', icon: Sparkles },
  ];

  const moreItems = [
    { id: 'income', label: 'Income', icon: TrendingUp },
    { id: 'accounts', label: 'Accounts & Wallets', icon: Wallet },
    { id: 'autotracking', label: 'Automatic Tracking', icon: Bot },
    { id: 'loans', label: 'Loans & EMIs', icon: Building2 },
    { id: 'savings', label: 'Savings Goals', icon: Target },
    { id: 'calendar', label: 'Financial Calendar', icon: Calendar },
    { id: 'challenges', label: 'Family Challenges', icon: Trophy },
    { id: 'importexport', label: 'Import & Export', icon: FileSpreadsheet },
    { id: 'settings', label: 'Settings & Privacy', icon: Settings },
  ];

  return (
    <>
      {/* Bottom Sticky Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0B1522]/95 backdrop-blur-lg border-t border-gray-100 dark:border-[#1E3553] px-3 py-2 flex items-center justify-around">
        {mainTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = currentPage === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                onNavigate(tab.id);
                setIsMoreOpen(false);
              }}
              className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition ${
                isActive
                  ? 'text-[#16A36A] font-bold'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-1">{tab.label}</span>
            </button>
          );
        })}

        {/* More Button */}
        <button
          onClick={() => setIsMoreOpen(!isMoreOpen)}
          className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition ${
            isMoreOpen || moreItems.some(i => i.id === currentPage)
              ? 'text-[#16A36A] font-bold'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] mt-1">More</span>
        </button>
      </nav>

      {/* More Drawer Sheet */}
      {isMoreOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div 
            className="fixed inset-0 bg-[#142B45]/60 backdrop-blur-sm"
            onClick={() => setIsMoreOpen(false)}
          />

          <div className="relative bg-white dark:bg-[#14253A] rounded-t-3xl border-t border-gray-100 dark:border-[#1E3553] p-5 shadow-2xl z-10 max-h-[75vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-[#1E3553]">
              <h3 className="text-sm font-bold text-[#142B45] dark:text-white">
                All Modules & Services
              </h3>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1E3553]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-4 pb-6">
              {moreItems.map(item => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setIsMoreOpen(false);
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition ${
                      isActive
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-[#16A36A] text-[#16A36A]'
                        : 'bg-gray-50 dark:bg-[#0B1522] border-gray-200 dark:border-[#1E3553] text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-1.5 text-[#16A36A]" />
                    <span className="text-[11px] font-semibold leading-tight">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

