import React, { useState } from 'react';
import { 
  BarChart3, Download, Filter, Sparkles, TrendingUp, 
  TrendingDown, PieChart as PieChartIcon, Calendar, ArrowRight 
} from 'lucide-react';
import { useFamily } from '../context/FamilyContext';
import { useAuth } from '../context/AuthContext';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  Tooltip, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend 
} from 'recharts';

interface AnalyticsPageProps {
  onNavigate: (page: string) => void;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ onNavigate }) => {
  const { transactions, budget } = useFamily();
  const { currentUser } = useAuth();

  const [scope, setScope] = useState<'family' | 'personal'>('family');
  const [dateRange, setDateRange] = useState<string>('last6months');

  // Filter based on scope
  const filteredTxs = transactions.filter(t => {
    if (scope === 'family') return t.isShared;
    return t.userId === currentUser.id;
  });

  const categorySpendingData = budget.categories
    .filter(c => c.spent > 0)
    .map(c => ({ name: c.categoryName, amount: c.spent, limit: c.budgetLimit, color: c.color }));

  // Merchant breakdown
  const merchantTotals: Record<string, number> = {};
  filteredTxs.filter(t => t.type === 'expense').forEach(t => {
    merchantTotals[t.merchant] = (merchantTotals[t.merchant] || 0) + t.amount;
  });
  const merchantData = Object.entries(merchantTotals)
    .map(([merchant, amount]) => ({ merchant, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 6);

  // Payment methods breakdown
  const paymentTotals: Record<string, number> = {};
  filteredTxs.filter(t => t.type === 'expense').forEach(t => {
    const method = t.paymentMethod || 'UPI';
    paymentTotals[method] = (paymentTotals[method] || 0) + t.amount;
  });
  const paymentData = Object.entries(paymentTotals).map(([name, value]) => ({ name, value }));

  // Monthly trends
  const monthlyTrends = [
    { month: 'Jun', income: 190000, expense: 110000, savingsRate: 42 },
    { month: 'Jul', income: 195000, expense: 112000, savingsRate: 42.5 },
    { month: 'Aug', income: 210000, expense: 128000, savingsRate: 39 },
    { month: 'Sep', income: 205000, expense: 119000, savingsRate: 41.9 },
    { month: 'Oct', income: 220000, expense: 134000, savingsRate: 39.1 },
    { month: 'Nov', income: 210000, expense: 95800, savingsRate: 54.3 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#142B45] dark:text-white">
            Financial Analytics & Intelligence
          </h2>
          <p className="text-xs text-[#738095] dark:text-gray-400 mt-1">
            Reconciled spending analytics, category breakdowns, and savings rate trends
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Scope Selector */}
          <div className="flex p-1 bg-gray-100 dark:bg-[#1E3553] rounded-xl text-xs font-semibold">
            <button
              onClick={() => setScope('family')}
              className={`px-3 py-1.5 rounded-lg transition ${
                scope === 'family' ? 'bg-[#142B45] dark:bg-[#16A36A] text-white shadow-sm' : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Family Shared
            </button>
            <button
              onClick={() => setScope('personal')}
              className={`px-3 py-1.5 rounded-lg transition ${
                scope === 'personal' ? 'bg-[#142B45] dark:bg-[#16A36A] text-white shadow-sm' : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Personal Private
            </button>
          </div>

          <button
            onClick={() => alert("Downloading full Financial Analytics Report (PDF)...")}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-white dark:bg-[#14253A] border border-gray-200 dark:border-[#1E3553] rounded-xl text-xs font-bold text-[#142B45] dark:text-white hover:bg-gray-50 transition"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* AI Intelligence Summary Card */}
      <div className="bg-gradient-to-r from-emerald-900/10 via-emerald-800/5 to-transparent dark:from-emerald-950/40 rounded-3xl p-6 border border-emerald-500/20">
        <div className="flex items-center space-x-2.5 mb-3">
          <div className="p-2 bg-[#16A36A] text-white rounded-xl shadow-md">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#142B45] dark:text-white">
              PennyAI Spending Pattern Analysis
            </h3>
            <p className="text-[11px] text-[#738095] dark:text-gray-400">
              Evaluated across {filteredTxs.length} verified transactions ({scope === 'family' ? 'Shared Family Scope' : 'Personal Scope'})
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-white dark:bg-[#14253A] p-4 rounded-2xl border border-gray-100 dark:border-[#1E3553]">
            <span className="text-[10px] font-bold uppercase text-gray-400">Highest Outflow</span>
            <h4 className="text-sm font-bold text-[#142B45] dark:text-white mt-1">Rent & Maintenance</h4>
            <p className="text-gray-500 mt-1">Fixed monthly commitment of ₹35,000 represents 36.5% of total outflow.</p>
          </div>

          <div className="bg-white dark:bg-[#14253A] p-4 rounded-2xl border border-gray-100 dark:border-[#1E3553]">
            <span className="text-[10px] font-bold uppercase text-gray-400">Month-over-Month Shift</span>
            <h4 className="text-sm font-bold text-[#16A36A] mt-1">+12.4% Savings Surplus</h4>
            <p className="text-gray-500 mt-1">Lower power bills and timely EMI deductions increased unspent cashflow.</p>
          </div>

          <div className="bg-white dark:bg-[#14253A] p-4 rounded-2xl border border-gray-100 dark:border-[#1E3553]">
            <span className="text-[10px] font-bold uppercase text-gray-400">Discretionary Watch</span>
            <h4 className="text-sm font-bold text-amber-500 mt-1">Dining Out: 92.5% Used</h4>
            <p className="text-gray-500 mt-1">Only ₹900 remaining in restaurant budget for next 18 days.</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget vs Actual Spending by Category */}
        <div className="bg-white dark:bg-[#14253A] rounded-3xl p-6 border border-gray-100 dark:border-[#1E3553] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#142B45] dark:text-white">
                Budget vs Actual Spending
              </h3>
              <p className="text-xs text-gray-400">
                Click any bar to drill down into underlying transactions
              </p>
            </div>
            <button onClick={() => onNavigate('transactions')} className="text-xs text-[#16A36A] font-semibold hover:underline">
              Inspect Records
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categorySpendingData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-25} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `₹${v / 1000}k`} />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                  contentStyle={{ borderRadius: '12px', backgroundColor: '#0B1522', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="limit" fill="#E2E8F0" name="Limit Target" radius={[4, 4, 0, 0]} />
                <Bar dataKey="amount" fill="#16A36A" name="Spent to Date" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Savings Rate Trajectory */}
        <div className="bg-white dark:bg-[#14253A] rounded-3xl p-6 border border-gray-100 dark:border-[#1E3553] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#142B45] dark:text-white">
                Family Savings Rate (%)
              </h3>
              <p className="text-xs text-gray-400">
                Net savings as a percentage of total family income
              </p>
            </div>
            <span className="text-xs font-bold text-[#16A36A]">Target: &gt; 35%</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={[20, 60]} tickFormatter={v => `${v}%`} />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Savings Rate']}
                  contentStyle={{ borderRadius: '12px', backgroundColor: '#0B1522', color: '#fff', fontSize: '11px' }}
                />
                <Line type="monotone" dataKey="savingsRate" stroke="#16A36A" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Merchant Outflow Breakdown */}
        <div className="bg-white dark:bg-[#14253A] rounded-3xl p-6 border border-gray-100 dark:border-[#1E3553] shadow-sm">
          <h3 className="text-base font-bold text-[#142B45] dark:text-white mb-1">
            Top Payees & Merchants
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            Where your money was directed this month
          </p>

          <div className="space-y-3">
            {merchantData.map(m => (
              <div key={m.merchant} className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#142B45] dark:text-white truncate max-w-xs">
                  {m.merchant}
                </span>
                <span className="font-extrabold text-[#142B45] dark:text-white font-numeric">
                  ₹{m.amount.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Channels Breakdown */}
        <div className="bg-white dark:bg-[#14253A] rounded-3xl p-6 border border-gray-100 dark:border-[#1E3553] shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#142B45] dark:text-white mb-1">
              Payment Method Distribution
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              UPI vs NetBanking vs Credit Card breakdown
            </p>

            <div className="space-y-3">
              {paymentData.map(p => (
                <div key={p.name} className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    {p.name}
                  </span>
                  <span className="font-bold text-[#16A36A] font-numeric">
                    ₹{p.value.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-[#1E3553]">
            <button
              onClick={() => onNavigate('transactions')}
              className="text-xs font-bold text-[#16A36A] hover:underline flex items-center space-x-1"
            >
              <span>Inspect all underlying transactions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

