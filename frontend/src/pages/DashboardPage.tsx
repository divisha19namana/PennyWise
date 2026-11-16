import React from 'react';
import { 
  TrendingUp, TrendingDown, PieChart as PieChartIcon, 
  Target, Building2, Calendar, Sparkles, Plus, 
  ArrowRight, ShieldAlert, CheckCircle2, ChevronRight 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFamily } from '../context/FamilyContext';
import { StatCard } from '../components/common/StatCard';
import { RoleBadge, StatusBadge } from '../components/common/Badge';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  Tooltip, PieChart, Pie, Cell, LineChart, Line, CartesianGrid 
} from 'recharts';

interface DashboardPageProps {
  onNavigate: (page: string) => void;
  onOpenQuickAction: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate, onOpenQuickAction }) => {
  const { currentUser } = useAuth();
  const { 
    family, members, budget, transactions, loans, 
    savingsGoals, calendarEvents, aiInsights 
  } = useFamily();

  // Financial calculations
  const sharedExpenses = transactions
    .filter(t => t.isShared && t.type === 'expense' && t.status === 'completed' && t.category !== 'Internal Transfer')
    .reduce((sum, t) => sum + t.amount, 0);

  // Privacy rule: Only show shared income unless user is Admin or looking at permitted accounts
  const sharedIncome = transactions
    .filter(t => t.type === 'income' && t.status === 'completed' && (t.isShared || (currentUser.role === 'FamilyAdmin' && t.userId === currentUser.id)))
    .reduce((sum, t) => sum + t.amount, 0);

  const remainingBudget = Math.max(0, budget.totalBudget - sharedExpenses);
  const budgetUtilization = Math.round((sharedExpenses / budget.totalBudget) * 100);

  const totalSavingsPool = savingsGoals
    .filter(g => g.isShared)
    .reduce((sum, g) => sum + g.currentAmount, 0);

  const upcomingEMIs = loans
    .filter(l => l.status === 'active' && (l.isShared || l.userId === currentUser.id))
    .reduce((sum, l) => sum + l.emiAmount, 0);

  // Category donut chart data
  const categoryData = budget.categories
    .filter(c => c.spent > 0)
    .map(c => ({ name: c.categoryName, value: c.spent, color: c.color }));

  // Cashflow comparison data
  const cashflowData = [
    { month: 'Jul', income: 195000, expenses: 112000, savings: 83000 },
    { month: 'Aug', income: 210000, expenses: 128000, savings: 82000 },
    { month: 'Sep', income: 205000, expenses: 119000, savings: 86000 },
    { month: 'Oct', income: 220000, expenses: 134000, savings: 86000 },
    { month: 'Nov (Mtd)', income: sharedIncome, expenses: sharedExpenses, savings: Math.max(0, sharedIncome - sharedExpenses) },
  ];

  // Daily spending trajectory
  const dailySpendData = [
    { day: '01 Nov', amount: 3500 },
    { day: '03 Nov', amount: 35000 }, // Rent
    { day: '05 Nov', amount: 32000 }, // EMI
    { day: '06 Nov', amount: 6840 },
    { day: '08 Nov', amount: 3450 },
    { day: '10 Nov', amount: 25000 }, // SIP
    { day: '12 Nov', amount: 1850 },
  ];

  const recentTransactions = transactions.slice(0, 5);
  const upcomingBills = calendarEvents.filter(e => e.status === 'upcoming').slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Top Banner Greeting */}
      <div className="bg-gradient-to-r from-[#142B45] to-[#1C3B5E] text-white rounded-3xl p-6 sm:p-8 shadow-fintech-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {family.name}
              </span>
              <RoleBadge role={currentUser.role} size="sm" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {currentUser.name.split(' ')[0]} 👋
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-xl">
              Your family has used <strong>{budgetUtilization}%</strong> of the November budget. 
              {currentUser.role === 'FamilyAdmin' ? ' You have full family administrative controls.' : ' You are viewing authorized shared household data.'}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenQuickAction}
              className="flex items-center space-x-2 px-4 py-2.5 bg-[#16A36A] hover:bg-[#138959] text-white font-bold text-xs rounded-xl shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              <span>Log Transaction</span>
            </button>
            <button
              onClick={() => onNavigate('ai')}
              className="flex items-center space-x-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-emerald-300 font-semibold text-xs rounded-xl border border-white/20 transition"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Ask PennyAI</span>
            </button>
          </div>
        </div>

        {/* Decorative backdrop shapes */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#16A36A]/10 blur-3xl pointer-events-none" />
      </div>

      {/* 6 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Family Income"
          value={`₹${sharedIncome.toLocaleString('en-IN')}`}
          subtitle="Total verified inflow"
          icon={TrendingUp}
          iconColor="text-emerald-600 dark:text-emerald-400"
          iconBg="bg-emerald-50 dark:bg-emerald-950/40"
          trend={{ value: '+4.2%', isPositive: true, label: 'vs last mo' }}
          onClick={() => onNavigate('income')}
        />

        <StatCard
          title="Shared Expenses"
          value={`₹${sharedExpenses.toLocaleString('en-IN')}`}
          subtitle={`${budgetUtilization}% of budget used`}
          icon={TrendingDown}
          iconColor="text-rose-600 dark:text-rose-400"
          iconBg="bg-rose-50 dark:bg-rose-950/40"
          trend={{ value: 'Normal Pace', isPositive: true }}
          onClick={() => onNavigate('transactions')}
        />

        <StatCard
          title="Remaining Budget"
          value={`₹${remainingBudget.toLocaleString('en-IN')}`}
          subtitle={`Limit: ₹${budget.totalBudget.toLocaleString('en-IN')}`}
          icon={PieChartIcon}
          iconColor="text-blue-600 dark:text-blue-400"
          iconBg="bg-blue-50 dark:bg-blue-950/40"
          badge={budgetUtilization >= 90 ? 'Alert' : 'On Track'}
          onClick={() => onNavigate('budget')}
        />

        <StatCard
          title="Shared Savings"
          value={`₹${totalSavingsPool.toLocaleString('en-IN')}`}
          subtitle={`${savingsGoals.length} active family goals`}
          icon={Target}
          iconColor="text-purple-600 dark:text-purple-400"
          iconBg="bg-purple-50 dark:bg-purple-950/40"
          trend={{ value: '+₹25K', isPositive: true, label: 'this mo' }}
          onClick={() => onNavigate('savings')}
        />

        <StatCard
          title="Monthly EMIs"
          value={`₹${upcomingEMIs.toLocaleString('en-IN')}`}
          subtitle={`${loans.length} active loan accounts`}
          icon={Building2}
          iconColor="text-amber-600 dark:text-amber-400"
          iconBg="bg-amber-50 dark:bg-amber-950/40"
          badge="Nov Paid"
          onClick={() => onNavigate('loans')}
        />

        <StatCard
          title="Financial Calendar"
          value={`${upcomingBills.length} Bills`}
          subtitle="Due next 14 days"
          icon={Calendar}
          iconColor="text-indigo-600 dark:text-indigo-400"
          iconBg="bg-indigo-50 dark:bg-indigo-950/40"
          onClick={() => onNavigate('calendar')}
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cashflow Trends (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#14253A] rounded-3xl p-6 border border-gray-100 dark:border-[#1E3553] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#142B45] dark:text-white">
                Income vs Expenses vs Savings
              </h3>
              <p className="text-xs text-[#738095] dark:text-gray-400">
                Monthly family cashflow performance over the last 5 months
              </p>
            </div>
            <button
              onClick={() => onNavigate('analytics')}
              className="text-xs text-[#16A36A] font-semibold hover:underline flex items-center space-x-1"
            >
              <span>Full Analytics</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashflowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${v / 1000}k`} />
                <Tooltip
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #1E3553', backgroundColor: '#0B1522', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="income" fill="#16A36A" name="Total Inflow" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="#DC5555" name="Total Outflow" radius={[4, 4, 0, 0]} />
                <Bar dataKey="savings" fill="#3B82F6" name="Net Saved" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Expense Donut (1 col) */}
        <div className="bg-white dark:bg-[#14253A] rounded-3xl p-6 border border-gray-100 dark:border-[#1E3553] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-base font-bold text-[#142B45] dark:text-white">
                Category Spending
              </h3>
              <p className="text-xs text-[#738095] dark:text-gray-400">
                November expense breakdown
              </p>
            </div>
            <button
              onClick={() => onNavigate('budget')}
              className="text-xs text-[#16A36A] font-semibold hover:underline"
            >
              Budget Limits
            </button>
          </div>

          <div className="h-48 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Spent']}
                  contentStyle={{ borderRadius: '12px', backgroundColor: '#0B1522', color: '#fff', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] uppercase font-bold text-gray-400">Total Spent</span>
              <span className="text-sm font-extrabold text-[#142B45] dark:text-white font-numeric">
                ₹{(sharedExpenses / 1000).toFixed(1)}k
              </span>
            </div>
          </div>

          {/* Top 4 Legend Pills */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 dark:border-[#1E3553]">
            {categoryData.slice(0, 4).map(c => (
              <div key={c.name} className="flex items-center space-x-1.5 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                <span className="truncate text-gray-600 dark:text-gray-300">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Financial Intelligence Section */}
      <div className="bg-gradient-to-r from-emerald-900/10 via-emerald-800/5 to-transparent dark:from-emerald-950/40 dark:via-emerald-900/20 rounded-3xl p-6 border border-emerald-500/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-[#16A36A] text-white rounded-xl shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#142B45] dark:text-white">
                PennyAI Smart Financial Digest
              </h3>
              <p className="text-[11px] text-[#738095] dark:text-gray-400">
                Actionable predictions calculated from verified family transactions
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('ai')}
            className="text-xs font-bold text-[#16A36A] hover:underline flex items-center space-x-1"
          >
            <span>Open AI Chat</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {aiInsights.map(insight => (
            <div
              key={insight.id}
              onClick={() => insight.actionRoute && onNavigate(insight.actionRoute.replace('/', ''))}
              className="bg-white dark:bg-[#14253A] p-4 rounded-2xl border border-gray-100 dark:border-[#1E3553] shadow-sm hover:shadow-md cursor-pointer transition"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-[#16A36A]">
                  {insight.metric || 'Insight'}
                </span>
                <span className="text-[10px] text-gray-400">{insight.timestamp}</span>
              </div>
              <h4 className="text-xs font-bold text-[#142B45] dark:text-white mb-1">
                {insight.title}
              </h4>
              <p className="text-xs text-[#738095] dark:text-gray-300 leading-relaxed">
                {insight.message}
              </p>
              {insight.actionLabel && (
                <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-[#16A36A] mt-2">
                  <span>{insight.actionLabel}</span>
                  <ChevronRight className="w-3 h-3" />
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Two-Column Activity Feed & Upcoming Obligations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Shared Transactions (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#14253A] rounded-3xl p-6 border border-gray-100 dark:border-[#1E3553] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#142B45] dark:text-white">
                Recent Family Activity
              </h3>
              <p className="text-xs text-[#738095] dark:text-gray-400">
                Verified expenses and transfers recorded across family accounts
              </p>
            </div>
            <button
              onClick={() => onNavigate('transactions')}
              className="text-xs text-[#16A36A] font-semibold hover:underline"
            >
              View All ({transactions.length})
            </button>
          </div>

          {recentTransactions.length > 0 ? (
            <div className="divide-y divide-gray-100 dark:divide-[#1E3553]">
              {recentTransactions.map(tx => (
                <div key={tx.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        tx.type === 'income'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600'
                          : tx.type === 'transfer'
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600'
                          : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : tx.type === 'transfer' ? '⇄' : '-'}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="text-xs font-bold text-[#142B45] dark:text-white">
                          {tx.merchant}
                        </p>
                        <span className="text-[10px] text-gray-400">
                          ({tx.category})
                        </span>
                      </div>
                      <p className="text-[10px] text-[#738095] dark:text-gray-400">
                        by {tx.userName} • {tx.accountNickname} • {new Date(tx.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={`text-xs font-bold font-numeric ${
                        tx.type === 'income'
                          ? 'text-[#16A36A]'
                          : tx.type === 'transfer'
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-[#142B45] dark:text-white'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : tx.type === 'transfer' ? '' : '-'}₹
                      {tx.amount.toLocaleString('en-IN')}
                    </p>
                    <StatusBadge status={tx.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-400">
              <p className="text-xs font-semibold text-[#142B45] dark:text-gray-300">No family transactions recorded yet.</p>
              <p className="text-[11px] text-[#738095] dark:text-gray-400 mt-1 max-w-sm mx-auto">
                e.g. Tap <strong>"Log Transaction"</strong> above or parse an SMS to record your household groceries, rent, or salary credit.
              </p>
            </div>
          )}
        </div>

        {/* Upcoming Bills & Calendar Reminders (1 col) */}
        <div className="bg-white dark:bg-[#14253A] rounded-3xl p-6 border border-gray-100 dark:border-[#1E3553] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[#142B45] dark:text-white">
                Upcoming Due Bills
              </h3>
              <button
                onClick={() => onNavigate('calendar')}
                className="text-xs text-[#16A36A] font-semibold hover:underline"
              >
                Calendar
              </button>
            </div>

            <div className="space-y-3">
              {upcomingBills.map(bill => (
                <div
                  key={bill.id}
                  className="p-3 rounded-2xl border border-gray-100 dark:border-[#1E3553] bg-gray-50/50 dark:bg-[#0B1522]/50 flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-[#142B45] dark:text-white">
                      {bill.title}
                    </p>
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
                      Due: {bill.date} • {bill.responsibleMember}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold font-numeric text-[#142B45] dark:text-white">
                      ₹{bill.amount.toLocaleString('en-IN')}
                    </p>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold">
                      Pending
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-[#1E3553]">
            <button
              onClick={() => onNavigate('calendar')}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-[#142B45] dark:text-white bg-gray-100 dark:bg-[#1E3553] hover:bg-gray-200 dark:hover:bg-[#254266] transition flex items-center justify-center space-x-1.5"
            >
              <Calendar className="w-4 h-4 text-[#16A36A]" />
              <span>Open Financial Calendar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

