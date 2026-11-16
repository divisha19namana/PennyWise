import React, { useState } from 'react';
import { 
  Plus, Edit2, Trash2, GitMerge, Check, AlertCircle, 
  ShoppingCart, Zap, Home, Utensils, Building2, Car, 
  HeartPulse, GraduationCap, ShoppingBag, Tv, Sparkles, 
  Plane, ShieldCheck, TrendingUp, HelpCircle, Briefcase, 
  Laptop, Store, Percent, Gift, RotateCcw, PlusCircle 
} from 'lucide-react';
import { useFamily } from '../context/FamilyContext';
import { Modal } from '../components/common/Modal';
import { Category, CategoryType } from '../types';

export const CategoriesPage: React.FC = () => {
  const { categories, addCategory, editCategory, deleteCategory, mergeCategories, updateBudgetLimit } = useFamily();

  const [activeTab, setActiveTab] = useState<CategoryType>('expense');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState<boolean>(false);

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Form states
  const [name, setName] = useState<string>('');
  const [monthlyBudget, setMonthlyBudget] = useState<string>('10000');
  const [color, setColor] = useState<string>('#16A36A');
  const [isShared, setIsShared] = useState<boolean>(true);
  const [targetMergeId, setTargetMergeId] = useState<string>('');

  const filteredCategories = categories.filter(c => c.type === activeTab);

  const colors = [
    '#16A36A', '#3B82F6', '#6366F1', '#8B5CF6', 
    '#EC4899', '#EF4444', '#F59E0B', '#10B981', 
    '#06B6D4', '#F97316', '#475569'
  ];

  const handleOpenAdd = () => {
    setName('');
    setMonthlyBudget('10000');
    setColor('#16A36A');
    setIsShared(true);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setSelectedCategory(cat);
    setName(cat.name);
    setMonthlyBudget(cat.monthlyBudget.toString());
    setColor(cat.color);
    setIsShared(cat.isShared);
    setIsEditModalOpen(true);
  };

  const handleOpenMerge = (cat: Category) => {
    setSelectedCategory(cat);
    const firstOther = categories.find(c => c.id !== cat.id && c.type === cat.type);
    setTargetMergeId(firstOther?.id || '');
    setIsMergeModalOpen(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addCategory({
      name: name.trim(),
      type: activeTab,
      icon: 'Tag',
      color,
      monthlyBudget: parseFloat(monthlyBudget) || 0,
      isShared,
      isDefault: false,
    });
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !name.trim()) return;

    const newLimit = parseFloat(monthlyBudget) || 0;
    editCategory(selectedCategory.id, {
      name: name.trim(),
      color,
      isShared,
      monthlyBudget: newLimit,
    });
    if (activeTab === 'expense') {
      updateBudgetLimit(selectedCategory.id, newLimit);
    }
    setIsEditModalOpen(false);
  };

  const handleConfirmMerge = () => {
    if (!selectedCategory || !targetMergeId) return;
    mergeCategories(selectedCategory.id, targetMergeId);
    setIsMergeModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#142B45] dark:text-white">
            Category Management
          </h2>
          <p className="text-xs text-[#738095] dark:text-gray-400 mt-1">
            Organize household expenses and incomes with customized budgets and icon badges
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center space-x-1.5 px-4 py-2 bg-[#16A36A] hover:bg-[#138959] text-white rounded-xl text-xs font-bold transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-100 dark:border-[#1E3553] pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('expense')}
          className={`px-4 py-2 rounded-xl transition ${
            activeTab === 'expense'
              ? 'bg-[#142B45] dark:bg-[#16A36A] text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#14253A]'
          }`}
        >
          Expense Categories ({categories.filter(c => c.type === 'expense').length})
        </button>
        <button
          onClick={() => setActiveTab('income')}
          className={`px-4 py-2 rounded-xl transition ${
            activeTab === 'income'
              ? 'bg-[#142B45] dark:bg-[#16A36A] text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#14253A]'
          }`}
        >
          Income Categories ({categories.filter(c => c.type === 'income').length})
        </button>
      </div>

      {/* Categories Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredCategories.map(cat => (
          <div
            key={cat.id}
            className="bg-white dark:bg-[#14253A] rounded-2xl p-4 border border-gray-100 dark:border-[#1E3553] shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
                  style={{ backgroundColor: cat.color }}
                >
                  <span className="font-bold text-sm">{cat.name.charAt(0)}</span>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleOpenMerge(cat)}
                    className="p-1 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-[#1E3553]"
                    title="Merge with another category"
                  >
                    <GitMerge className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="p-1 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-gray-100 dark:hover:bg-[#1E3553]"
                    title="Edit Category"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteCategory(cat.id)}
                    className="p-1 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-gray-100 dark:hover:bg-[#1E3553]"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h4 className="text-sm font-bold text-[#142B45] dark:text-white truncate">
                {cat.name}
              </h4>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {cat.isShared ? 'Shared Family Category' : 'Personal Category'}
              </p>
            </div>

            {cat.type === 'expense' && (
              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-[#1E3553]">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">Monthly Limit:</span>
                  <span className="font-bold text-[#142B45] dark:text-white font-numeric">
                    ₹{cat.monthlyBudget.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-[#0B1522] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (cat.spentThisMonth / (cat.monthlyBudget || 1)) * 100)}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Category Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={`Add ${activeTab === 'expense' ? 'Expense' : 'Income'} Category`}
      >
        <form onSubmit={handleSaveAdd} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
              Category Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Pet Care, Gardening"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-sm text-[#142B45] dark:text-white"
            />
          </div>

          {activeTab === 'expense' && (
            <div>
              <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
                Monthly Spending Limit (INR ₹)
              </label>
              <input
                type="number"
                value={monthlyBudget}
                onChange={e => setMonthlyBudget(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-sm text-[#142B45] dark:text-white"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-2">
              Color Accent
            </label>
            <div className="flex flex-wrap gap-2">
              {colors.map(c => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-xl transition ${
                    color === c ? 'ring-2 ring-offset-2 ring-[#16A36A] scale-110' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="catShared"
              checked={isShared}
              onChange={e => setIsShared(e.target.checked)}
              className="w-4 h-4 text-[#16A36A] rounded border-gray-300"
            />
            <label htmlFor="catShared" className="text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
              Visible to all family members
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-[#1E3553]">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#16A36A] text-white rounded-xl text-xs font-bold shadow-sm"
            >
              Create Category
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Category Modal */}
      {selectedCategory && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit ${selectedCategory.name}`}
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
                Category Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-sm text-[#142B45] dark:text-white"
              />
            </div>

            {selectedCategory.type === 'expense' && (
              <div>
                <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
                  Monthly Limit (INR ₹)
                </label>
                <input
                  type="number"
                  value={monthlyBudget}
                  onChange={e => setMonthlyBudget(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-sm text-[#142B45] dark:text-white"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-2">
                Color Accent
              </label>
              <div className="flex flex-wrap gap-2">
                {colors.map(c => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-xl transition ${
                      color === c ? 'ring-2 ring-offset-2 ring-[#16A36A] scale-110' : ''
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-[#1E3553]">
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
                Save Updates
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Merge Modal */}
      {selectedCategory && (
        <Modal
          isOpen={isMergeModalOpen}
          onClose={() => setIsMergeModalOpen(false)}
          title={`Merge "${selectedCategory.name}" into another category`}
          subtitle="All transactions will be safely reassigned to the selected target category"
        >
          <div className="space-y-4 text-xs">
            <p className="text-gray-600 dark:text-gray-300">
              Merging will migrate all historical transactions from <strong>{selectedCategory.name}</strong> into the target category below, and then delete {selectedCategory.name}.
            </p>

            <div>
              <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
                Select Destination Category
              </label>
              <select
                value={targetMergeId}
                onChange={e => setTargetMergeId(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-sm text-[#142B45] dark:text-white"
              >
                {categories
                  .filter(c => c.id !== selectedCategory.id && c.type === selectedCategory.type)
                  .map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
              </select>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-[#1E3553]">
              <button
                type="button"
                onClick={() => setIsMergeModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmMerge}
                className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Confirm Merge & Migrate
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

