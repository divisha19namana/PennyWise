// PennyWise Core Type Definitions

export type FamilyRole = 'FamilyAdmin' | 'FinanceManager' | 'AdultMember' | 'Dependent';

export interface FamilyPermissions {
  canViewFamilyBudget: boolean;
  canEditFamilyBudget: boolean;
  canViewSharedTransactions: boolean;
  canAddSharedTransactions: boolean;
  canManageMembers: boolean;
  canViewReports: boolean;
  canManageAccounts: boolean;
  canViewSharedLoans: boolean;
  canManageSavingsGoals: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: FamilyRole;
  familyId: string;
  currency: string;
  financialMonthStartDay: number; // e.g. 1st or 5th
  monthlySalary?: number; // strictly private
  salaryDate?: number;
  permissions: FamilyPermissions;
}

export interface FamilyMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: FamilyRole;
  avatar: string;
  joinedDate: string;
  permissions: FamilyPermissions;
  sharedContributionMonth: number;
  isOnline: boolean;
  sharingSettings: {
    shareSalary: boolean;
    shareAccounts: boolean;
    shareLoans: boolean;
  };
}

export interface Family {
  id: string;
  name: string;
  avatar: string;
  adminId: string;
  createdDate: string;
  totalMonthlyBudget: number;
  sharedBudgetRemaining: number;
  members: FamilyMember[];
}

export type AccountType = 'savings' | 'current' | 'cash_wallet' | 'upi_linked' | 'credit_card';

export interface Account {
  id: string;
  userId: string;
  familyId: string;
  nickname: string;
  accountType: AccountType;
  bankName: string;
  maskedNumber: string; // e.g. "•••• 8492"
  currentBalance: number;
  currency: string;
  isShared: boolean;
  creditLimit?: number;
  availableCredit?: number;
  outstandingDue?: number;
  statementDueDate?: string;
  updatedAt: string;
}

export type CategoryType = 'expense' | 'income';

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  icon: string; // Lucide icon name
  color: string; // Hex color code
  monthlyBudget: number;
  spentThisMonth: number;
  isShared: boolean;
  isDefault: boolean;
}

export type TransactionType = 'expense' | 'income' | 'transfer';
export type TransactionStatus = 'completed' | 'pending' | 'failed' | 'reversed';
export type TransactionSource = 'manual' | 'sms' | 'upi_sync' | 'imported';

export interface Transaction {
  id: string;
  userId: string;
  familyId: string;
  userName: string;
  accountId: string;
  accountNickname: string;
  toAccountId?: string; // For self transfers
  toAccountNickname?: string;
  type: TransactionType;
  amount: number;
  category: string;
  categoryId: string;
  merchant: string;
  description: string;
  date: string; // ISO string
  status: TransactionStatus;
  isShared: boolean;
  source: TransactionSource;
  paymentMethod: string;
  receiptUrl?: string;
  referenceNumber?: string;
  notes?: string;
  isDuplicateReview?: boolean;
}

export interface DetectedMessage {
  id: string;
  rawText: string;
  source: 'Android SMS' | 'UPI Notification' | 'WhatsApp Share' | 'Bank Statement';
  receivedAt: string;
  extractedAmount: number;
  merchant: string;
  transactionType: 'debit' | 'credit';
  accountNickname: string;
  accountLast4: string;
  paymentMethod: string;
  suggestedCategory: string;
  confidenceScore: number; // 0 to 1
  reviewStatus: 'pending' | 'confirmed' | 'rejected' | 'duplicate';
  referenceNo: string;
}

export interface BudgetCategory {
  categoryId: string;
  categoryName: string;
  icon: string;
  color: string;
  budgetLimit: number;
  spent: number;
  previousMonthSpent: number;
  carryForward: number;
}

export interface MonthlyBudget {
  id: string;
  familyId: string;
  month: string; // e.g. "2026-11"
  totalBudget: number;
  totalSpent: number;
  categories: BudgetCategory[];
  alertThresholds: number[]; // [50, 75, 80, 90, 100]
}

export type LoanType = 'home' | 'personal' | 'car' | 'education' | 'gold' | 'other';

export interface Loan {
  id: string;
  userId: string;
  familyId: string;
  borrowerName: string;
  loanName: string;
  loanType: LoanType;
  lender: string;
  accountNumberMasked: string;
  totalPrincipal: number;
  outstandingPrincipal: number;
  interestRate: number; // annual percentage
  interestMethod: 'reducing' | 'flat';
  tenureMonths: number;
  remainingMonths: number;
  emiAmount: number;
  dueDay: number; // day of month e.g. 5
  linkedAccountId: string;
  isShared: boolean;
  status: 'active' | 'closed';
  startDate: string;
  totalInterestPaid: number;
  totalPrincipalPaid: number;
}

export interface LoanEMI {
  id: string;
  loanId: string;
  loanName: string;
  installmentNo: number;
  dueDate: string;
  emiAmount: number;
  principalComponent: number;
  interestComponent: number;
  status: 'upcoming' | 'paid' | 'overdue';
  paidDate?: string;
  transactionId?: string;
}

export type GoalType = 'vacation' | 'emergency' | 'vehicle' | 'home' | 'education' | 'personal' | 'custom';

export interface SavingsContribution {
  id: string;
  goalId: string;
  userId: string;
  userName: string;
  amount: number;
  date: string;
  fromAccountId: string;
  note?: string;
}

export interface SavingsGoal {
  id: string;
  familyId: string;
  title: string;
  type: GoalType;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  monthlyTarget: number;
  priority: 'low' | 'medium' | 'high';
  isShared: boolean;
  status: 'in_progress' | 'completed' | 'paused';
  icon: string;
  color: string;
  contributions: SavingsContribution[];
}

export interface RecurringPayment {
  id: string;
  name: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  category: string;
  accountId: string;
  accountNickname: string;
  nextDueDate: string;
  isShared: boolean;
  status: 'active' | 'paused' | 'cancelled';
  ownerName: string;
  notes?: string;
  priceChanged?: boolean;
  previousPrice?: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  amount: number;
  date: string;
  type: 'salary' | 'emi' | 'rent' | 'utility' | 'credit_card' | 'subscription' | 'savings';
  responsibleMember: string;
  isShared: boolean;
  status: 'upcoming' | 'paid' | 'overdue';
  accountId?: string;
}

export type NotificationType = 
  | 'expense_recorded'
  | 'income_received'
  | 'emi_deducted'
  | 'emi_overdue'
  | 'budget_warning'
  | 'budget_exceeded'
  | 'large_expense'
  | 'upcoming_bill'
  | 'goal_achieved'
  | 'family_invite';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  amount?: number;
  description: string;
  timestamp: string;
  isRead: boolean;
  recipientId: string;
  isShared: boolean;
  actionUrl?: string;
  category?: string;
  statusBadge?: string;
}

export interface FamilyChallenge {
  id: string;
  familyId: string;
  title: string;
  description: string;
  targetMetric: string; // e.g. "Save ₹5,000 this month"
  currentProgress: number; // percentage 0-100
  targetValue: number;
  currentValue: number;
  deadline: string;
  participants: string[];
  status: 'active' | 'completed' | 'upcoming';
  rewardBadge: string;
  celebrated?: boolean;
}

export interface AIInsight {
  id: string;
  type: 'warning' | 'tip' | 'forecast' | 'celebration';
  title: string;
  message: string;
  timestamp: string;
  metric?: string;
  actionLabel?: string;
  actionRoute?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  dataScope?: string; // e.g. "Family (Shared) - Nov 2026"
  charts?: {
    type: 'pie' | 'bar';
    data: { name: string; value: number }[];
  };
  recommendations?: string[];
  suggestedActions?: { label: string; route: string }[];
}

