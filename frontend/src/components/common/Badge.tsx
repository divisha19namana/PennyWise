import React from 'react';
import { FamilyRole, TransactionStatus } from '../../types';

interface RoleBadgeProps {
  role: FamilyRole;
  size?: 'sm' | 'md';
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, size = 'md' }) => {
  const configs: Record<FamilyRole, { label: string; bg: string; text: string; border: string }> = {
    FamilyAdmin: {
      label: 'Family Admin',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-800',
    },
    FinanceManager: {
      label: 'Finance Manager',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      text: 'text-blue-700 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800',
    },
    AdultMember: {
      label: 'Adult Member',
      bg: 'bg-purple-50 dark:bg-purple-950/40',
      text: 'text-purple-700 dark:text-purple-400',
      border: 'border-purple-200 dark:border-purple-800',
    },
    Dependent: {
      label: 'Dependent',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-800',
    },
  };

  const config = configs[role] || configs.AdultMember;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span className={`inline-flex items-center rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
      {config.label}
    </span>
  );
};

interface StatusBadgeProps {
  status: TransactionStatus | 'active' | 'closed' | 'paused' | 'upcoming' | 'overdue' | 'confirmed' | 'rejected';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let bg = 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200';

  if (status === 'completed' || status === 'active' || status === 'confirmed') {
    bg = 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
  } else if (status === 'pending' || status === 'upcoming') {
    bg = 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
  } else if (status === 'failed' || status === 'overdue' || status === 'rejected') {
    bg = 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800';
  } else if (status === 'reversed' || status === 'paused' || status === 'closed') {
    bg = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700';
  }

  const label = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${bg}`}>
      {label}
    </span>
  );
};

