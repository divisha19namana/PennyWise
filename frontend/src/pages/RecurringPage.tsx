import React, { useState } from 'react';
import { 
  RefreshCw, Plus, Calendar, AlertTriangle, CheckCircle2, 
  Tv, Wifi, Dumbbell, Shield, TrendingUp, Pause, Play 
} from 'lucide-react';
import { useFamily } from '../context/FamilyContext';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/common/Modal';
import { RecurringPayment } from '../types';

export const RecurringPage: React.FC = () => {
  const { recurringPayments, addRecurringPayment, toggleRecurringStatus, accounts } = useFamily();
  const { currentUser } = useAuth();

  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [frequency, setFrequency] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [category, setCategory] = useState<string>('Entertainment & OTT');
  const [accountId, setAccountId] = useState<string>(accounts[0]?.id || '');
  const [nextDueDate, setNextDueDate] = useState<string>('2026-11-25');
  const [isShared, setIsShared] = useState<boolean>(true);

  const activeSubscriptions = recurringPayments.filter(r => r.status === 'active');
  const monthlyTotal = activeSubscriptions.reduce((sum, r) => sum + r.amount, 0);

  const handleSaveRecurring = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmt = parseFloat(amount);
    if (isNaN(numAmt) || numAmt <= 0) return;

    const acc = accounts.find(a => a.id === accountId);

    addRecurringPayment({
      name,
      amount: numAmt,
      frequency,
      category,
      accountId,
      accountNickname: acc?.nickname || 'Primary Account',
      nextDueDate,
      isShared,
      status: 'active',
      ownerName: currentUser.name,
    });

    setName('');
    setAmount('');
    setIsAddOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#142B45] dark:text-white flex items-center space-x-2">
            <span>Recurring Subscriptions & Fixed Bills</span>
          </h2>
          <p className="text-xs text-[#738095] dark:text-gray-400 mt-1">
            Detect repeating charges, audit price increases, and prevent unwanted auto-renewals
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2 bg-[#16A36A] hover:bg-[#138959] text-white rounded-xl text-xs font-bold transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Recurring Bill</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#14253A] border border-gray-100 dark:border-[#1E3553] rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Monthly Commitments</span>
          <h3 className="text-2xl font-black text-rose-500 mt-1 font-numeric">
            ₹{monthlyTotal.toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">Recurring baseline across household</p>
        </div>

        <div className="bg-white dark:bg-[#14253A] border border-gray-100 dark:border-[#1E3553] rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Active Subscriptions</span>
          <h3 className="text-2xl font-black text-[#142B45] dark:text-white mt-1 font-numeric">
            {activeSubscriptions.length} Active
          </h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Zero zombie subscriptions</p>
        </div>

        <div className="bg-white dark:bg-[#14253A] border border-gray-100 dark:border-[#1E3553] rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Upcoming Next Renewal</span>
          <h3 className="text-2xl font-black text-amber-500 mt-1">
            18 Nov 2026
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">Tata Play Fiber (₹1,416)</p>
        </div>
      </div>

      {/* Recurring Cards Grid */}
      {recurringPayments.length === 0 ? (
        <div className="bg-white dark:bg-[#14253A] rounded-2xl p-10 text-center text-gray-400 border border-gray-100 dark:border-[#1E3553]">
          <RefreshCw className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
          <h4 className="font-bold text-sm text-[#142B45] dark:text-white">No Recurring Subscriptions Added</h4>
          <p className="text-xs mt-1 max-w-md mx-auto text-[#738095] dark:text-gray-400">
            e.g. Click <strong>"Add Recurring Bill"</strong> above to track fixed bills like Netflix (₹649/mo), Fiber Broadband (₹1,416/mo), Gym, or Maid wages.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recurringPayments.map(item => (
          <div
            key={item.id}
            className="bg-white dark:bg-[#14253A] rounded-2xl p-5 border border-gray-100 dark:border-[#1E3553] shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-bold text-[#142B45] dark:text-white">
                      {item.name}
                    </h4>
                    {item.priceChanged && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700">
                        Price Raised
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {item.category} • {item.accountNickname}
                  </p>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  item.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                }`}>
                  {item.status.toUpperCase()}
                </span>
              </div>

              <div className="my-3 p-3 rounded-xl bg-gray-50 dark:bg-[#0B1522] border border-gray-100 dark:border-[#1E3553] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-gray-400 block uppercase font-bold">Billing Frequency</span>
                  <span className="font-semibold text-gray-700 dark:text-gray-300 capitalize">{item.frequency}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 block uppercase font-bold">Amount</span>
                  <span className="font-extrabold text-[#142B45] dark:text-white font-numeric text-base">
                    ₹{item.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-gray-500">
                Next scheduled date: <strong>{item.nextDueDate}</strong> (Managed by {item.ownerName})
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-[#1E3553] flex items-center justify-between text-xs">
              <button
                onClick={() => toggleRecurringStatus(item.id)}
                className="text-xs font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-white flex items-center space-x-1"
              >
                {item.status === 'active' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{item.status === 'active' ? 'Pause Auto-Renew' : 'Resume'}</span>
              </button>

              <span className="text-[10px] text-gray-400">
                {item.isShared ? 'Shared Household' : 'Personal'}
              </span>
            </div>
          </div>
        ))}
      </div>
    )}

      {/* Add Recurring Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Schedule Recurring Subscription or Bill"
      >
        <form onSubmit={handleSaveRecurring} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
              Subscription or Service Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. JioFiber, Spotify Family, Cult.fit"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-xs text-[#142B45] dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
                Amount (INR ₹) *
              </label>
              <input
                type="number"
                required
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-xs text-[#142B45] dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
                Frequency
              </label>
              <select
                value={frequency}
                onChange={e => setFrequency(e.target.value as any)}
                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-xs text-[#142B45] dark:text-white"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
                Payment Account
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
                Next Renewal Date
              </label>
              <input
                type="date"
                value={nextDueDate}
                onChange={e => setNextDueDate(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-xs text-[#142B45] dark:text-white"
              />
            </div>
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
              Save Subscription
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

