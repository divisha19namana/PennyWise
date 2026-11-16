// PennyWise Central API Client
// Connects frontend directly to ASP.NET Core Web API (http://localhost:5191/api)

import { 
  Transaction, Account, Category, MonthlyBudget, Loan, 
  SavingsGoal, RecurringPayment, DetectedMessage 
} from '../types';

const API_BASE_URL = 'http://localhost:5191/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {})
      },
      ...options
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${res.status} ${res.statusText}`);
    }

    if (res.status === 204) {
      return {} as T;
    }

    return await res.json();
  } catch (err: any) {
    console.warn(`[PennyWise API] Request to ${endpoint} failed:`, err.message);
    throw err;
  }
}

export const api = {
  // Transactions
  transactions: {
    getAll: async (familyId?: string, currentUserId?: string): Promise<Transaction[]> => {
      const params = new URLSearchParams();
      if (familyId) params.append('familyId', familyId);
      if (currentUserId) params.append('currentUserId', currentUserId);
      const query = params.toString() ? `?${params.toString()}` : '';
      return request<Transaction[]>(`/transactions${query}`);
    },

    create: async (tx: Partial<Transaction>, userId?: string): Promise<{ transaction: Transaction; budgetAlerts: any[]; validation: any }> => {
      const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
      return request(`/transactions${query}`, {
        method: 'POST',
        body: JSON.stringify(tx)
      });
    },

    transfer: async (fromAccountId: string, toAccountId: string, amount: number, note?: string, userId?: string): Promise<Transaction> => {
      const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
      return request<Transaction>(`/transactions/transfer${query}`, {
        method: 'POST',
        body: JSON.stringify({ fromAccountId, toAccountId, amount, note: note || '' })
      });
    },

    delete: async (id: string): Promise<void> => {
      return request<void>(`/transactions/${id}`, {
        method: 'DELETE'
      });
    }
  },

  // Accounts
  accounts: {
    getAll: async (familyId?: string, userId?: string): Promise<Account[]> => {
      const params = new URLSearchParams();
      if (familyId) params.append('familyId', familyId);
      if (userId) params.append('userId', userId);
      const query = params.toString() ? `?${params.toString()}` : '';
      return request<Account[]>(`/accounts${query}`);
    },

    create: async (account: Partial<Account>): Promise<Account> => {
      return request<Account>('/accounts', {
        method: 'POST',
        body: JSON.stringify(account)
      });
    },

    update: async (id: string, account: Partial<Account>): Promise<Account> => {
      return request<Account>(`/accounts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(account)
      });
    }
  },

  // Categories
  categories: {
    getAll: async (): Promise<Category[]> => {
      return request<Category[]>('/categories');
    },

    create: async (category: Partial<Category>): Promise<Category> => {
      return request<Category>('/categories', {
        method: 'POST',
        body: JSON.stringify(category)
      });
    },

    update: async (id: string, category: Partial<Category>): Promise<Category> => {
      return request<Category>(`/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(category)
      });
    },

    delete: async (id: string): Promise<void> => {
      return request<void>(`/categories/${id}`, {
        method: 'DELETE'
      });
    }
  },

  // Budgets
  budgets: {
    get: async (id: string = 'bgt_nov_2026'): Promise<MonthlyBudget> => {
      return request<MonthlyBudget>(`/budgets/${id}`);
    },

    updateCategoryLimit: async (budgetId: string, categoryId: string, newLimit: number): Promise<any> => {
      return request(`/budgets/${budgetId}/categories/${categoryId}`, {
        method: 'PUT',
        body: JSON.stringify({ newLimit })
      });
    }
  },

  // Loans & EMIs
  loans: {
    getAll: async (familyId?: string): Promise<Loan[]> => {
      const query = familyId ? `?familyId=${encodeURIComponent(familyId)}` : '';
      return request<Loan[]>(`/loans${query}`);
    },

    create: async (loan: Partial<Loan>): Promise<Loan> => {
      return request<Loan>('/loans', {
        method: 'POST',
        body: JSON.stringify(loan)
      });
    },

    payEmi: async (id: string): Promise<{ loan: Loan; transaction: Transaction }> => {
      return request(`/loans/${id}/pay-emi`, {
        method: 'POST'
      });
    },

    getAmortization: async (id: string): Promise<any[]> => {
      return request<any[]>(`/loans/${id}/amortization`);
    },

    simulatePrepayment: async (id: string, prepaymentAmount: number): Promise<any> => {
      return request(`/loans/${id}/simulate-prepayment`, {
        method: 'POST',
        body: JSON.stringify({ prepaymentAmount })
      });
    }
  },

  // Savings Goals
  savings: {
    getAll: async (familyId?: string): Promise<SavingsGoal[]> => {
      const query = familyId ? `?familyId=${encodeURIComponent(familyId)}` : '';
      return request<SavingsGoal[]>(`/savings${query}`);
    },

    create: async (goal: Partial<SavingsGoal>): Promise<SavingsGoal> => {
      return request<SavingsGoal>('/savings', {
        method: 'POST',
        body: JSON.stringify(goal)
      });
    },

    contribute: async (id: string, payload: { userId: string; userName: string; amount: number; fromAccountId: string; note?: string }): Promise<{ goal: SavingsGoal; contribution: any }> => {
      return request(`/savings/${id}/contribute`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    }
  },

  // Recurring Payments
  recurring: {
    getAll: async (): Promise<RecurringPayment[]> => {
      return request<RecurringPayment[]>('/recurring');
    },

    create: async (item: Partial<RecurringPayment>): Promise<RecurringPayment> => {
      return request<RecurringPayment>('/recurring', {
        method: 'POST',
        body: JSON.stringify(item)
      });
    },

    toggle: async (id: string): Promise<RecurringPayment> => {
      return request<RecurringPayment>(`/recurring/${id}/toggle`, {
        method: 'PUT'
      });
    }
  },

  // Auto Tracking
  autoTracking: {
    parseMessage: async (rawText: string, source: string = 'Android SMS'): Promise<DetectedMessage> => {
      return request<DetectedMessage>('/autotracking/parse', {
        method: 'POST',
        body: JSON.stringify({ rawText, source })
      });
    }
  },

  // Family Roster
  family: {
    get: async (id: string = 'fam_sharma_01'): Promise<any> => {
      return request(`/family/${id}`);
    },

    invite: async (familyId: string, name: string, email: string, role: string): Promise<any> => {
      return request('/family/invite', {
        method: 'POST',
        body: JSON.stringify({ familyId, name, email, role })
      });
    }
  }
};

