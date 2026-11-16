import React, { createContext, useContext, useState, useEffect } from 'react';
import { NotificationItem } from '../types';
import { INITIAL_NOTIFICATIONS } from '../data/seedData';

interface ToastAlert {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info' | 'error';
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  activeToast: ToastAlert | null;
  addNotification: (item: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismissToast: () => void;
  showToast: (title: string, message: string, type?: 'success' | 'warning' | 'info' | 'error') => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('pennywise_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [activeToast, setActiveToast] = useState<ToastAlert | null>(null);

  useEffect(() => {
    localStorage.setItem('pennywise_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const showToast = (title: string, message: string, type: 'success' | 'warning' | 'info' | 'error' = 'info') => {
    const id = `toast_${Date.now()}`;
    setActiveToast({ id, title, message, type });
    setTimeout(() => {
      setActiveToast(current => (current?.id === id ? null : current));
    }, 4500);
  };

  const dismissToast = () => {
    setActiveToast(null);
  };

  const addNotification = (item: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotif: NotificationItem = {
      ...item,
      id: `notif_${Date.now()}`,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    setNotifications(prev => [newNotif, ...prev]);

    // Show instant toast notification
    const toastType = item.type === 'budget_exceeded' ? 'error' : item.type === 'budget_warning' ? 'warning' : 'success';
    showToast(item.title, item.description, toastType);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      activeToast,
      addNotification,
      markAsRead,
      markAllAsRead,
      dismissToast,
      showToast,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
  return context;
};

