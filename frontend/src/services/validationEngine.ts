// Centralized PennyWise Financial Validation & Calculation Engine

import { Transaction, MonthlyBudget, NotificationItem, Account, User } from '../types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  isPotentialDuplicate?: boolean;
}

export interface BudgetUpdateResult {
  updatedBudget: MonthlyBudget;
  newAlerts: NotificationItem[];
}

export class FinancialValidationEngine {
  /**
   * Validates any financial transaction before ingestion or persistence
   */
  public static validateTransaction(
    tx: Partial<Transaction>, 
    existingTransactions: Transaction[], 
    accounts: Account[],
    currentUser: User
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let isPotentialDuplicate = false;

    // 1. Amount validation
    if (!tx.amount || tx.amount <= 0) {
      errors.push("Amount must be greater than zero.");
    }
    if (tx.amount && tx.amount > 10000000) {
      warnings.push("Unusually large transaction amount. Please double check.");
    }

    // 2. Account verification
    if (!tx.accountId) {
      errors.push("An account must be selected.");
    } else {
      const account = accounts.find(a => a.id === tx.accountId);
      if (!account) {
        errors.push("Selected account does not exist.");
      } else if (!account.isShared && account.userId !== currentUser.id && currentUser.role !== 'FamilyAdmin') {
        errors.push("You are not authorized to transact using this personal account.");
      }
    }

    // 3. Date validation
    if (!tx.date) {
      errors.push("Transaction date is required.");
    } else {
      const txDate = new Date(tx.date);
      const now = new Date();
      // Allow future dates only for pending / scheduled reminders, not completed
      if (tx.status === 'completed' && txDate.getTime() > now.getTime() + 60000) {
        errors.push("Completed transaction date cannot be in the future.");
      }
    }

    // 4. Category validation
    if (tx.type !== 'transfer' && !tx.category) {
      errors.push("Category is required for income and expense transactions.");
    }

    // 5. Transfer specific validations
    if (tx.type === 'transfer') {
      if (!tx.toAccountId) {
        errors.push("Destination account is required for transfers.");
      } else if (tx.accountId === tx.toAccountId) {
        errors.push("Source and destination accounts must be different.");
      }
    }

    // 6. Duplicate detection engine:
    // Match reference number OR exact (account + amount + merchant + same day)
    if (tx.amount && tx.accountId && tx.merchant && tx.date) {
      const txDateStr = new Date(tx.date).toISOString().split('T')[0];
      const match = existingTransactions.find(t => {
        if (tx.id && t.id === tx.id) return false; // same transaction during edit
        if (tx.referenceNumber && t.referenceNumber && tx.referenceNumber === t.referenceNumber) {
          return true;
        }
        const tDateStr = new Date(t.date).toISOString().split('T')[0];
        return (
          t.accountId === tx.accountId &&
          Math.abs(t.amount - (tx.amount || 0)) < 0.01 &&
          t.merchant.toLowerCase().trim() === (tx.merchant || '').toLowerCase().trim() &&
          tDateStr === txDateStr
        );
      });

      if (match) {
        isPotentialDuplicate = true;
        warnings.push(`Potential duplicate detected! Matches previous transaction #${match.id} (${match.merchant} for ₹${match.amount}).`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      isPotentialDuplicate,
    };
  }

  /**
   * Calculates actual eligible expense totals strictly excluding self-transfers,
   * failed payments, and ATM cash transfers to prevent budget inflation.
   */
  public static calculateEligibleExpenses(transactions: Transaction[]): number {
    return transactions
      .filter(t => 
        t.type === 'expense' && 
        t.status === 'completed' &&
        t.category !== 'Internal Transfer' &&
        t.category !== 'Cash Withdrawal'
      )
      .reduce((sum, t) => sum + t.amount, 0);
  }

  /**
   * Calculates actual eligible income strictly excluding self-transfers and reversals.
   */
  public static calculateEligibleIncome(transactions: Transaction[], userIsAdminOrShared: boolean, currentUserId: string): number {
    return transactions
      .filter(t => {
        if (t.type !== 'income' || t.status !== 'completed') return false;
        if (t.category === 'Internal Transfer') return false;
        // Privacy rule: Only show shared income OR user's own income
        if (!t.isShared && t.userId !== currentUserId && !userIsAdminOrShared) return false;
        return true;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  }

  /**
   * Recalculates budget categories and emits alerts when threshold is crossed
   */
  public static evaluateBudgetWithTransaction(
    budget: MonthlyBudget, 
    newTx: Transaction,
    allTransactions: Transaction[]
  ): BudgetUpdateResult {
    // Only completed expenses affect budget
    if (newTx.type !== 'expense' || newTx.status !== 'completed' || newTx.category === 'Internal Transfer') {
      return { updatedBudget: budget, newAlerts: [] };
    }

    const updatedCategories = budget.categories.map(cat => {
      if (cat.categoryId === newTx.categoryId || cat.categoryName === newTx.category) {
        const spent = cat.spent + newTx.amount;
        return { ...cat, spent };
      }
      return cat;
    });

    const totalSpent = updatedCategories.reduce((sum, c) => sum + c.spent, 0);
    const updatedBudget: MonthlyBudget = {
      ...budget,
      totalSpent,
      categories: updatedCategories,
    };

    const newAlerts: NotificationItem[] = [];
    const targetCategory = updatedCategories.find(c => c.categoryId === newTx.categoryId || c.categoryName === newTx.category);
    
    if (targetCategory && targetCategory.budgetLimit > 0) {
      const percentUsed = (targetCategory.spent / targetCategory.budgetLimit) * 100;
      const prevSpent = targetCategory.spent - newTx.amount;
      const prevPercent = (prevSpent / targetCategory.budgetLimit) * 100;

      // Threshold crossing detection: 50%, 75%, 80%, 90%, 100%, >100%
      if (prevPercent < 50 && percentUsed >= 50 && percentUsed < 75) {
        newAlerts.push({
          id: `alert_${Date.now()}_50`,
          type: 'budget_warning',
          title: `${targetCategory.categoryName} Budget at 50%`,
          description: `You have used 50% of your ${targetCategory.categoryName} budget (₹${targetCategory.spent} of ₹${targetCategory.budgetLimit}).`,
          amount: newTx.amount,
          category: targetCategory.categoryName,
          timestamp: new Date().toISOString(),
          isRead: false,
          recipientId: newTx.userId,
          isShared: newTx.isShared,
          actionUrl: '/budget',
          statusBadge: '50% Used'
        });
      } else if (prevPercent < 75 && percentUsed >= 75 && percentUsed < 80) {
        newAlerts.push({
          id: `alert_${Date.now()}_75`,
          type: 'budget_warning',
          title: `${targetCategory.categoryName} Budget at 75%`,
          description: `You have used 75% of your monthly budget. Watch your spending.`,
          amount: newTx.amount,
          category: targetCategory.categoryName,
          timestamp: new Date().toISOString(),
          isRead: false,
          recipientId: newTx.userId,
          isShared: newTx.isShared,
          actionUrl: '/budget',
          statusBadge: '75% Used'
        });
      } else if (prevPercent < 80 && percentUsed >= 80 && percentUsed < 90) {
        newAlerts.push({
          id: `alert_${Date.now()}_80`,
          type: 'budget_warning',
          title: `${targetCategory.categoryName} Limit Approaching`,
          description: `Your ${targetCategory.categoryName} budget is approaching its limit.`,
          amount: newTx.amount,
          category: targetCategory.categoryName,
          timestamp: new Date().toISOString(),
          isRead: false,
          recipientId: newTx.userId,
          isShared: newTx.isShared,
          actionUrl: '/budget',
          statusBadge: '80% Used'
        });
      } else if (prevPercent < 90 && percentUsed >= 90 && percentUsed < 100) {
        newAlerts.push({
          id: `alert_${Date.now()}_90`,
          type: 'budget_warning',
          title: `Critical Alert: ${targetCategory.categoryName}`,
          description: `Warning! Only 10% of your budget remains.`,
          amount: newTx.amount,
          category: targetCategory.categoryName,
          timestamp: new Date().toISOString(),
          isRead: false,
          recipientId: newTx.userId,
          isShared: newTx.isShared,
          actionUrl: '/budget',
          statusBadge: '90% Warning'
        });
      } else if (prevPercent < 100 && percentUsed >= 100) {
        newAlerts.push({
          id: `alert_${Date.now()}_100`,
          type: 'budget_exceeded',
          title: `${targetCategory.categoryName} Limit Reached`,
          description: `You have reached your monthly budget limit.`,
          amount: newTx.amount,
          category: targetCategory.categoryName,
          timestamp: new Date().toISOString(),
          isRead: false,
          recipientId: newTx.userId,
          isShared: newTx.isShared,
          actionUrl: '/budget',
          statusBadge: '100% Limit'
        });
      } else if (percentUsed > 100) {
        const excess = targetCategory.spent - targetCategory.budgetLimit;
        newAlerts.push({
          id: `alert_${Date.now()}_excess`,
          type: 'budget_exceeded',
          title: `Budget Exceeded for ${targetCategory.categoryName}`,
          description: `You exceeded your ${targetCategory.categoryName} budget by ₹${excess.toLocaleString('en-IN')}.`,
          amount: excess,
          category: targetCategory.categoryName,
          timestamp: new Date().toISOString(),
          isRead: false,
          recipientId: newTx.userId,
          isShared: newTx.isShared,
          actionUrl: '/budget',
          statusBadge: 'Over Budget'
        });
      }
    }

    return { updatedBudget, newAlerts };
  }
}

