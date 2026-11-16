import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  onClick?: () => void;
  badge?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-[#16A36A]',
  iconBg = 'bg-[#16A36A]/10',
  trend,
  onClick,
  badge,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-[#14253A] border border-gray-100 dark:border-[#1E3553] rounded-2xl p-5 shadow-sm hover:shadow-md transition duration-200 ${
        onClick ? 'cursor-pointer hover:border-[#16A36A]/40' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium uppercase tracking-wider text-[#738095] dark:text-gray-400">
              {title}
            </span>
            {badge && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                {badge}
              </span>
            )}
          </div>
          <h3 className="text-2xl font-bold text-[#142B45] dark:text-white mt-1.5 font-numeric tracking-tight">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-[#738095] dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
          {trend && (
            <div className="flex items-center space-x-1.5 mt-2">
              <span
                className={`text-xs font-semibold ${
                  trend.isPositive ? 'text-[#16A36A]' : 'text-rose-500'
                }`}
              >
                {trend.value}
              </span>
              {trend.label && (
                <span className="text-xs text-[#738095] dark:text-gray-400">
                  {trend.label}
                </span>
              )}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${iconBg} ${iconColor} flex-shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

