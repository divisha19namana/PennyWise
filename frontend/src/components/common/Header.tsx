import React, { useState } from 'react';
import { 
  Bell, Search, Sparkles, Moon, Sun, Plus, 
  ChevronDown, Shield, Users, LogOut 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFamily } from '../../context/FamilyContext';
import { useNotifications } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import { RoleBadge } from './Badge';
import { QuickActionModal } from './QuickActionModal';
import { FamilyRole } from '../../types';

interface HeaderProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage }) => {
  const { currentUser, switchRole, logout } = useAuth();
  const { family } = useFamily();
  const { unreadCount } = useNotifications();
  const { theme, toggleTheme } = useTheme();

  const [isQuickActionOpen, setIsQuickActionOpen] = useState<boolean>(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const roles: { role: FamilyRole; name: string; desc: string }[] = [
    { role: 'FamilyAdmin', name: 'Rajesh Sharma', desc: 'Full family admin & budget management' },
    { role: 'FinanceManager', name: 'Priya Sharma', desc: 'Household expense & grocery manager' },
    { role: 'AdultMember', name: 'Aarav Sharma', desc: 'Contributing member with private finances' },
    { role: 'Dependent', name: 'Ananya Sharma', desc: 'Student allowance & goals view' },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#0B1522]/95 backdrop-blur-md border-b border-gray-100 dark:border-[#1E3553] px-4 sm:px-6 py-3 transition-colors">
        <div className="flex items-center justify-between gap-4">
          
          {/* Left: Family Selector & Month Selector */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-gray-50 dark:bg-[#14253A] border border-gray-200 dark:border-[#1E3553] rounded-xl px-3 py-1.5 shadow-sm">
              <span className="text-base">{family.avatar}</span>
              <span className="text-xs font-bold text-[#142B45] dark:text-white">
                {family.name}
              </span>
            </div>

            <div className="hidden sm:flex items-center space-x-1.5 bg-gray-50 dark:bg-[#14253A] border border-gray-200 dark:border-[#1E3553] rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[#142B45] dark:text-gray-200">
              <span>Nov 2026</span>
            </div>
          </div>

          {/* Center: Global Search */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-2">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search transactions, bills, merchants, categories..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    onNavigate('transactions');
                  }
                }}
                className="w-full pl-9 pr-4 py-1.5 bg-gray-50 dark:bg-[#14253A] border border-gray-200 dark:border-[#1E3553] rounded-xl text-xs text-[#142B45] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#16A36A]"
              />
            </div>
          </div>

          {/* Right: Quick Action, AI Assistant, Notifications, Role Switcher, Theme, Profile */}
          <div className="flex items-center space-x-2.5">
            {/* Quick Action Button */}
            <button
              onClick={() => setIsQuickActionOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#16A36A] hover:bg-[#138959] text-white text-xs font-semibold rounded-xl shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Transaction</span>
            </button>

            {/* AI Assistant Shortcut */}
            <button
              onClick={() => onNavigate('ai')}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition ${
                currentPage === 'ai'
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-[#16A36A] border-[#16A36A]'
                  : 'bg-gray-50 dark:bg-[#14253A] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-[#1E3553] hover:text-[#16A36A]'
              }`}
              title="Open AI Financial Assistant"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#16A36A]" />
              <span className="hidden lg:inline">PennyAI</span>
            </button>

            {/* Notification Center */}
            <button
              onClick={() => onNavigate('notifications')}
              className="relative p-2 rounded-xl bg-gray-50 dark:bg-[#14253A] border border-gray-200 dark:border-[#1E3553] text-gray-600 dark:text-gray-300 hover:text-[#142B45] dark:hover:text-white transition"
              title="Notification Center"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-gray-50 dark:bg-[#14253A] border border-gray-200 dark:border-[#1E3553] text-gray-600 dark:text-gray-300 hover:text-[#142B45] dark:hover:text-white transition"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Role Switcher Dropdown (Essential for testing all 4 roles) */}
            <div className="relative">
              <button
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="flex items-center space-x-2 pl-2 pr-2.5 py-1 rounded-xl bg-gray-50 dark:bg-[#14253A] border border-gray-200 dark:border-[#1E3553] hover:border-[#16A36A] transition"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-6 h-6 rounded-full object-cover border border-emerald-500"
                />
                <div className="hidden xl:flex flex-col text-left">
                  <span className="text-[11px] font-bold text-[#142B45] dark:text-white leading-tight">
                    {currentUser.name}
                  </span>
                  <span className="text-[9px] text-[#738095] dark:text-gray-400 leading-tight">
                    {currentUser.role}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {/* Dropdown Menu */}
              {isRoleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#14253A] rounded-2xl shadow-2xl border border-gray-100 dark:border-[#1E3553] py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-[#1E3553]">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#738095] dark:text-gray-400">
                      Switch Role Mode (Testing)
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Verify UI permissions & private finance isolation
                    </p>
                  </div>

                  <div className="py-1">
                    {roles.map(r => (
                      <button
                        key={r.role}
                        onClick={() => {
                          switchRole(r.role);
                          setIsRoleDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 flex items-start space-x-2.5 hover:bg-gray-50 dark:hover:bg-[#1E3553] transition ${
                          currentUser.role === r.role ? 'bg-emerald-50/50 dark:bg-emerald-950/20' : ''
                        }`}
                      >
                        <Shield className={`w-4 h-4 mt-0.5 ${currentUser.role === r.role ? 'text-[#16A36A]' : 'text-gray-400'}`} />
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="text-xs font-semibold text-[#142B45] dark:text-white">
                              {r.name}
                            </span>
                            <RoleBadge role={r.role} size="sm" />
                          </div>
                          <p className="text-[10px] text-[#738095] dark:text-gray-400 mt-0.5">
                            {r.desc}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-gray-100 dark:border-[#1E3553] px-2 pt-1">
                    <button
                      onClick={() => onNavigate('settings')}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1E3553] rounded-lg transition"
                    >
                      Settings & Privacy
                    </button>
                    <button
                      onClick={logout}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition flex items-center space-x-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Global Quick Action Modal */}
      <QuickActionModal
        isOpen={isQuickActionOpen}
        onClose={() => setIsQuickActionOpen(false)}
      />
    </>
  );
};

