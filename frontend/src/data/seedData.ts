import { 
  Family, FamilyMember, Account, Category, Transaction, 
  DetectedMessage, MonthlyBudget, Loan, SavingsGoal, 
  RecurringPayment, CalendarEvent, FamilyChallenge, AIInsight,
  User, NotificationItem 
} from '../types';

export const INITIAL_USER: User = {
  id: 'usr_1',
  name: 'Rajesh Sharma',
  email: 'rajesh.sharma@pennywise.app',
  phone: '+91 98765 43210',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  role: 'FamilyAdmin',
  familyId: 'fam_sharma_01',
  currency: '₹',
  financialMonthStartDay: 1,
  monthlySalary: 185000,
  salaryDate: 1,
  permissions: {
    canViewFamilyBudget: true,
    canEditFamilyBudget: true,
    canViewSharedTransactions: true,
    canAddSharedTransactions: true,
    canManageMembers: true,
    canViewReports: true,
    canManageAccounts: true,
    canViewSharedLoans: true,
    canManageSavingsGoals: true,
  }
};

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

export const INITIAL_MEMBERS: FamilyMember[] = [
  {
    id: 'mem_1',
    userId: 'usr_1',
    name: 'Rajesh Sharma',
    email: 'rajesh.sharma@pennywise.app',
    role: 'FamilyAdmin',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    joinedDate: '2024-01-15',
    sharedContributionMonth: 65000,
    isOnline: true,
    permissions: {
      canViewFamilyBudget: true,
      canEditFamilyBudget: true,
      canViewSharedTransactions: true,
      canAddSharedTransactions: true,
      canManageMembers: true,
      canViewReports: true,
      canManageAccounts: true,
      canViewSharedLoans: true,
      canManageSavingsGoals: true,
    },
    sharingSettings: {
      shareSalary: false,
      shareAccounts: false,
      shareLoans: true,
    }
  },
  {
    id: 'mem_2',
    userId: 'usr_2',
    name: 'Priya Sharma',
    email: 'priya.sharma@pennywise.app',
    role: 'FinanceManager',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    joinedDate: '2024-01-15',
    sharedContributionMonth: 50000,
    isOnline: true,
    permissions: {
      canViewFamilyBudget: true,
      canEditFamilyBudget: true,
      canViewSharedTransactions: true,
      canAddSharedTransactions: true,
      canManageMembers: false,
      canViewReports: true,
      canManageAccounts: false,
      canViewSharedLoans: true,
      canManageSavingsGoals: true,
    },
    sharingSettings: {
      shareSalary: false,
      shareAccounts: true,
      shareLoans: true,
    }
  },
  {
    id: 'mem_3',
    userId: 'usr_3',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@pennywise.app',
    role: 'AdultMember',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    joinedDate: '2024-06-01',
    sharedContributionMonth: 12000,
    isOnline: false,
    permissions: {
      canViewFamilyBudget: true,
      canEditFamilyBudget: false,
      canViewSharedTransactions: true,
      canAddSharedTransactions: true,
      canManageMembers: false,
      canViewReports: true,
      canManageAccounts: false,
      canViewSharedLoans: false,
      canManageSavingsGoals: true,
    },
    sharingSettings: {
      shareSalary: false,
      shareAccounts: false,
      shareLoans: false,
    }
  },
  {
    id: 'mem_4',
    userId: 'usr_4',
    name: 'Ananya Sharma',
    email: 'ananya.sharma@pennywise.app',
    role: 'Dependent',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    joinedDate: '2024-08-10',
    sharedContributionMonth: 0,
    isOnline: false,
    permissions: {
      canViewFamilyBudget: true,
      canEditFamilyBudget: false,
      canViewSharedTransactions: true,
      canAddSharedTransactions: false,
      canManageMembers: false,
      canViewReports: false,
      canManageAccounts: false,
      canViewSharedLoans: false,
      canManageSavingsGoals: false,
    },
    sharingSettings: {
      shareSalary: false,
      shareAccounts: false,
      shareLoans: false,
    }
  }
];

export const INITIAL_FAMILY: Family = {
  id: 'fam_sharma_01',
  name: 'The Sharma Family',
  avatar: '🏡',
  adminId: 'usr_1',
  createdDate: '2024-01-15',
  totalMonthlyBudget: 154000,
  sharedBudgetRemaining: 154000,
  members: INITIAL_MEMBERS,
};

export const INITIAL_ACCOUNTS: Account[] = [
  {
    id: 'acc_1',
    userId: 'usr_1',
    familyId: 'fam_sharma_01',
    nickname: 'HDFC Salary Account',
    accountType: 'savings',
    bankName: 'HDFC Bank',
    maskedNumber: '•••• 4192',
    currentBalance: 150000,
    currency: '₹',
    isShared: false,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'acc_2',
    userId: 'usr_1',
    familyId: 'fam_sharma_01',
    nickname: 'SBI Household Joint Account',
    accountType: 'savings',
    bankName: 'State Bank of India',
    maskedNumber: '•••• 8821',
    currentBalance: 50000,
    currency: '₹',
    isShared: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'acc_3',
    userId: 'usr_1',
    familyId: 'fam_sharma_01',
    nickname: 'ICICI Sapphiro Credit Card',
    accountType: 'credit_card',
    bankName: 'ICICI Bank',
    maskedNumber: '•••• 5034',
    currentBalance: 0,
    currency: '₹',
    isShared: false,
    creditLimit: 300000,
    availableCredit: 300000,
    outstandingDue: 0,
    statementDueDate: '2026-11-20',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'acc_4',
    userId: 'usr_1',
    familyId: 'fam_sharma_01',
    nickname: 'Cash Reserve Wallet',
    accountType: 'cash_wallet',
    bankName: 'Cash',
    maskedNumber: 'CASH',
    currentBalance: 10000,
    currency: '₹',
    isShared: true,
    updatedAt: new Date().toISOString(),
  }
];

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat_rent', name: 'Rent & Maintenance', type: 'expense', icon: 'Home', color: '#6366F1', monthlyBudget: 35000, spentThisMonth: 0, isShared: true, isDefault: true },
  { id: 'cat_emi', name: 'EMI & Loans', type: 'expense', icon: 'Landmark', color: '#EF4444', monthlyBudget: 32000, spentThisMonth: 0, isShared: true, isDefault: true },
  { id: 'cat_groceries', name: 'Groceries & Supplies', type: 'expense', icon: 'ShoppingCart', color: '#16A36A', monthlyBudget: 25000, spentThisMonth: 0, isShared: true, isDefault: true },
  { id: 'cat_dining', name: 'Food & Dining Out', type: 'expense', icon: 'Utensils', color: '#F59E0B', monthlyBudget: 12000, spentThisMonth: 0, isShared: true, isDefault: true },
  { id: 'cat_bills', name: 'Bills & Utilities', type: 'expense', icon: 'Zap', color: '#3B82F6', monthlyBudget: 15000, spentThisMonth: 0, isShared: true, isDefault: true },
  { id: 'cat_health', name: 'Healthcare & Medical', type: 'expense', icon: 'HeartPulse', color: '#EC4899', monthlyBudget: 10000, spentThisMonth: 0, isShared: true, isDefault: true },
  { id: 'cat_shopping', name: 'Shopping & Personal Care', type: 'expense', icon: 'ShoppingBag', color: '#8B5CF6', monthlyBudget: 15000, spentThisMonth: 0, isShared: false, isDefault: true },
  { id: 'cat_education', name: 'Education & Courses', type: 'expense', icon: 'GraduationCap', color: '#14B8A6', monthlyBudget: 10000, spentThisMonth: 0, isShared: true, isDefault: true },
  { id: 'cat_salary', name: 'Primary Salary', type: 'income', icon: 'Briefcase', color: '#16A36A', monthlyBudget: 0, spentThisMonth: 0, isShared: false, isDefault: true },
  { id: 'cat_investments', name: 'Investments & Dividends', type: 'income', icon: 'TrendingUp', color: '#10B981', monthlyBudget: 0, spentThisMonth: 0, isShared: true, isDefault: true },
];

// Clean state: No dummy transactions!
export const INITIAL_TRANSACTIONS: Transaction[] = [];

// Clean state: No dummy detected messages!
export const INITIAL_DETECTED_MESSAGES: DetectedMessage[] = [];

export const INITIAL_BUDGET: MonthlyBudget = {
  id: 'bgt_nov_2026',
  familyId: 'fam_sharma_01',
  month: '2026-11',
  totalBudget: 154000,
  totalSpent: 0,
  alertThresholds: [50, 75, 80, 90, 100],
  categories: INITIAL_CATEGORIES.filter(c => c.type === 'expense').map(c => ({
    categoryId: c.id,
    categoryName: c.name,
    icon: c.icon,
    color: c.color,
    budgetLimit: c.monthlyBudget,
    spent: 0,
    previousMonthSpent: 0,
    carryForward: 0,
  }))
};

// Clean state: No dummy loans!
export const INITIAL_LOANS: Loan[] = [];

// Clean state: No dummy savings goals!
export const INITIAL_SAVINGS_GOALS: SavingsGoal[] = [];

// Clean state: No dummy recurring payments!
export const INITIAL_RECURRING: RecurringPayment[] = [];

export const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [];

export const INITIAL_CHALLENGES: FamilyChallenge[] = [];

export const INITIAL_AI_INSIGHTS: AIInsight[] = [];
