import React, { useState } from 'react';
import { 
  TrendingUp, Plus, Sparkles, CheckCircle2, Lock, 
  Calendar, Briefcase, Laptop, Store, Percent, Gift, 
  RotateCcw, ShieldCheck 
} from 'lucide-react';
import { useFamily } from '../context/FamilyContext';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/common/Modal';
import { Transaction } from '../types';

export const IncomePage: React.FC = () => {
  const { transactions, accounts, categories, addTransaction } = useFamily();
  const { currentUser } = useAuth();

  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [amount, setAmount] = useState<string>('');
  const [source, setSource] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('cat_salary');
  const [accountId, setAccountId] = useState<string>(accounts[0]?.id || '');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isShared, setIsShared] = useState<boolean>(false); // Private by default!
  const [frequency, setFrequency] = useState<string>('Monthly');
  const [notes, setNotes] = useState<string>('');

  // Privacy gate on income transactions:
  // Personal salary is visible ONLY to its owner unless explicitly shared or FamilyAdmin viewing own record
  const incomeTransactions = transactions.filter(t => {
    if (t.type !== 'income' || t.category === 'Internal Transfer') return false;
    if (t.isShared) return true;
    if (t.userId === currentUser.id) return true;
    return false;
  });

  const totalReceived = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
  const expectedMonthly = 210000; // Estimated baseline
  const expectedNextSalaryDate = '01 Dec 2026';

  const handleAddIncome = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    const cat = categories.find(c => c.id === categoryId);

    addTransaction({
      type: 'income',
      amount: numAmount,
      merchant: source || 'Income Credit',
      categoryId: cat?.id || 'cat_salary',
      category: cat?.name || 'Primary Salary',
      accountId,
      date: new Date(date).toISOString(),
      isShared,
      paymentMethod: 'Direct Deposit / Transfer',
      notes,
      userId: currentUser.id,
      userName: currentUser.name,
      status: 'completed',
    });

    setAmount('');
    setSource('');
    setNotes('');
    setIsAddOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#142B45] dark:text-white flex items-center space-x-2">
            <span>Income Management</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[#16A36A] border border-emerald-500/20">
              Private by Default
            </span>
          </h2>
          <p className="text-xs text-[#738095] dark:text-gray-400 mt-1">
            Track salaries, consulting gigs, returns and family income pools with strict privacy isolation
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2 bg-[#16A36A] hover:bg-[#138959] text-white rounded-xl text-xs font-bold transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Record Income</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#14253A] border border-gray-100 dark:border-[#1E3553] rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Inflow Received</span>
          <h3 className="text-2xl font-black text-[#16A36A] mt-1 font-numeric">
            +₹{totalReceived.toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">{incomeTransactions.length} verified income credits</p>
        </div>

        <div className="bg-white dark:bg-[#14253A] border border-gray-100 dark:border-[#1E3553] rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Expected Monthly Target</span>
          <h3 className="text-2xl font-black text-[#142B45] dark:text-white mt-1 font-numeric">
            ₹{expectedMonthly.toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-emerald-600 mt-0.5">100% of target received for Nov</p>
        </div>

        <div className="bg-white dark:bg-[#14253A] border border-gray-100 dark:border-[#1E3553] rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Predicted Next Salary</span>
          <h3 className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {expectedNextSalaryDate}
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">TechCorp monthly cycle</p>
        </div>

        <div className="bg-white dark:bg-[#14253A] border border-gray-100 dark:border-[#1E3553] rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Sharing Mode</span>
          <h3 className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
            Confidential
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">Salary hidden from other members</p>
        </div>
      </div>

      {/* AI Salary & Inflow Digest */}
      <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-4 flex items-start space-x-3 text-xs text-emerald-900 dark:text-emerald-300">
        <Sparkles className="w-5 h-5 text-[#16A36A] flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block">Smart Income Detection:</span>
          <p className="mt-0.5 text-gray-600 dark:text-gray-300 leading-relaxed">
            TechCorp Solutions salary was automatically detected and parsed from HDFC Bank SMS on Nov 1 with 99% confidence. It was protected under your private user ledger without sharing raw pay figures to dependent accounts.
          </p>
        </div>
      </div>

      {/* Income Ledger Table */}
      <div className="bg-white dark:bg-[#14253A] rounded-2xl border border-gray-100 dark:border-[#1E3553] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-[#1E3553] flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#142B45] dark:text-white">
            Authorized Income Ledger
          </h3>
          <span className="text-xs text-gray-400">
            Showing records visible to {currentUser.name}
          </span>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-[#1E3553]">
          {incomeTransactions.map(tx => (
            <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-[#1E3553]/30 transition text-xs">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-[#16A36A] flex items-center justify-center font-bold">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-[#142B45] dark:text-white text-sm">
                      {tx.merchant}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-[#0B1522] text-gray-600 dark:text-gray-300">
                      {tx.category}
                    </span>
                    {!tx.isShared && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center space-x-1">
                        <Lock className="w-2.5 h-2.5" />
                        <span>Private</span>
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Deposited into {tx.accountNickname} • {new Date(tx.date).toLocaleDateString()} • {tx.userName}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-base font-extrabold text-[#16A36A] font-numeric">
                  +₹{tx.amount.toLocaleString('en-IN')}
                </span>
                <span className="block text-[10px] text-gray-400">Completed</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Record Income Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Record Income Inflow"
        subtitle="Log salary, freelance pay, dividends or cashbacks"
      >
        <form onSubmit={handleAddIncome} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
              Amount Received (INR ₹) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-base font-bold text-[#142B45] dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
                Income Source *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Employer, Client"
                value={source}
                onChange={e => setSource(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-xs text-[#142B45] dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
                Category
              </label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-xs text-[#142B45] dark:text-white"
              >
                {categories.filter(c => c.type === 'income').map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
                Destination Account
              </label>
              <select
                value={accountId}
                onChange={e => setAccountId(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-xs text-[#142B45] dark:text-white"
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.nickname}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
                Date Received
              </label>
              <input
                type="date"
                value={date}
                max={new Date().toISOString().split('T')[0]}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-xs text-[#142B45] dark:text-white"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553]">
            <label className="flex items-center space-x-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={isShared}
                onChange={e => setIsShared(e.target.checked)}
                className="w-4 h-4 text-[#16A36A] rounded border-gray-300"
              />
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                Share this income with family summary (uncheck to keep strictly confidential)
              </span>
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100 dark:border-[#1E3553]">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#16A36A] text-white rounded-xl text-xs font-bold shadow-sm"
            >
              Confirm & Deposit
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

