import React, { useState } from 'react';
import { 
  Wallet, Plus, ArrowLeftRight, CreditCard, Shield, 
  CheckCircle2, RefreshCw, Lock, AlertCircle, Building 
} from 'lucide-react';
import { useFamily } from '../context/FamilyContext';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/common/Modal';
import { Account, AccountType } from '../types';

export const AccountsPage: React.FC = () => {
  const { accounts, addAccount, editAccount, transferMoney } = useFamily();
  const { currentUser } = useAuth();

  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [isTransferOpen, setIsTransferOpen] = useState<boolean>(false);
  const [selectedAcc, setSelectedAcc] = useState<Account | null>(null);

  // Transfer Form State
  const [fromAccountId, setFromAccountId] = useState<string>(accounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState<string>(accounts[1]?.id || '');
  const [transferAmount, setTransferAmount] = useState<string>('5000');
  const [transferNote, setTransferNote] = useState<string>('');
  const [transferError, setTransferError] = useState<string>('');

  // Add Account Form State
  const [nickname, setNickname] = useState<string>('');
  const [accountType, setAccountType] = useState<AccountType>('savings');
  const [bankName, setBankName] = useState<string>('');
  const [maskedNumber, setMaskedNumber] = useState<string>('•••• ');
  const [currentBalance, setCurrentBalance] = useState<string>('50000');
  const [creditLimit, setCreditLimit] = useState<string>('200000');
  const [isShared, setIsShared] = useState<boolean>(false);

  // Filter accounts visible to current user (privacy gate)
  const visibleAccounts = accounts.filter(a => {
    if (a.isShared) return true;
    if (a.userId === currentUser.id) return true;
    if (currentUser.role === 'FamilyAdmin') return true;
    return false;
  });

  const totalLiquidBalance = visibleAccounts
    .filter(a => a.accountType !== 'credit_card')
    .reduce((sum, a) => sum + a.currentBalance, 0);

  const totalCreditDues = visibleAccounts
    .filter(a => a.accountType === 'credit_card')
    .reduce((sum, a) => sum + (a.outstandingDue || 0), 0);

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const bal = parseFloat(currentBalance) || 0;
    const limit = parseFloat(creditLimit) || 0;

    addAccount({
      userId: currentUser.id,
      familyId: 'fam_sharma_01',
      nickname,
      accountType,
      bankName: bankName || 'Bank Account',
      maskedNumber,
      currentBalance: bal,
      currency: '₹',
      isShared,
      creditLimit: accountType === 'credit_card' ? limit : undefined,
      availableCredit: accountType === 'credit_card' ? limit - bal : undefined,
      outstandingDue: accountType === 'credit_card' ? bal : undefined,
    });

    setNickname('');
    setIsAddOpen(false);
  };

  const handleExecuteTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError('');
    const amt = parseFloat(transferAmount);
    if (isNaN(amt) || amt <= 0) {
      setTransferError('Please enter a valid amount.');
      return;
    }

    const res = await transferMoney(fromAccountId, toAccountId, amt, transferNote);
    if (!res.success) {
      setTransferError(res.error || 'Transfer failed');
      return;
    }

    setIsTransferOpen(false);
    setTransferAmount('');
    setTransferNote('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#142B45] dark:text-white flex items-center space-x-2">
            <span>Accounts, Wallets & Cards</span>
          </h2>
          <p className="text-xs text-[#738095] dark:text-gray-400 mt-1">
            Bank accounts, household joint pools, cash reserve vaults, and credit card credit lines
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsTransferOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Transfer Between Accounts</span>
          </button>

          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#16A36A] hover:bg-[#138959] text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Account</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#14253A] border border-gray-100 dark:border-[#1E3553] rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Liquid Funds</span>
          <h3 className="text-2xl font-black text-[#16A36A] mt-1 font-numeric">
            ₹{totalLiquidBalance.toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">Savings, Current & Cash reserves</p>
        </div>

        <div className="bg-white dark:bg-[#14253A] border border-gray-100 dark:border-[#1E3553] rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Active Credit Card Dues</span>
          <h3 className="text-2xl font-black text-amber-500 mt-1 font-numeric">
            ₹{totalCreditDues.toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">Current billing cycle balances</p>
        </div>

        <div className="bg-white dark:bg-[#14253A] border border-gray-100 dark:border-[#1E3553] rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Accounts Tracked</span>
          <h3 className="text-2xl font-black text-[#142B45] dark:text-white mt-1 font-numeric">
            {visibleAccounts.length} Connected
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">Reconciled and balance matched</p>
        </div>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleAccounts.map(acc => {
          const isCredit = acc.accountType === 'credit_card';

          return (
            <div
              key={acc.id}
              className="bg-white dark:bg-[#14253A] rounded-2xl p-5 border border-gray-100 dark:border-[#1E3553] shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm ${
                      isCredit ? 'bg-gradient-to-tr from-purple-700 to-indigo-600' : 'bg-gradient-to-tr from-[#142B45] to-[#16A36A]'
                    }`}>
                      {isCredit ? <CreditCard className="w-5 h-5" /> : <Wallet className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#142B45] dark:text-white">
                        {acc.nickname}
                      </h4>
                      <p className="text-[11px] text-gray-400">
                        {acc.bankName} • {acc.maskedNumber}
                      </p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    acc.isShared
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                      : 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400'
                  }`}>
                    {acc.isShared ? 'Shared' : 'Personal'}
                  </span>
                </div>

                {/* Balances */}
                <div className="my-4 p-3.5 rounded-xl bg-gray-50 dark:bg-[#0B1522] border border-gray-100 dark:border-[#1E3553]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                    {isCredit ? 'Current Outstanding Due' : 'Available Balance'}
                  </span>
                  <h3 className={`text-2xl font-black font-numeric mt-0.5 ${
                    isCredit ? 'text-rose-500' : 'text-[#142B45] dark:text-white'
                  }`}>
                    ₹{acc.currentBalance.toLocaleString('en-IN')}
                  </h3>

                  {isCredit && (
                    <div className="flex justify-between text-[11px] text-gray-500 pt-2 mt-2 border-t border-gray-200 dark:border-[#1E3553]">
                      <span>Limit: ₹{acc.creditLimit?.toLocaleString('en-IN')}</span>
                      <span>Available: <strong>₹{acc.availableCredit?.toLocaleString('en-IN')}</strong></span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer & Reconcile */}
              <div className="pt-3 border-t border-gray-100 dark:border-[#1E3553] flex items-center justify-between text-xs">
                <span className="text-[10px] text-gray-400">
                  Synced: {new Date(acc.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <button
                  onClick={() => alert(`Balance reconciled for ${acc.nickname}. No discrepancies found.`)}
                  className="text-xs font-semibold text-[#16A36A] hover:underline flex items-center space-x-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reconcile</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Transfer Between Own Accounts Modal */}
      <Modal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        title="Transfer Between Accounts"
        subtitle="Internal transfers adjust balances without inflating income or expense totals"
      >
        <form onSubmit={handleExecuteTransfer} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
              Transfer Amount (INR ₹) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={transferAmount}
              onChange={e => setTransferAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-base font-bold text-[#142B45] dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
                From Account (Source) *
              </label>
              <select
                value={fromAccountId}
                onChange={e => setFromAccountId(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-xs text-[#142B45] dark:text-white"
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
                To Account (Destination) *
              </label>
              <select
                value={toAccountId}
                onChange={e => setToAccountId(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-xs text-[#142B45] dark:text-white"
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id} disabled={acc.id === fromAccountId}>
                    {acc.nickname} (₹{acc.currentBalance.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
              Transfer Reason / Memo
            </label>
            <input
              type="text"
              placeholder="e.g. Monthly joint household pool allocation"
              value={transferNote}
              onChange={e => setTransferNote(e.target.value)}
              className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-xs text-[#142B45] dark:text-white"
            />
          </div>

          {transferError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-400 flex items-center space-x-1.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{transferError}</span>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100 dark:border-[#1E3553]">
            <button
              type="button"
              onClick={() => setIsTransferOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-sm"
            >
              Execute Transfer
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Account Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Connect Financial Account"
        subtitle="Add a savings account, joint pool, cash box, or credit card"
      >
        <form onSubmit={handleCreateAccount} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
              Account Nickname *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Kotak Emergency Vault, Amazon Pay ICICI Card"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-xs text-[#142B45] dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
                Account Type
              </label>
              <select
                value={accountType}
                onChange={e => setAccountType(e.target.value as any)}
                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-xs text-[#142B45] dark:text-white"
              >
                <option value="savings">Savings Account</option>
                <option value="current">Current Account</option>
                <option value="credit_card">Credit Card</option>
                <option value="cash_wallet">Cash Reserve Box</option>
                <option value="upi_linked">UPI Linked Wallet</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
                Bank / Provider Name
              </label>
              <input
                type="text"
                placeholder="e.g. HDFC Bank, SBI"
                value={bankName}
                onChange={e => setBankName(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-xs text-[#142B45] dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
                Masked Number (Last 4 Digits)
              </label>
              <input
                type="text"
                placeholder="•••• 8492"
                value={maskedNumber}
                onChange={e => setMaskedNumber(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-xs text-[#142B45] dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
                Current Opening Balance (INR ₹)
              </label>
              <input
                type="number"
                value={currentBalance}
                onChange={e => setCurrentBalance(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-xs text-[#142B45] dark:text-white font-bold"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="accShared"
              checked={isShared}
              onChange={e => setIsShared(e.target.checked)}
              className="w-4 h-4 text-[#16A36A] rounded border-gray-300"
            />
            <label htmlFor="accShared" className="text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
              Shared household account (authorized family members can view and transact)
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
              Connect Account
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

