import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Family, FamilyMember, Account, Category, Transaction, 
  DetectedMessage, MonthlyBudget, Loan, SavingsGoal, 
  RecurringPayment, CalendarEvent, FamilyChallenge, AIInsight,
  FamilyPermissions 
} from '../types';
import { 
  INITIAL_FAMILY, INITIAL_MEMBERS, INITIAL_ACCOUNTS, 
  INITIAL_CATEGORIES, INITIAL_TRANSACTIONS, INITIAL_DETECTED_MESSAGES, 
  INITIAL_BUDGET, INITIAL_LOANS, INITIAL_SAVINGS_GOALS, 
  INITIAL_RECURRING, INITIAL_CALENDAR_EVENTS, INITIAL_CHALLENGES, 
  INITIAL_AI_INSIGHTS 
} from '../data/seedData';
import { FinancialValidationEngine, ValidationResult } from '../services/validationEngine';
import { api } from '../services/api';
import { signalRService } from '../services/signalrService';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import confetti from 'canvas-confetti';

interface FamilyContextType {
  family: Family;
  members: FamilyMember[];
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  detectedMessages: DetectedMessage[];
  budget: MonthlyBudget;
  loans: Loan[];
  savingsGoals: SavingsGoal[];
  recurringPayments: RecurringPayment[];
  calendarEvents: CalendarEvent[];
  challenges: FamilyChallenge[];
  aiInsights: AIInsight[];
  isLoadingBackend: boolean;
  
  // Actions
  addTransaction: (tx: Partial<Transaction>) => Promise<{ success: boolean; validation: ValidationResult; transaction?: Transaction }>;
  editTransaction: (id: string, updates: Partial<Transaction>) => { success: boolean; validation: ValidationResult };
  deleteTransaction: (id: string) => Promise<void>;
  transferMoney: (fromAccountId: string, toAccountId: string, amount: number, notes?: string) => Promise<{ success: boolean; error?: string }>;
  confirmDetectedMessage: (msgId: string, overrides?: Partial<Transaction>) => Promise<void>;
  rejectDetectedMessage: (msgId: string) => void;
  
  // Accounts
  addAccount: (account: Omit<Account, 'id' | 'updatedAt'>) => Promise<void>;
  editAccount: (id: string, updates: Partial<Account>) => Promise<void>;
  
  // Categories & Budget
  addCategory: (category: Omit<Category, 'id' | 'spentThisMonth'>) => Promise<void>;
  editCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  mergeCategories: (sourceId: string, targetId: string) => void;
  deleteCategory: (id: string) => Promise<boolean>;
  updateBudgetLimit: (categoryId: string, limit: number) => Promise<void>;
  
  // Savings & Loans
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'currentAmount' | 'contributions'>) => Promise<void>;
  addSavingsContribution: (goalId: string, amount: number, fromAccountId: string, note?: string) => Promise<void>;
  addLoan: (loan: Omit<Loan, 'id' | 'totalInterestPaid' | 'totalPrincipalPaid'>) => Promise<void>;
  recordEMIPayment: (loanId: string) => Promise<void>;
  
  // Recurring & Calendar
  addRecurringPayment: (payment: Omit<RecurringPayment, 'id'>) => Promise<void>;
  toggleRecurringStatus: (id: string) => Promise<void>;
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  markCalendarEventPaid: (id: string) => void;
  
  // Family & Permissions
  updateMemberPermissions: (memberId: string, permissions: FamilyPermissions) => void;
  inviteMember: (email: string, role: string, name: string) => Promise<void>;
  removeMember: (memberId: string) => void;
  
  // Challenges
  contributeToChallenge: (challengeId: string, deltaAmount: number) => void;
  
  // Reload from backend
  refreshData: () => Promise<void>;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export const FamilyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { addNotification, showToast } = useNotifications();
  const [isLoadingBackend, setIsLoadingBackend] = useState<boolean>(true);

  const [family, setFamily] = useState<Family>(INITIAL_FAMILY);
  const [members, setMembers] = useState<FamilyMember[]>(INITIAL_MEMBERS);
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [detectedMessages, setDetectedMessages] = useState<DetectedMessage[]>(INITIAL_DETECTED_MESSAGES);
  const [budget, setBudget] = useState<MonthlyBudget>(INITIAL_BUDGET);
  const [loans, setLoans] = useState<Loan[]>(INITIAL_LOANS);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(INITIAL_SAVINGS_GOALS);
  const [recurringPayments, setRecurringPayments] = useState<RecurringPayment[]>(INITIAL_RECURRING);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(INITIAL_CALENDAR_EVENTS);
  const [challenges, setChallenges] = useState<FamilyChallenge[]>(INITIAL_CHALLENGES);
  const [aiInsights] = useState<AIInsight[]>(INITIAL_AI_INSIGHTS);

  // Load from backend on startup and connect SignalR
  const refreshData = async () => {
    try {
      setIsLoadingBackend(true);
      const [txRes, accRes, catRes, loanRes, savRes, recRes, bgtRes] = await Promise.allSettled([
        api.transactions.getAll(family.id, currentUser.id),
        api.accounts.getAll(family.id, currentUser.id),
        api.categories.getAll(),
        api.loans.getAll(family.id),
        api.savings.getAll(family.id),
        api.recurring.getAll(),
        api.budgets.get(budget.id)
      ]);

      if (txRes.status === 'fulfilled' && txRes.value) {
        // Map backend camelCase or PascalCase to frontend types cleanly
        const mappedTx = txRes.value.map((t: any) => ({
          ...t,
          type: (t.type === 1 || t.type === 'Expense' || t.type === 'expense') ? 'expense' :
                (t.type === 2 || t.type === 'Income' || t.type === 'income') ? 'income' : 'transfer',
          status: (t.status === 1 || t.status === 'Completed' || t.status === 'completed') ? 'completed' : 'pending',
          source: (t.source === 2 || t.source === 'SMS' || t.source === 'sms') ? 'sms' : 'manual'
        }));
        setTransactions(mappedTx);
      }

      if (accRes.status === 'fulfilled' && accRes.value && accRes.value.length > 0) {
        setAccounts(accRes.value);
      }

      if (catRes.status === 'fulfilled' && catRes.value && catRes.value.length > 0) {
        const mappedCats = catRes.value.map((c: any) => ({
          ...c,
          type: (c.type === 1 || c.type === 'Income' || c.type === 'income') ? 'income' : 'expense'
        }));
        setCategories(mappedCats);
      }

      if (loanRes.status === 'fulfilled' && loanRes.value) {
        setLoans(loanRes.value);
      }

      if (savRes.status === 'fulfilled' && savRes.value) {
        setSavingsGoals(savRes.value);
      }

      if (recRes.status === 'fulfilled' && recRes.value) {
        setRecurringPayments(recRes.value);
      }

      if (bgtRes.status === 'fulfilled' && bgtRes.value) {
        setBudget(prev => ({
          ...prev,
          totalBudget: bgtRes.value.totalBudget || prev.totalBudget,
          totalSpent: bgtRes.value.totalSpent || 0,
          categories: bgtRes.value.categories && bgtRes.value.categories.length > 0 ? bgtRes.value.categories : prev.categories
        }));
      }
    } catch (e) {
      console.warn('Backend sync note: Running with local resilience fallback', e);
    } finally {
      setIsLoadingBackend(false);
    }
  };

  useEffect(() => {
    refreshData();

    // Start SignalR connection
    signalRService.connect();

    const unsubTx = signalRService.on('TransactionRecorded', (newTx: any) => {
      showToast('Live Update', `New transaction recorded: ₹${newTx.amount} at ${newTx.merchant}`, 'info');
      refreshData();
    });

    const unsubAlert = signalRService.on('BudgetAlert', (alert: any) => {
      addNotification({
        type: 'budget_warning',
        title: alert.title || 'Budget Threshold Alert',
        description: alert.message || 'Spending limit warning',
        recipientId: currentUser.id,
        isShared: true,
        category: alert.categoryName
      });
      showToast('Budget Alert', alert.message || 'Threshold reached', 'warning');
    });

    return () => {
      unsubTx();
      unsubAlert();
    };
  }, [currentUser.id]);

  // ADD TRANSACTION
  const addTransaction = async (txData: Partial<Transaction>) => {
    const validation = FinancialValidationEngine.validateTransaction(txData, transactions, accounts, currentUser);
    if (!validation.isValid) {
      return { success: false, validation };
    }

    const account = accounts.find(a => a.id === txData.accountId)!;
    const category = categories.find(c => c.id === txData.categoryId || c.name === txData.category);

    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      userId: txData.userId || currentUser.id,
      familyId: family.id,
      userName: txData.userName || currentUser.name,
      accountId: txData.accountId!,
      accountNickname: account.nickname,
      toAccountId: txData.toAccountId,
      toAccountNickname: txData.toAccountId ? accounts.find(a => a.id === txData.toAccountId)?.nickname : undefined,
      type: txData.type || 'expense',
      amount: txData.amount!,
      category: category ? category.name : (txData.category || 'Other'),
      categoryId: category ? category.id : (txData.categoryId || 'cat_other_exp'),
      merchant: txData.merchant || 'General Payment',
      description: txData.description || '',
      date: txData.date || new Date().toISOString(),
      status: txData.status || 'completed',
      isShared: txData.isShared !== undefined ? txData.isShared : true,
      source: txData.source || 'manual',
      paymentMethod: txData.paymentMethod || 'UPI',
      referenceNumber: txData.referenceNumber || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      receiptUrl: txData.receiptUrl,
      notes: txData.notes,
    };

    // Update account balance locally
    setAccounts(prevAccounts => prevAccounts.map(acc => {
      if (acc.id === newTx.accountId) {
        if (newTx.type === 'expense') {
          return { ...acc, currentBalance: acc.currentBalance - newTx.amount, updatedAt: new Date().toISOString() };
        } else if (newTx.type === 'income') {
          return { ...acc, currentBalance: acc.currentBalance + newTx.amount, updatedAt: new Date().toISOString() };
        } else if (newTx.type === 'transfer') {
          return { ...acc, currentBalance: acc.currentBalance - newTx.amount, updatedAt: new Date().toISOString() };
        }
      }
      if (newTx.type === 'transfer' && acc.id === newTx.toAccountId) {
        return { ...acc, currentBalance: acc.currentBalance + newTx.amount, updatedAt: new Date().toISOString() };
      }
      return acc;
    }));

    // Update Budget and trigger alerts if completed expense
    if (newTx.type === 'expense' && newTx.status === 'completed' && newTx.category !== 'Internal Transfer') {
      const budgetRes = FinancialValidationEngine.evaluateBudgetWithTransaction(budget, newTx, transactions);
      setBudget(budgetRes.updatedBudget);
      budgetRes.newAlerts.forEach(alert => addNotification(alert));
    }

    setTransactions(prev => [newTx, ...prev]);

    // Send to ASP.NET Core backend API
    try {
      await api.transactions.create(newTx, currentUser.id);
    } catch (e) {
      console.warn('Transaction stored locally; backend sync pending');
    }

    // Send transaction notification
    if (newTx.type === 'expense') {
      const remaining = budget.totalBudget - (budget.totalSpent + newTx.amount);
      addNotification({
        type: 'expense_recorded',
        title: 'Expense Recorded',
        amount: newTx.amount,
        description: `₹${newTx.amount.toLocaleString('en-IN')} spent on ${newTx.category}. Remaining budget: ₹${remaining.toLocaleString('en-IN')}.`,
        recipientId: newTx.userId,
        isShared: newTx.isShared,
        actionUrl: '/transactions',
        category: newTx.category,
      });
      showToast('Expense Recorded', `Added ₹${newTx.amount.toLocaleString('en-IN')} for ${newTx.merchant}.`, 'success');
    } else if (newTx.type === 'income') {
      addNotification({
        type: 'income_received',
        title: 'Income Received',
        amount: newTx.amount,
        description: `₹${newTx.amount.toLocaleString('en-IN')} income received from ${newTx.merchant}.`,
        recipientId: newTx.userId,
        isShared: newTx.isShared,
        actionUrl: '/income',
      });
      showToast('Income Logged', `Credited ₹${newTx.amount.toLocaleString('en-IN')} from ${newTx.merchant}.`, 'success');
    }

    return { success: true, validation, transaction: newTx };
  };

  // EDIT TRANSACTION
  const editTransaction = (id: string, updates: Partial<Transaction>) => {
    const existing = transactions.find(t => t.id === id);
    if (!existing) return { success: false, validation: { isValid: false, errors: ['Transaction not found'], warnings: [] } };

    const validation = FinancialValidationEngine.validateTransaction({ ...existing, ...updates }, transactions, accounts, currentUser);
    if (!validation.isValid) {
      return { success: false, validation };
    }

    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    showToast('Transaction Updated', 'Changes have been saved successfully.', 'success');
    return { success: true, validation };
  };

  // DELETE TRANSACTION
  const deleteTransaction = async (id: string) => {
    const existing = transactions.find(t => t.id === id);
    if (!existing) return;

    // Reverse balance
    setAccounts(prevAccounts => prevAccounts.map(acc => {
      let balance = acc.currentBalance;
      if (acc.id === existing.accountId) {
        if (existing.type === 'expense' || existing.type === 'transfer') balance += existing.amount;
        if (existing.type === 'income') balance -= existing.amount;
      }
      if (existing.type === 'transfer' && acc.id === existing.toAccountId) {
        balance -= existing.amount;
      }
      return { ...acc, currentBalance: balance };
    }));

    setTransactions(prev => prev.filter(t => t.id !== id));

    try {
      await api.transactions.delete(id);
    } catch (e) {
      console.warn('Backend delete synced locally');
    }

    showToast('Transaction Deleted', 'Transaction removed and balances restored.', 'info');
  };

  // SELF TRANSFER
  const transferMoney = async (fromAccountId: string, toAccountId: string, amount: number, notes?: string) => {
    if (amount <= 0) return { success: false, error: 'Amount must be greater than zero.' };
    if (fromAccountId === toAccountId) return { success: false, error: 'Source and destination accounts must be different.' };

    const fromAcc = accounts.find(a => a.id === fromAccountId);
    const toAcc = accounts.find(a => a.id === toAccountId);
    if (!fromAcc || !toAcc) return { success: false, error: 'Account not found.' };

    if (fromAcc.currentBalance < amount && fromAcc.accountType !== 'credit_card') {
      return { success: false, error: `Insufficient balance in ${fromAcc.nickname}. Current: ₹${fromAcc.currentBalance}` };
    }

    await addTransaction({
      type: 'transfer',
      amount,
      accountId: fromAccountId,
      toAccountId: toAccountId,
      category: 'Internal Transfer',
      merchant: `Transfer to ${toAcc.nickname}`,
      description: notes || `Internal transfer between ${fromAcc.nickname} and ${toAcc.nickname}`,
      status: 'completed',
      isShared: true,
      paymentMethod: 'Self Account Transfer',
      notes: 'Exempt from expense/income calculations since it is self-transfer',
    });

    try {
      await api.transactions.transfer(fromAccountId, toAccountId, amount, notes, currentUser.id);
    } catch (e) {
      console.warn('Transfer sync note');
    }

    showToast('Transfer Completed', `Transferred ₹${amount.toLocaleString('en-IN')} to ${toAcc.nickname}.`, 'success');
    return { success: true };
  };

  // DETECTED MESSAGES
  const confirmDetectedMessage = async (msgId: string, overrides?: Partial<Transaction>) => {
    const msg = detectedMessages.find(m => m.id === msgId);
    if (!msg) return;

    const matchedAccount = accounts.find(a => a.nickname.includes(msg.accountNickname) || a.maskedNumber.includes(msg.accountLast4)) || accounts[0];
    const category = categories.find(c => c.name.toLowerCase() === msg.suggestedCategory.toLowerCase()) || categories[0];

    const result = await addTransaction({
      type: msg.transactionType === 'debit' ? 'expense' : 'income',
      amount: msg.extractedAmount,
      accountId: matchedAccount.id,
      category: category.name,
      categoryId: category.id,
      merchant: msg.merchant,
      description: `Parsed from ${msg.source}: ${msg.merchant}`,
      date: msg.receivedAt,
      status: 'completed',
      isShared: true,
      source: 'sms',
      paymentMethod: msg.paymentMethod,
      referenceNumber: msg.referenceNo,
      ...overrides
    });

    if (result.success) {
      setDetectedMessages(prev => prev.map(m => m.id === msgId ? { ...m, reviewStatus: 'confirmed' } : m));
      showToast('Transaction Confirmed', `Verified and added ₹${msg.extractedAmount} from ${msg.merchant}.`, 'success');
    }
  };

  const rejectDetectedMessage = (msgId: string) => {
    setDetectedMessages(prev => prev.map(m => m.id === msgId ? { ...m, reviewStatus: 'rejected' } : m));
    showToast('Message Dismissed', 'Detected transaction was rejected and will not affect balances.', 'info');
  };

  // ACCOUNTS
  const addAccount = async (accData: Omit<Account, 'id' | 'updatedAt'>) => {
    const newAcc: Account = {
      ...accData,
      id: `acc_${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    setAccounts(prev => [...prev, newAcc]);

    try {
      await api.accounts.create(newAcc);
    } catch (e) {
      console.warn('Account saved locally');
    }

    showToast('Account Added', `${newAcc.nickname} added to your account list.`, 'success');
  };

  const editAccount = async (id: string, updates: Partial<Account>) => {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a));
    try {
      await api.accounts.update(id, updates);
    } catch (e) {
      console.warn('Account update synced locally');
    }
    showToast('Account Updated', 'Account details saved.', 'success');
  };

  // CATEGORIES
  const addCategory = async (catData: Omit<Category, 'id' | 'spentThisMonth'>) => {
    const newCat: Category = {
      ...catData,
      id: `cat_${Date.now()}`,
      spentThisMonth: 0,
    };
    setCategories(prev => [...prev, newCat]);

    try {
      await api.categories.create(newCat);
    } catch (e) {
      console.warn('Category saved locally');
    }

    showToast('Category Created', `${newCat.name} is ready for budgeting.`, 'success');
  };

  const editCategory = async (id: string, updates: Partial<Category>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    try {
      await api.categories.update(id, updates);
    } catch (e) {
      console.warn('Category update synced locally');
    }
  };

  const mergeCategories = (sourceId: string, targetId: string) => {
    const target = categories.find(c => c.id === targetId);
    if (!target) return;

    setTransactions(prev => prev.map(t => {
      if (t.categoryId === sourceId) {
        return { ...t, categoryId: targetId, category: target.name };
      }
      return t;
    }));

    setCategories(prev => prev.filter(c => c.id !== sourceId));
    showToast('Categories Merged', `Transactions merged into ${target.name}.`, 'success');
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
    const hasTransactions = transactions.some(t => t.categoryId === id);
    if (hasTransactions) {
      showToast('Cannot Delete', 'This category contains existing transactions. Please reassign or merge them first.', 'error');
      return false;
    }
    setCategories(prev => prev.filter(c => c.id !== id));

    try {
      await api.categories.delete(id);
    } catch (e) {
      console.warn('Category delete synced locally');
    }

    showToast('Category Deleted', 'Category removed successfully.', 'info');
    return true;
  };

  const updateBudgetLimit = async (categoryId: string, limit: number) => {
    setBudget(prev => {
      const updatedCategories = prev.categories.map(c => c.categoryId === categoryId ? { ...c, budgetLimit: limit } : c);
      const totalBudget = updatedCategories.reduce((sum, c) => sum + c.budgetLimit, 0);
      return { ...prev, totalBudget, categories: updatedCategories };
    });
    setCategories(prev => prev.map(c => c.id === categoryId ? { ...c, monthlyBudget: limit } : c));

    try {
      await api.budgets.updateCategoryLimit(budget.id, categoryId, limit);
    } catch (e) {
      console.warn('Budget limit saved locally');
    }

    showToast('Budget Updated', 'Category spending target updated.', 'success');
  };

  // SAVINGS
  const addSavingsGoal = async (goalData: Omit<SavingsGoal, 'id' | 'currentAmount' | 'contributions'>) => {
    const newGoal: SavingsGoal = {
      ...goalData,
      id: `goal_${Date.now()}`,
      currentAmount: 0,
      contributions: [],
    };
    setSavingsGoals(prev => [...prev, newGoal]);

    try {
      await api.savings.create(newGoal);
    } catch (e) {
      console.warn('Savings goal saved locally');
    }

    showToast('Goal Created', `Savings goal "${newGoal.title}" started.`, 'success');
  };

  const addSavingsContribution = async (goalId: string, amount: number, fromAccountId: string, note?: string) => {
    const goal = savingsGoals.find(g => g.id === goalId);
    const account = accounts.find(a => a.id === fromAccountId);
    if (!goal || !account) return;

    if (account.currentBalance < amount) {
      showToast('Insufficient Balance', `Cannot contribute ₹${amount} from ${account.nickname}.`, 'error');
      return;
    }

    setAccounts(prev => prev.map(a => a.id === fromAccountId ? { ...a, currentBalance: a.currentBalance - amount } : a));

    const newContrib = {
      id: `contrib_${Date.now()}`,
      goalId,
      userId: currentUser.id,
      userName: currentUser.name,
      amount,
      date: new Date().toISOString(),
      fromAccountId,
      note,
    };

    const newCurrent = goal.currentAmount + amount;
    const isCompleted = newCurrent >= goal.targetAmount;

    setSavingsGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        return {
          ...g,
          currentAmount: newCurrent,
          status: isCompleted ? 'completed' : g.status,
          contributions: [newContrib, ...g.contributions],
        };
      }
      return g;
    }));

    try {
      await api.savings.contribute(goalId, {
        userId: currentUser.id,
        userName: currentUser.name,
        amount,
        fromAccountId,
        note
      });
    } catch (e) {
      console.warn('Contribution recorded locally');
    }

    if (isCompleted) {
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
      addNotification({
        type: 'goal_achieved',
        title: `Goal Achieved: ${goal.title}! 🎉`,
        amount: newCurrent,
        description: `Congratulations! Your family has reached the target for ${goal.title}.`,
        recipientId: currentUser.id,
        isShared: goal.isShared,
        actionUrl: '/savings',
      });
      showToast('Goal Reached!', `Congratulations! ${goal.title} reached 100%!`, 'success');
    } else {
      showToast('Contribution Added', `Added ₹${amount.toLocaleString('en-IN')} to ${goal.title}.`, 'success');
    }
  };

  // LOANS
  const addLoan = async (loanData: Omit<Loan, 'id' | 'totalInterestPaid' | 'totalPrincipalPaid'>) => {
    const newLoan: Loan = {
      ...loanData,
      id: `loan_${Date.now()}`,
      totalInterestPaid: 0,
      totalPrincipalPaid: 0,
    };
    setLoans(prev => [...prev, newLoan]);

    try {
      await api.loans.create(newLoan);
    } catch (e) {
      console.warn('Loan recorded locally');
    }

    showToast('Loan Added', `${newLoan.loanName} registered in your liabilities.`, 'success');
  };

  const recordEMIPayment = async (loanId: string) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) return;

    const account = accounts.find(a => a.id === loan.linkedAccountId) || accounts[0];
    const principalPortion = Math.round(loan.emiAmount * 0.45);
    const interestPortion = loan.emiAmount - principalPortion;

    await addTransaction({
      type: 'expense',
      amount: loan.emiAmount,
      accountId: account.id,
      category: 'EMI & Loans',
      categoryId: 'cat_emi',
      merchant: `${loan.lender} EMI`,
      description: `Monthly EMI deduction for ${loan.loanName}`,
      status: 'completed',
      isShared: loan.isShared,
      paymentMethod: 'Auto Debit (EMI)',
    });

    setLoans(prev => prev.map(l => {
      if (l.id === loanId) {
        return {
          ...l,
          outstandingPrincipal: Math.max(0, l.outstandingPrincipal - principalPortion),
          remainingMonths: Math.max(0, l.remainingMonths - 1),
          totalPrincipalPaid: l.totalPrincipalPaid + principalPortion,
          totalInterestPaid: l.totalInterestPaid + interestPortion,
        };
      }
      return l;
    }));

    try {
      await api.loans.payEmi(loanId);
    } catch (e) {
      console.warn('EMI payment synced locally');
    }

    addNotification({
      type: 'emi_deducted',
      title: 'EMI Paid Successfully',
      amount: loan.emiAmount,
      description: `Your ${loan.loanName} EMI of ₹${loan.emiAmount.toLocaleString('en-IN')} has been successfully paid.`,
      recipientId: loan.userId,
      isShared: loan.isShared,
      actionUrl: '/loans',
      category: 'EMI & Loans',
    });

    showToast('EMI Payment Logged', `Recorded ₹${loan.emiAmount.toLocaleString('en-IN')} for ${loan.loanName}.`, 'success');
  };

  // RECURRING
  const addRecurringPayment = async (paymentData: Omit<RecurringPayment, 'id'>) => {
    const newRec: RecurringPayment = {
      ...paymentData,
      id: `rec_${Date.now()}`,
    };
    setRecurringPayments(prev => [...prev, newRec]);

    try {
      await api.recurring.create(newRec);
    } catch (e) {
      console.warn('Recurring saved locally');
    }

    showToast('Subscription Added', `${newRec.name} reminder set.`, 'success');
  };

  const toggleRecurringStatus = async (id: string) => {
    setRecurringPayments(prev => prev.map(r => {
      if (r.id === id) {
        const nextStatus = r.status === 'active' ? 'paused' : 'active';
        return { ...r, status: nextStatus };
      }
      return r;
    }));

    try {
      await api.recurring.toggle(id);
    } catch (e) {
      console.warn('Recurring toggle synced locally');
    }
  };

  // CALENDAR
  const addCalendarEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: `ev_${Date.now()}`,
    };
    setCalendarEvents(prev => [...prev, newEvent]);
    showToast('Event Scheduled', `${newEvent.title} added to calendar.`, 'success');
  };

  const markCalendarEventPaid = (id: string) => {
    setCalendarEvents(prev => prev.map(e => e.id === id ? { ...e, status: 'paid' } : e));
    showToast('Marked as Paid', 'Calendar event marked completed.', 'success');
  };

  // FAMILY PERMISSIONS
  const updateMemberPermissions = (memberId: string, permissions: FamilyPermissions) => {
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, permissions } : m));
    showToast('Permissions Saved', 'Member role permissions updated.', 'success');
  };

  const inviteMember = async (email: string, role: string, name: string) => {
    const newMember: FamilyMember = {
      id: `mem_${Date.now()}`,
      userId: `usr_${Date.now()}`,
      name,
      email,
      role: role as any,
      avatar: `https://images.unsplash.com/photo-${1535713875002 + Math.floor(Math.random() * 1000)}?w=150&auto=format&fit=crop&q=80`,
      joinedDate: new Date().toISOString().split('T')[0],
      isOnline: false,
      sharedContributionMonth: 0,
      permissions: {
        canViewFamilyBudget: true,
        canEditFamilyBudget: role === 'FinanceManager',
        canViewSharedTransactions: true,
        canAddSharedTransactions: true,
        canManageMembers: false,
        canViewReports: role !== 'Dependent',
        canManageAccounts: false,
        canViewSharedLoans: false,
        canManageSavingsGoals: role !== 'Dependent',
      },
      sharingSettings: {
        shareSalary: false,
        shareAccounts: false,
        shareLoans: false,
      }
    };
    setMembers(prev => [...prev, newMember]);

    try {
      await api.family.invite(family.id, name, email, role);
    } catch (e) {
      console.warn('Invite synced locally');
    }

    showToast('Invitation Sent', `Invitation sent to ${email} as ${role}.`, 'success');
  };

  const removeMember = (memberId: string) => {
    setMembers(prev => prev.filter(m => m.id !== memberId));
    showToast('Member Removed', 'Family member removed from roster.', 'info');
  };

  // CHALLENGES
  const contributeToChallenge = (challengeId: string, deltaAmount: number) => {
    setChallenges(prev => prev.map(ch => {
      if (ch.id === challengeId) {
        const newVal = ch.currentValue + deltaAmount;
        const progress = Math.min(100, Math.round((newVal / ch.targetValue) * 100));
        const isCompleted = progress >= 100;
        if (isCompleted && !ch.celebrated) {
          confetti({ particleCount: 150, spread: 80, origin: { y: 0.5 } });
          showToast('Challenge Conquered! 🏆', `Awesome family teamwork! "${ch.title}" achieved!`, 'success');
        }
        return {
          ...ch,
          currentValue: newVal,
          currentProgress: progress,
          status: isCompleted ? 'completed' : ch.status,
          celebrated: isCompleted ? true : ch.celebrated,
        };
      }
      return ch;
    }));
  };

  return (
    <FamilyContext.Provider value={{
      family,
      members,
      accounts,
      categories,
      transactions,
      detectedMessages,
      budget,
      loans,
      savingsGoals,
      recurringPayments,
      calendarEvents,
      challenges,
      aiInsights,
      isLoadingBackend,
      addTransaction,
      editTransaction,
      deleteTransaction,
      transferMoney,
      confirmDetectedMessage,
      rejectDetectedMessage,
      addAccount,
      editAccount,
      addCategory,
      editCategory,
      mergeCategories,
      deleteCategory,
      updateBudgetLimit,
      addSavingsGoal,
      addSavingsContribution,
      addLoan,
      recordEMIPayment,
      addRecurringPayment,
      toggleRecurringStatus,
      addCalendarEvent,
      markCalendarEventPaid,
      updateMemberPermissions,
      inviteMember,
      removeMember,
      contributeToChallenge,
      refreshData,
    }}>
      {children}
    </FamilyContext.Provider>
  );
};

export const useFamily = () => {
  const context = useContext(FamilyContext);
  if (!context) throw new Error('useFamily must be used within a FamilyProvider');
  return context;
};
