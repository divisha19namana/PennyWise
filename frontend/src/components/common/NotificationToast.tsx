import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const { activeToast, dismissToast } = useNotifications();

  if (!activeToast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-[#16A36A] flex-shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />,
  };

  const borders = {
    success: 'border-[#16A36A]/30',
    warning: 'border-amber-500/30',
    error: 'border-rose-500/30',
    info: 'border-blue-500/30',
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-bounce-short">
      <div className={`flex items-start justify-between p-4 bg-white dark:bg-[#14253A] rounded-2xl shadow-xl border ${borders[activeToast.type]} backdrop-blur-md`}>
        <div className="flex items-start space-x-3">
          {icons[activeToast.type]}
          <div>
            <h4 className="text-xs font-bold text-[#142B45] dark:text-white">
              {activeToast.title}
            </h4>
            <p className="text-xs text-[#738095] dark:text-gray-300 mt-0.5 leading-relaxed">
              {activeToast.message}
            </p>
          </div>
        </div>
        <button
          onClick={dismissToast}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
          aria-label="Dismiss toast"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

