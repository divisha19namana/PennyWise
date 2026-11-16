import React, { useState } from 'react';
import { 
  PieChart, AlertTriangle, CheckCircle2, TrendingUp, 
  Sparkles, ArrowRight, Copy, Settings, Plus, Edit2 
} from 'lucide-react';
import { useFamily } from '../context/FamilyContext';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/common/Modal';
import { BudgetCategory } from '../types';

export const BudgetPage: React.FC = () => {
  const { budget, updateBudgetLimit, transactions } = useFamily();
  const { currentUser } = useAuth();

  const [selectedMonth, setSelectedMonth] = useState<string>('2026-11');
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [selectedCat, setSelectedCat] = useState<BudgetCategory | null>(null);
  const [newLimit, setNewLimit] = useState<string>('');

  // Eligible completed expense calculations
  const totalBudget = budget.totalBudget;
  const totalSpent = budget.categories.reduce((sum, c) => sum + c.spent, 0);
  const remainingBudget = Math.max(0, totalBudget - totalSpent);
  const utilization = Math.round((totalSpent / totalBudget) * 100);

  // Projected month-end spending based on run rate (12 days elapsed out of 30)
  const daysElapsed = 12;
  const daysInMonth = 30;
  const dailyRunRate = totalSpent / daysElapsed;
  const projectedMonthEnd = Math.round(dailyRunRate * daysInMonth);

  const handleOpenEdit = (cat: BudgetCategory) => {
    setSelectedCat(cat);
    setNewLimit(cat.budgetLimit.toString());
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCat) return;
    const limitNum = parseFloat(newLimit);
    if (!isNaN(limitNum) && limitNum >= 0) {
      updateBudgetLimit(selectedCat.categoryId, limitNum);
      setIsEditModalOpen(false);
    }
  };

  const getThresholdStatus = (spent: number, limit: number) => {
    if (limit <= 0) return { label: 'No Limit', color: 'text-gray-400', barColor: 'bg-gray-300' };
    const pct = (spent / limit) * 100;
    if (pct > 100) return { label: `Exceeded by ₹${(spent - limit).toLocaleString('en-IN')}`, color: 'text-rose-600', barColor: 'bg-rose-600', alert: true };
    if (pct >= 90) return { label: '90% Warning! Limit Approaching', color: 'text-rose-500', barColor: 'bg-rose-500', alert: true };
    if (pct >= 80) return { label: '80% Alert: Approaching Limit', color: 'text-amber-600', barColor: 'bg-amber-500' };
    if (pct >= 75) return { label: '75% Used: Watch spending', color: 'text-amber-500', barColor: 'bg-amber-400' };
    if (pct >= 50) return { label: '50% Mid-month consumption', color: 'text-blue-500', barColor: 'bg-blue-500' };
    return { label: 'Healthy Trajectory', color: 'text-[#16A36A]', barColor: 'bg-[#16A36A]' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#142B45] dark:text-white">
            Monthly Household Budget
          </h2>
          <p className="text-xs text-[#738095] dark:text-gray-400 mt-1">
            Dynamic threshold tracking and run-rate projections for family expense categories
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="px-3.5 py-2 bg-white dark:bg-[#14253A] border border-gray-200 dark:border-[#1E3553] rounded-xl text-xs font-bold text-[#142B45] dark:text-white"
          >
            <option value="2026-11">November 2026 (Active)</option>
            <option value="2026-10">October 2026</option>
            <option value="2026-09">September 2026</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-[#14253A] border border-gray-100 dark:border-[#1E3553] rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Budget Limit</span>
          <h3 className="text-xl font-extrabold text-[#142B45] dark:text-white mt-1 font-numeric">
            ₹{totalBudget.toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">Approved family pool</p>
        </div>

        <div className="bg-white dark:bg-[#14253A] border border-gray-100 dark:border-[#1E3553] rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Spent to Date</span>
          <h3 className="text-xl font-extrabold text-rose-500 mt-1 font-numeric">
            ₹{totalSpent.toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">{utilization}% of limit utilized</p>
        </div>

        <div className="bg-white dark:bg-[#14253A] border border-gray-100 dark:border-[#1E3553] rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Remaining Budget</span>
          <h3 className="text-xl font-extrabold text-[#16A36A] mt-1 font-numeric">
            ₹{remainingBudget.toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">For remaining 18 days</p>
        </div>

        <div className="bg-white dark:bg-[#14253A] border border-gray-100 dark:border-[#1E3553] rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Run-Rate Projection</span>
          <h3 className={`text-xl font-extrabold mt-1 font-numeric ${projectedMonthEnd > totalBudget ? 'text-amber-500' : 'text-[#142B45] dark:text-white'}`}>
            ₹{projectedMonthEnd.toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {projectedMonthEnd > totalBudget ? 'At risk of overspending' : 'Comfortably within limit'}
          </p>
        </div>

        <div className="bg-white dark:bg-[#14253A] border border-gray-100 dark:border-[#1E3553] rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Daily Safe Allowance</span>
          <h3 className="text-xl font-extrabold text-blue-600 dark:text-blue-400 mt-1 font-numeric">
            ₹{Math.round(remainingBudget / (daysInMonth - daysElapsed)).toLocaleString('en-IN')}/day
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">Target spend speed</p>
        </div>
      </div>

      {/* AI Budget Intelligence Banner */}
      <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-4 flex items-start space-x-3 text-xs text-emerald-900 dark:text-emerald-300">
        <Sparkles className="w-5 h-5 text-[#16A36A] flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block">AI Budget Recommendations for November:</span>
          <p className="mt-0.5 text-gray-600 dark:text-gray-300 leading-relaxed">
            Food & Dining Out is tracking at <strong>92.5%</strong> with ₹900 remaining. We suggest allocating ₹1,500 from the Healthcare surplus (which is ₹4,600 below budget) or opting into the No-Takeout sprint.
          </p>
        </div>
      </div>

      {/* Category Budget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {budget.categories.map(cat => {
          const pct = Math.round((cat.spent / (cat.budgetLimit || 1)) * 100);
          const remaining = Math.max(0, cat.budgetLimit - cat.spent);
          const status = getThresholdStatus(cat.spent, cat.budgetLimit);

          return (
            <div
              key={cat.categoryId}
              className={`bg-white dark:bg-[#14253A] rounded-2xl p-5 border shadow-sm transition ${
                status.alert ? 'border-amber-300 dark:border-amber-700/60 ring-1 ring-amber-400/30' : 'border-gray-100 dark:border-[#1E3553]'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2.5">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-sm"
                    style={{ backgroundColor: cat.color }}
                  >
                    {cat.categoryName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#142B45] dark:text-white truncate">
                      {cat.categoryName}
                    </h4>
                    <span className={`text-[10px] font-bold ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                </div>

                {currentUser.permissions.canEditFamilyBudget && (
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="p-1 text-gray-400 hover:text-emerald-600 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1E3553]"
                    title="Edit Category Budget"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Progress bar */}
              <div className="space-y-1 my-3">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-gray-500 font-numeric">
                    Spent: ₹{cat.spent.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[#142B45] dark:text-white font-numeric">
                    {pct}% of ₹{cat.budgetLimit.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-[#0B1522] h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${status.barColor}`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>
              </div>

              {/* Comparison details */}
              <div className="flex items-center justify-between text-[11px] text-gray-500 pt-2 border-t border-gray-100 dark:border-[#1E3553]">
                <span>Remaining: <strong>₹{remaining.toLocaleString('en-IN')}</strong></span>
                <span>Last Month: ₹{cat.previousMonthSpent.toLocaleString('en-IN')}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Budget Modal */}
      {selectedCat && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Adjust Budget for ${selectedCat.categoryName}`}
          subtitle="Modifying limit recalculates family alert thresholds immediately"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
                New Monthly Limit (INR ₹)
              </label>
              <input
                type="number"
                required
                value={newLimit}
                onChange={e => setNewLimit(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-base font-bold text-[#142B45] dark:text-white"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100 dark:border-[#1E3553]">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#16A36A] text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Apply Limit
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

