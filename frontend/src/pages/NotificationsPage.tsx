import React, { useState } from 'react';
import { 
  Bell, Check, CheckCheck, Filter, ArrowRight, 
  AlertTriangle, ShieldCheck, Sparkles, ReceiptText, 
  Building2, TrendingUp, Target, Trash2 
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { NotificationItem, NotificationType } from '../types';

interface NotificationsPageProps {
  onNavigate: (page: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ onNavigate }) => {
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotifications();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<string>('all');

  const filteredNotifications = notifications.filter(n => {
    // Privacy filter: only show if user is recipient or if shared event
    if (!n.isShared && n.recipientId !== currentUser.id && currentUser.role !== 'FamilyAdmin') return false;

    if (activeTab === 'all') return true;
    if (activeTab === 'expenses' && n.type === 'expense_recorded') return true;
    if (activeTab === 'income' && n.type === 'income_received') return true;
    if (activeTab === 'emis' && (n.type === 'emi_deducted' || n.type === 'emi_overdue')) return true;
    if (activeTab === 'budgets' && (n.type === 'budget_warning' || n.type === 'budget_exceeded')) return true;
    if (activeTab === 'family' && (n.type === 'family_invite' || n.type === 'goal_achieved')) return true;
    return true;
  });

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'budget_warning':
      case 'budget_exceeded':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'expense_recorded':
        return <ReceiptText className="w-5 h-5 text-rose-500" />;
      case 'income_received':
        return <TrendingUp className="w-5 h-5 text-emerald-500" />;
      case 'emi_deducted':
        return <Building2 className="w-5 h-5 text-blue-500" />;
      case 'goal_achieved':
        return <Target className="w-5 h-5 text-purple-500" />;
      case 'large_expense':
        return <AlertTriangle className="w-5 h-5 text-rose-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#142B45] dark:text-white flex items-center space-x-2">
            <span>Notification & Alert Center</span>
            {unreadCount > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white">
                {unreadCount} Unread
              </span>
            )}
          </h2>
          <p className="text-xs text-[#738095] dark:text-gray-400 mt-1">
            Real-time SignalR notifications for verified expenses, threshold crossing, and bill reminders
          </p>
        </div>

        <button
          onClick={markAllAsRead}
          className="flex items-center space-x-1.5 px-4 py-2 bg-white dark:bg-[#14253A] border border-gray-200 dark:border-[#1E3553] text-[#142B45] dark:text-white rounded-xl text-xs font-bold hover:bg-gray-50 transition shadow-sm self-start sm:self-center"
        >
          <CheckCheck className="w-4 h-4 text-[#16A36A]" />
          <span>Mark All as Read</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-100 dark:border-[#1E3553] pb-2 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'all', label: 'All Alerts' },
          { id: 'budgets', label: 'Budget Thresholds' },
          { id: 'expenses', label: 'Expenses' },
          { id: 'income', label: 'Income' },
          { id: 'emis', label: 'EMIs & Loans' },
          { id: 'family', label: 'Family & Goals' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-[#142B45] dark:bg-[#16A36A] text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#14253A]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="bg-white dark:bg-[#14253A] rounded-3xl border border-gray-100 dark:border-[#1E3553] shadow-sm divide-y divide-gray-100 dark:divide-[#1E3553] overflow-hidden">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map(item => (
            <div
              key={item.id}
              className={`p-5 flex items-start justify-between transition ${
                !item.isRead ? 'bg-emerald-50/20 dark:bg-emerald-950/10' : 'hover:bg-gray-50/50 dark:hover:bg-[#1E3553]/20'
              }`}
            >
              <div className="flex items-start space-x-3.5">
                <div className="p-2.5 rounded-2xl bg-gray-50 dark:bg-[#0B1522] border border-gray-100 dark:border-[#1E3553] flex-shrink-0">
                  {getIcon(item.type)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-bold text-[#142B45] dark:text-white">
                      {item.title}
                    </h4>
                    {item.statusBadge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                        {item.statusBadge}
                      </span>
                    )}
                    {!item.isRead && (
                      <span className="w-2 h-2 rounded-full bg-[#16A36A]" />
                    )}
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed max-w-2xl">
                    {item.description}
                  </p>

                  <div className="flex items-center space-x-3 text-[10px] text-gray-400 mt-2">
                    <span>{new Date(item.timestamp).toLocaleString()}</span>
                    <span>•</span>
                    <span>{item.isShared ? 'Shared Family Alert' : 'Personal Confidential'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                {item.actionUrl && (
                  <button
                    onClick={() => onNavigate(item.actionUrl!.replace('/', ''))}
                    className="p-1.5 rounded-xl text-gray-400 hover:text-[#16A36A] hover:bg-gray-100 dark:hover:bg-[#1E3553] transition"
                    title="Open Related View"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
                {!item.isRead && (
                  <button
                    onClick={() => markAsRead(item.id)}
                    className="p-1.5 rounded-xl text-gray-400 hover:text-emerald-600 hover:bg-gray-100 dark:hover:bg-[#1E3553] transition"
                    title="Mark as Read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center text-gray-400">
            <Bell className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <h4 className="text-sm font-bold text-[#142B45] dark:text-white">No notifications in this category</h4>
            <p className="text-xs mt-1">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
};

