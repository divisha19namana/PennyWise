namespace PennyWise.Core.Enums;

public enum FamilyRole
{
    FamilyAdmin = 1,
    FinanceManager = 2,
    AdultMember = 3,
    Dependent = 4
}

public enum AccountType
{
    Savings = 1,
    Current = 2,
    CashWallet = 3,
    UpiLinked = 4,
    CreditCard = 5
}

public enum CategoryType
{
    Expense = 1,
    Income = 2
}

public enum TransactionType
{
    Expense = 1,
    Income = 2,
    Transfer = 3
}

public enum TransactionStatus
{
    Completed = 1,
    Pending = 2,
    Failed = 3,
    Reversed = 4
}

public enum TransactionSourceType
{
    Manual = 1,
    SMS = 2,
    UpiSync = 3,
    Imported = 4
}

public enum LoanType
{
    Home = 1,
    Personal = 2,
    Car = 3,
    Education = 4,
    Gold = 5,
    Other = 6
}

public enum GoalType
{
    Vacation = 1,
    Emergency = 2,
    Vehicle = 3,
    Home = 4,
    Education = 5,
    Personal = 6,
    Custom = 7
}

public enum NotificationType
{
    ExpenseRecorded = 1,
    IncomeReceived = 2,
    EmiDeducted = 3,
    EmiOverdue = 4,
    BudgetWarning = 5,
    BudgetExceeded = 6,
    LargeExpense = 7,
    UpcomingBill = 8,
    GoalAchieved = 9,
    FamilyInvite = 10
}

