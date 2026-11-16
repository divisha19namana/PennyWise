      import React, { useState, useMemo } from 'react';
import { 
  Plus, Download, Filter, Search, ArrowDownRight, 
  ArrowUpRight, ArrowLeftRight, Trash2, Edit3, Eye, 
  CheckCircle2, AlertCircle, FileText, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { useFamily } from '../context/FamilyContext';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { QuickActionModal } from '../components/common/QuickActionModal';
import { Transaction, TransactionType } from '../types';

export const TransactionsPage: React.FC = () => {
  const { transactions, accounts, categories, members, deleteTransaction, editTransaction } = useFamily();
  const { currentUser } = useAuth();

  // Filters state
  const [search, setSearch] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [memberFilter, setMemberFilter] = useState<string>('all');
  const [scopeFilter, setScopeFilter] = useState<string>('all'); // all / shared / personal
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals state
  const [isQuickActionOpen, setIsQuickActionOpen] = useState<boolean>(false);
  const [quickActionType, setQuickActionType] = useState<TransactionType>('expense');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null);

  // Edit form state
  const [editAmount, setEditAmount] = useState<string>('');
  const [editMerchant, setEditMerchant] = useState<string>('');
  const [editCategory, setEditCategory] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [editIsShared, setEditIsShared] = useState<boolean>(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Filtered transactions (with privacy enforcement)
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // 1. Privacy gate:
      // An ordinary member can only see shared transactions OR their own private transactions
      // (Unless other member opted into account sharing)
      if (!t.isShared && t.userId !== currentUser.id && currentUser.role !== 'FamilyAdmin') {
        const owner = members.find(m => m.userId === t.userId);
        if (!owner?.sharingSettings.shareAccounts) return false;
      }

      // 2. Search
      if (search) {
        const s = search.toLowerCase();
        const matchesMerchant = t.merchant.toLowerCase().includes(s);
        const matchesDesc = t.description?.toLowerCase().includes(s);
        const matchesCat = t.category.toLowerCase().includes(s);
        const matchesAccount = t.accountNickname.toLowerCase().includes(s);
        if (!matchesMerchant && !matchesDesc && !matchesCat && !matchesAccount) return false;
      }

      // 3. Type
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;

      // 4. Category
      if (categoryFilter !== 'all' && t.categoryId !== categoryFilter && t.category !== categoryFilter) return false;

      // 5. Account
      if (accountFilter !== 'all' && t.accountId !== accountFilter) return false;

      // 6. Member
      if (memberFilter !== 'all' && t.userId !== memberFilter) return false;

      // 7. Scope (shared vs personal)
      if (scopeFilter === 'shared' && !t.isShared) return false;
      if (scopeFilter === 'personal' && t.isShared) return false;

      // 8. Status
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;

      return true;
    });
  }, [transactions, search, typeFilter, categoryFilter, accountFilter, memberFilter, scopeFilter, statusFilter, currentUser, members]);

  // Summary Metrics calculated on filtered list
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income' && t.status === 'completed' && t.category !== 'Internal Transfer')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense' && t.status === 'completed' && t.category !== 'Internal Transfer')
    .reduce((sum, t) => sum + t.amount, 0);

  const netCashFlow = totalIncome - totalExpenses;

  // Paginated items
  const totalPages = Math.ceil(filteredTransactions.length / pageSize) || 1;
  const paginatedTransactions = filteredTransactions.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleOpenEdit = (tx: Transaction) => {
    setSelectedTx(tx);
    setEditAmount(tx.amount.toString());
    setEditMerchant(tx.merchant);
    setEditCategory(tx.category);
    setEditDescription(tx.description || '');
    setEditIsShared(tx.isShared);
    setIsEditOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTx) return;

    const numAmount = parseFloat(editAmount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    editTransaction(selectedTx.id, {
      amount: numAmount,
      merchant: editMerchant,
      category: editCategory,
      description: editDescription,
      isShared: editIsShared,
    });
    setIsEditOpen(false);
  };

  const handleConfirmDelete = () => {
    if (txToDelete) {
      deleteTransaction(txToDelete.id);
      setIsDeleteConfirmOpen(false);
      setTxToDelete(null);
    }
  };

  const handleExportCSV = () => {
    const headers = 'ID,Date,Merchant,Category,Account,Member,Type,Amount,Status,Shared,PaymentMethod\n';
    const rows = filteredTransactions.map(t => 
      `"${t.id}","${t.date}","${t.merchant}","${t.category}","${t.accountNickname}","${t.userName}","${t.type}","${t.amount}","${t.status}","${t.isShared ? 'Shared' : 'Personal'}","${t.paymentMethod}"`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pennywise_transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header and Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#142B45] dark:text-white">
            All Transactions
          </h2>
          <p className="text-xs text-[#738095] dark:text-gray-400 mt-1">
            Reconciled records with multi-level permissions and audit logging
          </p>
        </div>

        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          <button
            onClick={() => { setQuickActionType('expense'); setIsQuickActionOpen(true); }}
            className="flex items-center space-x-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Expense</span>
          </button>

          <button
            onClick={() => { setQuickActionType('income'); setIsQuickActionOpen(true); }}
            className="flex items-center space-x-1.5 px-3 py-2 bg-[#16A36A] hover:bg-[#138959] text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Income</span>
          </button>

          <button
            onClick={() => { setQuickActionType('transfer'); setIsQuickActionOpen(true); }}
            className="flex items-center space-x-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Transfer</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-2 bg-white dark:bg-[#14253A] border border-gray-200 dark:border-[#1E3553] text-[#142B45] dark:text-white rounded-xl text-xs font-semibold hover:bg-gray-50 dark:hover:bg-[#1E3553] transition"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#14253A] border border-gray-100 dark:border-[#1E3553] rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Income</span>
          <h3 className="text-xl font-extrabold text-[#16A36A] mt-1 font-numeric">
            +₹{totalIncome.toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">Authorized inflow</p>
        </div>

        <div className="bg-white dark:bg-[#14253A] border border-gray-100 dark:border-[#1E3553] rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Expenses</span>
          <h3 className="text-xl font-extrabold text-rose-500 mt-1 font-numeric">
            -₹{totalExpenses.toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">Excludes self-transfers</p>
        </div>

        <div className="bg-white dark:bg-[#14253A] border border-gray-100 dark:border-[#1E3553] rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Net Cash Flow</span>
          <h3 className={`text-xl font-extrabold mt-1 font-numeric ${netCashFlow >= 0 ? 'text-[#16A36A]' : 'text-rose-500'}`}>
            {netCashFlow >= 0 ? '+' : '-'}₹{Math.abs(netCashFlow).toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">Inflow minus outflow</p>
        </div>

        <div className="bg-white dark:bg-[#14253A] border border-gray-100 dark:border-[#1E3553] rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Transactions Count</span>
          <h3 className="text-xl font-extrabold text-[#142B45] dark:text-white mt-1 font-numeric">
            {filteredTransactions.length}
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">Verified financial events</p>
        </div>
      </div>

      {/* Comprehensive Filter Controls */}
      <div className="bg-white dark:bg-[#14253A] rounded-2xl p-4 border border-gray-100 dark:border-[#1E3553] shadow-sm space-y-3">
        <div className="flex items-center space-x-2 text-xs font-bold text-[#142B45] dark:text-white">
          <Filter className="w-4 h-4 text-[#16A36A]" />
          <span>Multi-Field Transaction Filters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Merchant or note..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-xs text-[#142B45] dark:text-white"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-xs text-[#142B45] dark:text-white"
          >
            <option value="all">All Types</option>
            <option value="expense">Expenses Only</option>
            <option value="income">Income Only</option>
            <option value="transfer">Transfers Only</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-xs text-[#142B45] dark:text-white"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Account Filter */}
          <select
            value={accountFilter}
            onChange={e => setAccountFilter(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-xs text-[#142B45] dark:text-white"
          >
            <option value="all">All Accounts</option>
            {accounts.map(a => (
              <option key={a.id} value={a.id}>{a.nickname}</option>
            ))}
          </select>

          {/* Shared vs Personal Scope */}
          <select
            value={scopeFilter}
            onChange={e => setScopeFilter(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-xs text-[#142B45] dark:text-white"
          >
            <option value="all">Scope: All</option>
            <option value="shared">Shared Family Only</option>
            <option value="personal">Personal Private Only</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-xs text-[#142B45] dark:text-white"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white dark:bg-[#14253A] rounded-3xl border border-gray-100 dark:border-[#1E3553] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-[#1E3553] bg-gray-50/50 dark:bg-[#0B1522]/50 text-[11px] font-bold uppercase tracking-wider text-[#738095] dark:text-gray-400">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Merchant / Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Account</th>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Scope</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#1E3553] text-xs">
              {paginatedTransactions.length > 0 ? (
                paginatedTransactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-gray-50/70 dark:hover:bg-[#1E3553]/40 transition">
                    <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                      {new Date(tx.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#142B45] dark:text-white max-w-xs">
                      <div className="flex items-center space-x-2">
                        <span>{tx.merchant}</span>
                        {tx.receiptUrl && (
                          <span title="Has receipt attachment">
                            <FileText className="w-3.5 h-3.5 text-blue-500" />
                          </span>
                        )}
                      </div>
                      {tx.description && (
                        <p className="text-[10px] text-gray-400 font-normal truncate mt-0.5">
                          {tx.description}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-[#1E3553] text-[11px]">
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {tx.accountNickname}
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {tx.userName}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        tx.isShared
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                          : 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400'
                      }`}>
                        {tx.isShared ? 'Shared' : 'Personal'}
                      </span>
                    </td>
                    <td className={`py-3 px-4 text-right font-bold font-numeric whitespace-nowrap ${
                      tx.type === 'income'
                        ? 'text-[#16A36A]'
                        : tx.type === 'transfer'
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-[#142B45] dark:text-white'
                    }`}>
                      {tx.type === 'income' ? '+' : tx.type === 'transfer' ? '⇄ ' : '-'}₹
                      {tx.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <StatusBadge status={tx.status} />
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => { setSelectedTx(tx); setIsDetailsOpen(true); }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-[#1E3553]"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(tx)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-gray-100 dark:hover:bg-[#1E3553]"
                          title="Edit Transaction"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => { setTxToDelete(tx); setIsDeleteConfirmOpen(true); }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-gray-100 dark:hover:bg-[#1E3553]"
                          title="Delete Transaction"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-14 text-center text-gray-400">
                    <p className="text-sm font-bold text-[#142B45] dark:text-white">
                      {transactions.length === 0 ? 'No Transactions Recorded Yet' : 'No Transactions Match Filters'}
                    </p>
                    <p className="text-xs text-[#738095] dark:text-gray-400 mt-1 max-w-md mx-auto">
                      {transactions.length === 0 
                        ? 'e.g. Tap "+ Add Expense", "+ Add Income", or "Transfer" above to record your first household transaction.'
                        : 'Try resetting the search keyword or selecting "All Categories" and "All Types".'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-[#1E3553] flex items-center justify-between text-xs text-gray-500">
          <span>
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredTransactions.length)} of {filteredTransactions.length} entries
          </span>
          <div className="flex items-center space-x-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-[#1E3553] disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-[#142B45] dark:text-white px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-[#1E3553] disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTx && (
        <Modal
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          title="Transaction Details & Audit Trail"
          subtitle={`Reference: ${selectedTx.referenceNumber || selectedTx.id}`}
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#0B1522] rounded-2xl border border-gray-200 dark:border-[#1E3553]">
              <div>
                <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Amount</span>
                <h3 className="text-2xl font-black text-[#142B45] dark:text-white font-numeric">
                  ₹{selectedTx.amount.toLocaleString('en-IN')}
                </h3>
              </div>
              <StatusBadge status={selectedTx.status} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-gray-400 block mb-0.5">Merchant</span>
                <span className="font-bold text-[#142B45] dark:text-white">{selectedTx.merchant}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">Category</span>
                <span className="font-bold text-[#142B45] dark:text-white">{selectedTx.category}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">Account</span>
                <span className="font-bold text-[#142B45] dark:text-white">{selectedTx.accountNickname}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">Recorded By</span>
                <span className="font-bold text-[#142B45] dark:text-white">{selectedTx.userName}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">Payment Method</span>
                <span className="font-bold text-[#142B45] dark:text-white">{selectedTx.paymentMethod}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">Date & Time</span>
                <span className="font-bold text-[#142B45] dark:text-white">{new Date(selectedTx.date).toLocaleString()}</span>
              </div>
            </div>

            {selectedTx.receiptUrl && (
              <div className="pt-2">
                <span className="text-gray-400 block mb-1">Receipt Attachment</span>
                <img
                  src={selectedTx.receiptUrl}
                  alt="Receipt"
                  className="w-full h-40 object-cover rounded-xl border border-gray-200 dark:border-[#1E3553]"
                />
              </div>
            )}

            {selectedTx.notes && (
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553]">
                <span className="text-gray-400 font-bold block mb-1">Audit Notes</span>
                <p className="text-gray-600 dark:text-gray-300">{selectedTx.notes}</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {selectedTx && (
        <Modal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          title="Edit Transaction"
          subtitle="Updates will adjust account balances and monthly category budgets"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
                Amount (INR ₹) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={editAmount}
                onChange={e => setEditAmount(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-sm font-bold text-[#142B45] dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
                Merchant / Payee *
              </label>
              <input
                type="text"
                required
                value={editMerchant}
                onChange={e => setEditMerchant(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-sm text-[#142B45] dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
                Description / Memo
              </label>
              <input
                type="text"
                value={editDescription}
                onChange={e => setEditDescription(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-sm text-[#142B45] dark:text-white"
              />
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="editShared"
                checked={editIsShared}
                onChange={e => setEditIsShared(e.target.checked)}
                className="w-4 h-4 text-[#16A36A] rounded border-gray-300"
              />
              <label htmlFor="editShared" className="text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                Shared family expense
              </label>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100 dark:border-[#1E3553]">
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#16A36A] text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {txToDelete && (
        <Modal
          isOpen={isDeleteConfirmOpen}
          onClose={() => setIsDeleteConfirmOpen(false)}
          title="Confirm Transaction Deletion"
        >
          <div className="space-y-4">
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              Are you sure you want to delete this transaction for <strong>{txToDelete.merchant}</strong> (₹{txToDelete.amount.toLocaleString('en-IN')})?
              Deleting this record will restore the account balance and recalculate your monthly budget.
            </p>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Quick Action modal for adding */}
      <QuickActionModal
        isOpen={isQuickActionOpen}
        onClose={() => setIsQuickActionOpen(false)}
        defaultType={quickActionType}
      />
    </div>
  );
};
