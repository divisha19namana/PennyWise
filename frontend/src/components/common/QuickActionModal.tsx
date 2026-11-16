import React, { useState } from 'react';
import { Modal } from './Modal';
import { useFamily } from '../../context/FamilyContext';
import { useAuth } from '../../context/AuthContext';
import { ArrowDownRight, ArrowUpRight, ArrowLeftRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { TransactionType } from '../../types';

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: TransactionType;
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'expense',
}) => {
  const { accounts, categories, addTransaction, transferMoney } = useFamily();
  const { currentUser } = useAuth();

  const [type, setType] = useState<TransactionType>(defaultType);
  const [amount, setAmount] = useState<string>('');
  const [merchant, setMerchant] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [accountId, setAccountId] = useState<string>(accounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState<string>(accounts[1]?.id || '');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isShared, setIsShared] = useState<boolean>(true);
  const [paymentMethod, setPaymentMethod] = useState<string>('UPI');
  const [notes, setNotes] = useState<string>('');
  
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const filteredCategories = categories.filter(c => c.type === (type === 'income' ? 'income' : 'expense'));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setWarnings([]);
    setIsSubmitting(true);

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setErrors(['Please enter a valid amount greater than zero.']);
      setIsSubmitting(false);
      return;
    }

    if (type === 'transfer') {
      const res = await transferMoney(accountId, toAccountId, numericAmount, notes || description);
      if (!res.success) {
        setErrors([res.error || 'Transfer failed']);
        setIsSubmitting(false);
        return;
      }
      resetAndClose();
      return;
    }

    const selectedCategory = categories.find(c => c.id === categoryId);
    const res = await addTransaction({
      type,
      amount: numericAmount,
      merchant: merchant || (type === 'income' ? 'Direct Income' : 'Expense Payment'),
      categoryId: selectedCategory?.id || filteredCategories[0]?.id,
      category: selectedCategory?.name || filteredCategories[0]?.name,
      accountId,
      description,
      date: new Date(date).toISOString(),
      isShared,
      paymentMethod,
      notes,
      userId: currentUser.id,
      userName: currentUser.name,
      status: 'completed',
    });

    if (!res.success) {
      setErrors(res.validation.errors);
      setWarnings(res.validation.warnings);
      setIsSubmitting(false);
      return;
    }

    resetAndClose();
  };

  const resetAndClose = () => {
    setAmount('');
    setMerchant('');
    setDescription('');
    setNotes('');
    setErrors([]);
    setWarnings([]);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Quick Financial Action"
      subtitle="Log a family or personal transaction with real-time balance reconciliation"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 dark:bg-[#1E3553] rounded-xl">
          <button
            type="button"
            onClick={() => { setType('expense'); setCategoryId(''); }}
            className={`flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-semibold transition ${
              type === 'expense'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
            }`}
          >
            <ArrowDownRight className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
          <button
            type="button"
            onClick={() => { setType('income'); setCategoryId(''); }}
            className={`flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-semibold transition ${
              type === 'income'
                ? 'bg-[#16A36A] text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Add Income</span>
          </button>
          <button
            type="button"
            onClick={() => setType('transfer')}
            className={`flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-semibold transition ${
              type === 'transfer'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>Transfer Money</span>
          </button>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
            Amount (INR ₹) *
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">
              ₹
            </span>
            <input
              type="number"
              step="0.01"
              required
              placeholder="e.g. 2,450 or 50,000"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-lg font-bold text-[#142B45] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#16A36A]"
            />
          </div>
        </div>

        {type !== 'transfer' ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Merchant / Source */}
              <div>
                <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
                  {type === 'expense' ? 'Merchant / Recipient *' : 'Income Source *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={type === 'expense' ? 'e.g. Nature Basket, Swiggy, Netflix' : 'e.g. Monthly Salary, Freelance Client'}
                  value={merchant}
                  onChange={e => setMerchant(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-sm text-[#142B45] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#16A36A]"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
                  Category *
                </label>
                <select
                  required
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-sm text-[#142B45] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#16A36A]"
                >
                  <option value="">Select Category</option>
                  {filteredCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Account */}
              <div>
                <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
                  Account / Wallet *
                </label>
                <select
                  required
                  value={accountId}
                  onChange={e => setAccountId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-sm text-[#142B45] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#16A36A]"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.nickname} ({acc.maskedNumber}) - ₹{acc.currentBalance.toLocaleString('en-IN')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-sm text-[#142B45] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#16A36A]"
                >
                  <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="NetBanking">NetBanking / IMPS / NEFT</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>
            </div>
          </>
        ) : (
          /* Transfer Details */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
                Source Account (From) *
              </label>
              <select
                required
                value={accountId}
                onChange={e => setAccountId(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-sm text-[#142B45] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#16A36A]"
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.nickname} (₹{acc.currentBalance.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
                Destination Account (To) *
              </label>
              <select
                required
                value={toAccountId}
                onChange={e => setToAccountId(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-sm text-[#142B45] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#16A36A]"
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id} disabled={acc.id === accountId}>
                    {acc.nickname} (₹{acc.currentBalance.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Date and Privacy / Sharing Option */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
              Transaction Date
            </label>
            <input
              type="date"
              value={date}
              max={new Date().toISOString().split('T')[0]}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-sm text-[#142B45] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#16A36A]"
            />
          </div>

          {type !== 'transfer' && (
            <div>
              <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
                Family Sharing Preference
              </label>
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="isShared"
                  checked={isShared}
                  onChange={e => setIsShared(e.target.checked)}
                  className="w-4 h-4 text-[#16A36A] rounded border-gray-300 focus:ring-[#16A36A]"
                />
                <label htmlFor="isShared" className="text-xs text-[#738095] dark:text-gray-300 cursor-pointer">
                  Share with family (counts towards family budget)
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Description / Notes */}
        <div>
          <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
            Notes / Description (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Weekly groceries, quarterly broadband bill, or IMPS reference"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-sm text-[#142B45] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#16A36A]"
          />
        </div>

        {/* Validation Errors & Warnings */}
        {errors.length > 0 && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-400 space-y-1">
            {errors.map((err, idx) => (
              <div key={idx} className="flex items-center space-x-1.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{err}</span>
              </div>
            ))}
          </div>
        )}

        {warnings.length > 0 && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-400 space-y-1">
            {warnings.map((warn, idx) => (
              <div key={idx} className="flex items-center space-x-1.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{warn}</span>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100 dark:border-[#1E3553]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1E3553] transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold text-white shadow-sm transition flex items-center space-x-1.5 ${
              type === 'expense'
                ? 'bg-rose-600 hover:bg-rose-700'
                : type === 'income'
                ? 'bg-[#16A36A] hover:bg-[#138959]'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm & Record</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

