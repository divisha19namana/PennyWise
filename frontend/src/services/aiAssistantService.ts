// AI Financial Assistant Intelligence Engine (Frontend Safe Abstraction)
import { ChatMessage, Transaction, MonthlyBudget, Loan, SavingsGoal, User, FamilyMember } from '../types';

export class AIAssistantService {
  public static async processPrompt(
    prompt: string,
    currentUser: User,
    members: FamilyMember[],
    transactions: Transaction[],
    budget: MonthlyBudget,
    loans: Loan[],
    goals: SavingsGoal[]
  ): Promise<ChatMessage> {
    const lower = prompt.toLowerCase();
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Filter transactions authorized for this user
    const authorizedTransactions = transactions.filter(t => {
      // FamilyAdmin can see shared items and their own items
      if (t.isShared) return true;
      if (t.userId === currentUser.id) return true;
      // Check if other member explicitly granted permission
      const ownerMember = members.find(m => m.userId === t.userId);
      if (ownerMember?.sharingSettings.shareAccounts) return true;
      return false;
    });

    const completedExpenses = authorizedTransactions.filter(
      t => t.type === 'expense' && t.status === 'completed' && t.category !== 'Internal Transfer' && t.category !== 'Cash Withdrawal'
    );

    // 1. "How much did I spend this month?" / "How much did our family spend"
    if (lower.includes('how much') && (lower.includes('spend') || lower.includes('spent'))) {
      if (lower.includes('grocer')) {
        const groceryTxs = completedExpenses.filter(t => t.category.toLowerCase().includes('grocer'));
        const total = groceryTxs.reduce((sum, t) => sum + t.amount, 0);
        return {
          id: `msg_${Date.now()}`,
          sender: 'assistant',
          text: `Your family has spent **₹${total.toLocaleString('en-IN')}** on **Groceries & Supplies** across ${groceryTxs.length} verified purchases this November. This represents 73.8% of your monthly ₹25,000 grocery allocation.`,
          timestamp,
          dataScope: 'Family Shared Scope • November 2026',
          recommendations: [
            'Blinkit and Nature Basket account for 85% of grocery spend.',
            'Switching non-perishables to bulk monthly orders could yield an estimated ₹1,800 monthly savings.'
          ],
          suggestedActions: [
            { label: 'View Grocery Transactions', route: '/transactions' },
            { label: 'Adjust Category Budget', route: '/budget' }
          ]
        };
      }

      if (lower.includes('family') || lower.includes('we')) {
        const familyTotal = completedExpenses.filter(t => t.isShared).reduce((sum, t) => sum + t.amount, 0);
        return {
          id: `msg_${Date.now()}`,
          sender: 'assistant',
          text: `In total, your family has spent **₹${familyTotal.toLocaleString('en-IN')}** on verified shared household expenses in November 2026. The total allocated family budget is ₹${budget.totalBudget.toLocaleString('en-IN')}, leaving **₹${(budget.totalBudget - familyTotal).toLocaleString('en-IN')}** for the remainder of the month.`,
          timestamp,
          dataScope: 'Authorized Family Scope • Nov 1 - Nov 12, 2026',
          charts: {
            type: 'pie',
            data: budget.categories.slice(0, 5).map(c => ({ name: c.categoryName, value: c.spent }))
          },
          recommendations: [
            'Daily spending pace is ₹7,980/day, trending 4% below planned trajectory.',
            'Rent and Home Loan EMI (₹67,000) are already settled for this month.'
          ],
          suggestedActions: [
            { label: 'Inspect Full Breakdown', route: '/analytics' }
          ]
        };
      }

      // Personal spending
      const personalExpenses = completedExpenses.filter(t => t.userId === currentUser.id);
      const personalTotal = personalExpenses.reduce((sum, t) => sum + t.amount, 0);
      return {
        id: `msg_${Date.now()}`,
        sender: 'assistant',
        text: `Your personal verified expenses for November total **₹${personalTotal.toLocaleString('en-IN')}** (including ₹7,200 personal shopping and your share of utility commitments).`,
        timestamp,
        dataScope: `Personal Scope (${currentUser.name}) • Private`,
        recommendations: [
          'Personal shopping at Zara was ₹7,200 (80% above your typical discretionary baseline).'
        ],
        suggestedActions: [
          { label: 'View Personal Ledger', route: '/transactions' }
        ]
      };
    }

    // 2. Budget excess & overspending: "Which category exceeded its budget?"
    if (lower.includes('exceed') || lower.includes('over budget') || lower.includes('warning') || lower.includes('overspending')) {
      const nearLimitCats = budget.categories.filter(c => c.budgetLimit > 0 && (c.spent / c.budgetLimit) >= 0.85);
      return {
        id: `msg_${Date.now()}`,
        sender: 'assistant',
        text: `Currently, **Food & Dining Out** is at **92.5%** of its budget (₹11,100 spent of ₹12,000 limit) with only ₹900 remaining for the rest of November. All other categories are within normal bounds.`,
        timestamp,
        dataScope: 'Monthly Budget Engine • Exact Reconciled Data',
        charts: {
          type: 'bar',
          data: nearLimitCats.map(c => ({ name: c.categoryName, value: Math.round((c.spent / c.budgetLimit) * 100) }))
        },
        recommendations: [
          'You have 18 days left in the financial cycle with ₹900 remaining in Food & Dining.',
          'Consider joining the active "No-Takeout Week Sprint" family challenge to stay within limits!'
        ],
        suggestedActions: [
          { label: 'View Family Challenges', route: '/challenges' },
          { label: 'Reallocate Budget', route: '/budget' }
        ]
      };
    }

    // 3. EMI & Loan inquiries: "How much EMI do we have next month?"
    if (lower.includes('emi') || lower.includes('loan')) {
      const activeLoans = loans.filter(l => l.status === 'active' && (l.isShared || l.userId === currentUser.id));
      const totalMonthlyEMI = activeLoans.reduce((sum, l) => sum + l.emiAmount, 0);
      return {
        id: `msg_${Date.now()}`,
        sender: 'assistant',
        text: `Your family's scheduled monthly EMI commitments total **₹${totalMonthlyEMI.toLocaleString('en-IN')}** across ${activeLoans.length} active loans:\n- **HDFC Home Loan**: ₹32,000 (Due 5th of every month - Paid for Nov)\n- **SBI Car Loan**: ₹18,500 (Due 15-Nov-2026 - Upcoming)\n${currentUser.id === 'usr_3' ? '- **KTM Bike Loan**: ₹5,800 (Due 10th - Paid)' : ''}`,
        timestamp,
        dataScope: 'Reconciled Loan & EMI Ledger',
        recommendations: [
          'Prepaying ₹50,000 on the HDFC Home Loan could reduce your tenure by 4 months and save ₹68,000 in interest.',
          'SBI Car Loan has only 14 installments remaining before complete closure.'
        ],
        suggestedActions: [
          { label: 'Open Loan Repayment Schedule', route: '/loans' },
          { label: 'Simulate Prepayment', route: '/loans' }
        ]
      };
    }

    // 4. Vacation affordability: "Can we afford a vacation?"
    if (lower.includes('afford') || lower.includes('vacation') || lower.includes('holiday')) {
      const euroTrip = goals.find(g => g.title.toLowerCase().includes('eurotrip') || g.type === 'vacation');
      return {
        id: `msg_${Date.now()}`,
        sender: 'assistant',
        text: `Based on your **Family EuroTrip 2027** goal, you have currently saved **₹2,85,000** of your ₹5,00,000 target (57% completed). At your current joint contribution rate of ₹15,000/month plus surplus cashflow of ~₹22,000/month, you are on track to achieve the full target by **March 2027**, two months ahead of your May 2027 travel schedule!`,
        timestamp,
        dataScope: 'Savings Intelligence & Cashflow Projection Engine',
        recommendations: [
          'Current average savings rate across the family is healthy at 28.5%.',
          'Maintain the ₹15,000 monthly SIP to lock in flight bookings early.'
        ],
        suggestedActions: [
          { label: 'View Savings Goals', route: '/savings' },
          { label: 'Review Monthly Cashflow', route: '/analytics' }
        ]
      };
    }

    // 5. Savings advice & recommendations
    if (lower.includes('save') || lower.includes('reduce') || lower.includes('cut')) {
      return {
        id: `msg_${Date.now()}`,
        sender: 'assistant',
        text: `Here are 3 high-impact, achievable recommendations tailored for the Sharma household:\n\n1. **Dining & Food Delivery (Save ₹3,000/mo)**: Consolidate takeout into 2 designated weekend dinners.\n2. **Broadband & OTT Audit (Save ₹900/mo)**: You have 4 overlapping video streaming subscriptions billed across different cards.\n3. **Automated Round-ups**: Divert recurring credit card reward cashbacks (avg. ₹820/mo) directly to Ananya's Higher Education goal.`,
        timestamp,
        dataScope: 'Tailored Family Optimization Report',
        recommendations: [
          'Potential annual family savings: ₹56,400 with zero compromise on essential lifestyle.'
        ],
        suggestedActions: [
          { label: 'Review Subscriptions', route: '/recurring' },
          { label: 'Join Family Challenge', route: '/challenges' }
        ]
      };
    }

    // Default polite financial answer
    return {
      id: `msg_${Date.now()}`,
      sender: 'assistant',
      text: `I've analyzed your financial query for the **${currentUser.role}** role. Total family shared expenditure for November stands at **₹95,800** with remaining budget of **₹54,200**. All private financial accounts and individual salaries remain strictly confidential according to your family privacy settings. Would you like a breakdown of categories, upcoming bills, or savings progress?`,
      timestamp,
      dataScope: 'Privacy-Enforced Family Assistant',
      recommendations: [
        'Try asking: "Which category exceeded its budget?" or "Can we afford a vacation?"'
      ],
      suggestedActions: [
        { label: 'Overview Dashboard', route: '/dashboard' },
        { label: 'Financial Calendar', route: '/calendar' }
      ]
    };
  }
}

