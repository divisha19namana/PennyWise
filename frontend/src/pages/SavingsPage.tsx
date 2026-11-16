import React, { useState } from 'react';
import {
  Target, Plus, Sparkles, CheckCircle2, TrendingUp,
  Calendar, Users, ArrowUpRight, ArrowDownLeft, ShieldAlert,
  Plane, GraduationCap, Car, Home, Wallet
} from 'lucide-react';
import { useFamily } from '../context/FamilyContext';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/common/Modal';
import { GoalType, SavingsGoal } from '../types';

export const SavingsPage: React.FC = () => {
  const { savingsGoals, addSavingsGoal, addSavingsContribution, accounts } = useFamily();
  const { currentUser } = useAuth();

  const [isAddGoalOpen, setIsAddGoalOpen] = useState<boolean>(false);
  const [isContributeOpen, setIsContributeOpen] = useState<boolean>(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);

  // Add Goal Form State
  const [title, setTitle] = useState<string>('');
  const [type, setType] = useState<GoalType>('vacation');
  const [targetAmount, setTargetAmount] = useState<string>('500000');
  const [targetDate, setTargetDate] = useState<string>('2027-05-30');
  const [monthlyTarget, setMonthlyTarget] = useState<string>('15000');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('high');
  const [isShared, setIsShared] = useState<boolean>(true);

  // Contribute Form State
  const [contribAmount, setContribAmount] = useState<string>('10000');
  const [fromAccountId, setFromAccountId] = useState<string>(accounts[0]?.id || '');
  const [contribNote, setContribNote] = useState<string>('');

  const totalSaved = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const overallProgress = Math.round((totalSaved / (totalTarget || 1)) * 100);

  const handleOpenContribute = (goal: SavingsGoal) => {
    setSelectedGoal(goal);
    setContribAmount(goal.monthlyTarget ? goal.monthlyTarget.toString() : '5000');
    setIsContributeOpen(true);
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const targetNum = parseFloat(targetAmount);
    if (isNaN(targetNum) || targetNum <= 0) return;

    addSavingsGoal({
      familyId: 'fam_sharma_01',
      title,
      type,
      targetAmount: targetNum,
      targetDate,
      monthlyTarget: parseFloat(monthlyTarget) || 5000,
      priority,
      isShared,
      status: 'in_progress',
      icon: type === 'vacation' ? 'Plane' : type === 'emergency' ? 'ShieldAlert' : 'Target',
      color: type === 'vacation' ? '#0284C7' : type === 'emergency' ? '#16A36A' : '#8B5CF6',
    });

    setIsAddGoalOpen(false);
  };

  const handleSaveContribution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal) return;
    const amountNum = parseFloat(contribAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    addSavingsContribution(selectedGoal.id, amountNum, fromAccountId, contribNote);
    setIsContributeOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#142B45] dark:text-white flex items-center space-x-2">
            <span>Family Savings Goals</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[#16A36A] border border-emerald-500/20">
              Joint Aspirations
            </span>
          </h2>
          <p className="text-xs text-[#738095] dark:text-gray-400 mt-1">
            Pool family funds for vacations, emergency buffers, and education without distorting everyday living expense metrics
          </p>
        </div>

        <button
          onClick={() => setIsAddGoalOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2 bg-[#16A36A] hover:bg-[#138959] text-white rounded-xl text-xs font-bold transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Savings Goal</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#14253A] border border-gray-100 dark:border-[#1E3553] rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Accumulated Savings</span>
          <h3 className="text-2xl font-black text-[#16A36A] mt-1 font-numeric">
            ₹{totalSaved.toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">{overallProgress}% of aggregate ₹{totalTarget.toLocaleString('en-IN')} targets</p>
        </div>

        <div className="bg-white dark:bg-[#14253A] border border-gray-100 dark:border-[#1E3553] rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Active Goals</span>
          <h3 className="text-2xl font-black text-[#142B45] dark:text-white mt-1 font-numeric">
            {savingsGoals.filter(g => g.status === 'in_progress').length} In Progress
          </h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">All goals on schedule</p>
        </div>

        <div className="bg-white dark:bg-[#14253A] border border-gray-100 dark:border-[#1E3553] rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Monthly Savings Flow</span>
          <h3 className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1 font-numeric">
            ₹{savingsGoals.reduce((sum, g) => sum + g.monthlyTarget, 0).toLocaleString('en-IN')}/mo
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">Joint monthly allocation</p>
        </div>
      </div>

      {/* AI Feasibility Advisor */}
      <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-4 flex items-start space-x-3 text-xs text-emerald-900 dark:text-emerald-300">
        <Sparkles className="w-5 h-5 text-[#16A36A] flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block">AI Achievability Forecast:</span>
          <p className="mt-0.5 text-gray-600 dark:text-gray-300 leading-relaxed">
            At your current family joint savings rate of ₹70,000/month, the <strong>6-Month Emergency Fund</strong> (₹6,00,000) will be 100% completed by December 31, 2026. The <strong>Family EuroTrip</strong> is trending 2 months ahead of target date.
          </p>
        </div>
      </div>

      {/* Goals Cards Grid */}
      {savingsGoals.length === 0 ? (
        <div className="bg-white dark:bg-[#14253A] rounded-2xl p-10 text-center text-gray-400 border border-gray-100 dark:border-[#1E3553]">
          <Target className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
          <h4 className="font-bold text-sm text-[#142B45] dark:text-white">No Savings Goals Created Yet</h4>
          <p className="text-xs mt-1 max-w-md mx-auto text-[#738095] dark:text-gray-400">
            e.g. Click <strong>"New Savings Goal"</strong> above to set targets for an Emergency Safety Fund (e.g. ₹5,00,000), Annual Family Vacation (e.g. ₹2,50,000), or Child Education fund.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savingsGoals.map(goal => {
            const pct = Math.min(100, Math.round((goal.currentAmount / (goal.targetAmount || 1)) * 100));
            const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

            return (
              <div
                key={goal.id}
                className="bg-white dark:bg-[#14253A] rounded-2xl p-5 border border-gray-100 dark:border-[#1E3553] shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2.5">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
                        style={{ backgroundColor: goal.color }}
                      >
                        {goal.type === 'vacation' ? <Plane className="w-5 h-5" /> : goal.type === 'emergency' ? <ShieldAlert className="w-5 h-5" /> : <Target className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#142B45] dark:text-white">
                          {goal.title}
                        </h4>
                        <span className="text-[10px] text-gray-400">
                          Target Date: {goal.targetDate}
                        </span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${goal.priority === 'high' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                      {goal.priority.toUpperCase()}
                    </span>
                  </div>

                  {/* Progress */}
                  <div className="my-4 space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-gray-500 font-numeric">
                        ₹{goal.currentAmount.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[#142B45] dark:text-white font-numeric">
                        {pct}% of ₹{goal.targetAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-[#0B1522] h-2.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: goal.color }}
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 pt-0.5">
                      Remaining: <strong>₹{remaining.toLocaleString('en-IN')}</strong> • Target ₹{goal.monthlyTarget.toLocaleString('en-IN')}/mo
                    </p>
                  </div>

                  {/* Contributors List */}
                  <div className="pt-2 border-t border-gray-100 dark:border-[#1E3553] text-[11px]">
                    <span className="text-gray-400 block mb-1.5 font-semibold">Recent Family Contributors:</span>
                    <div className="space-y-1">
                      {goal.contributions.slice(0, 2).map(c => (
                        <div key={c.id} className="flex justify-between text-gray-600 dark:text-gray-300">
                          <span>{c.userName}</span>
                          <span className="font-bold font-numeric text-emerald-600">+₹{c.amount.toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-5 pt-3 border-t border-gray-100 dark:border-[#1E3553] flex justify-end">
                  <button
                    onClick={() => handleOpenContribute(goal)}
                    className="w-full py-2 bg-[#16A36A] hover:bg-[#138959] text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Family Contribution</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Contribute Modal */}
      {selectedGoal && (
        <Modal
          isOpen={isContributeOpen}
          onClose={() => setIsContributeOpen(false)}
          title={`Add Contribution to "${selectedGoal.title}"`}
          subtitle="Funds will be allocated into the savings vault from your selected account"
        >
          <form onSubmit={handleSaveContribution} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
                Contribution Amount (INR ₹) *
              </label>
              <input
                type="number"
                required
                value={contribAmount}
                onChange={e => setContribAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-base font-bold text-[#142B45] dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
                Deduct from Account *
              </label>
              <select
                value={fromAccountId}
                onChange={e => setFromAccountId(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-xs text-[#142B45] dark:text-white"
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.nickname} (Bal: ₹{acc.currentBalance.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
                Note / Memo
              </label>
              <input
                type="text"
                placeholder="e.g. November monthly SIP"
                value={contribNote}
                onChange={e => setContribNote(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-xs text-[#142B45] dark:text-white"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100 dark:border-[#1E3553]">
              <button
                type="button"
                onClick={() => setIsContributeOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#16A36A] text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Deposit Contribution
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Goal Modal */}
      <Modal
        isOpen={isAddGoalOpen}
        onClose={() => setIsAddGoalOpen(false)}
        title="Create New Family Savings Goal"
      >
        <form onSubmit={handleSaveGoal} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
              Goal Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. New Electric SUV, Home Renovation"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-xs text-[#142B45] dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
                Goal Type
              </label>
              <select
                value={type}
                onChange={e => setType(e.target.value as any)}
                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-xs text-[#142B45] dark:text-white"
              >
                <option value="vacation">Family Vacation</option>
                <option value="emergency">Emergency Safety Fund</option>
                <option value="vehicle">New Vehicle</option>
                <option value="home">Home Purchase / Downpayment</option>
                <option value="education">Higher Education</option>
                <option value="custom">Custom Goal</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
                Target Amount (INR ₹) *
              </label>
              <input
                type="number"
                required
                value={targetAmount}
                onChange={e => setTargetAmount(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-xs text-[#142B45] dark:text-white font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
                Target Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={e => setTargetDate(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-xs text-[#142B45] dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
                Suggested Monthly Contribution
              </label>
              <input
                type="number"
                value={monthlyTarget}
                onChange={e => setMonthlyTarget(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-xs text-[#142B45] dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100 dark:border-[#1E3553]">
            <button
              type="button"
              onClick={() => setIsAddGoalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#16A36A] text-white rounded-xl text-xs font-bold shadow-sm"
            >
              Start Goal
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

