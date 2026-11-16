import React from 'react';
import { 
  LayoutDashboard, ReceiptText, Bot, Users, PieChart, 
  TrendingUp, Building2, Target, BarChart3, Calendar, 
  Wallet, RefreshCw, FileSpreadsheet, Sparkles, Settings, 
  Trophy, Tags, ChevronRight 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { RoleBadge } from './Badge';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: any;
  badge?: string;
  highlight?: boolean;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const { currentUser } = useAuth();

  const navGroups: NavGroup[] = [
    {
      group: 'Core Financials',
      items: [
        { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
        { id: 'transactions', label: 'Transactions', icon: ReceiptText },
        { id: 'autotracking', label: 'Automatic Tracking', icon: Bot, badge: 'Smart' },
        { id: 'budget', label: 'Monthly Budget', icon: PieChart },
        { id: 'income', label: 'Income', icon: TrendingUp },
        { id: 'accounts', label: 'Accounts & Wallets', icon: Wallet },
      ]
    },
    {
      group: 'Family & Planning',
      items: [
        { id: 'family', label: 'Family Roster', icon: Users },
        { id: 'challenges', label: 'Family Challenges', icon: Trophy, badge: 'New' },
        { id: 'loans', label: 'Loans & EMIs', icon: Building2 },
        { id: 'savings', label: 'Savings Goals', icon: Target },
        { id: 'calendar', label: 'Financial Calendar', icon: Calendar },
        { id: 'recurring', label: 'Recurring Payments', icon: RefreshCw },
      ]
    },
    {
      group: 'Intelligence & Tools',
      items: [
        { id: 'ai', label: 'AI Assistant', icon: Sparkles, highlight: true },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'categories', label: 'Categories', icon: Tags },
        { id: 'importexport', label: 'Import & Export', icon: FileSpreadsheet },
        { id: 'settings', label: 'Settings & Privacy', icon: Settings },
      ]
    }
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-[#0B1522] border-r border-gray-100 dark:border-[#1E3553] h-screen sticky top-0 flex-shrink-0 z-40 transition-colors">
      {/* Brand Header */}
      <div className="p-5 border-b border-gray-100 dark:border-[#1E3553]">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#142B45] to-[#16A36A] flex items-center justify-center text-white font-black text-lg shadow-md shadow-[#16A36A]/20">
            P
          </div>
          <div>
            <h1 className="text-base font-extrabold text-[#142B45] dark:text-white tracking-tight">
              PennyWise
            </h1>
            <p className="text-[10px] text-[#738095] dark:text-gray-400 font-medium leading-tight">
              Your Financial Clarity
            </p>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            <h4 className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#738095] dark:text-gray-400">
              {group.group}
            </h4>
            <div className="space-y-0.5 mt-1.5">
              {group.items.map(item => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition duration-150 ${
                      isActive
                        ? 'bg-[#142B45] dark:bg-[#16A36A] text-white shadow-sm'
                        : item.highlight
                        ? 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#14253A] hover:text-[#142B45] dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-[#16A36A]' : 'text-gray-400 dark:text-gray-400'}`} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer User Info */}
      <div className="p-3.5 border-t border-gray-100 dark:border-[#1E3553] bg-gray-50/70 dark:bg-[#14253A]/50 m-3 rounded-2xl">
        <div className="flex items-center space-x-2.5">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-8 h-8 rounded-full object-cover border border-[#16A36A]"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[#142B45] dark:text-white truncate">
              {currentUser.name}
            </p>
            <RoleBadge role={currentUser.role} size="sm" />
          </div>
        </div>
      </div>
    </aside>
  );
};
