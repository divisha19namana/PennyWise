using Microsoft.EntityFrameworkCore;
using PennyWise.Core.Entities;
using PennyWise.Core.Enums;

namespace PennyWise.Infrastructure.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        await context.Database.EnsureCreatedAsync();

        if (await context.Families.AnyAsync())
        {
            return; // Already initialized
        }

        var familyId = "fam_sharma_01";
        var adminUserId = "usr_1";

        // Initial setup for Sharma Family personas to support role testing
        var adminUser = new User
        {
            Id = adminUserId,
            Name = "Rajesh Sharma",
            Email = "rajesh.sharma@pennywise.app",
            Phone = "+91 98765 43210",
            Avatar = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
            Role = FamilyRole.FamilyAdmin,
            FamilyId = familyId,
            Currency = "₹",
            FinancialMonthStartDay = 1,
            MonthlySalary = 185000m,
            SalaryDate = 1,
            CreatedAt = DateTime.UtcNow
        };

        var managerUser = new User
        {
            Id = "usr_2",
            Name = "Priya Sharma",
            Email = "priya.sharma@pennywise.app",
            Phone = "+91 98765 43211",
            Avatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            Role = FamilyRole.FinanceManager,
            FamilyId = familyId,
            Currency = "₹",
            FinancialMonthStartDay = 1,
            MonthlySalary = 140000m,
            SalaryDate = 1,
            CreatedAt = DateTime.UtcNow
        };

        var adultUser = new User
        {
            Id = "usr_3",
            Name = "Aarav Sharma",
            Email = "aarav.sharma@pennywise.app",
            Phone = "+91 98765 43212",
            Avatar = "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
            Role = FamilyRole.AdultMember,
            FamilyId = familyId,
            Currency = "₹",
            FinancialMonthStartDay = 1,
            MonthlySalary = 45000m,
            SalaryDate = 1,
            CreatedAt = DateTime.UtcNow
        };

        var dependentUser = new User
        {
            Id = "usr_4",
            Name = "Ananya Sharma",
            Email = "ananya.sharma@pennywise.app",
            Phone = "+91 98765 43213",
            Avatar = "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
            Role = FamilyRole.Dependent,
            FamilyId = familyId,
            Currency = "₹",
            FinancialMonthStartDay = 1,
            MonthlySalary = null,
            CreatedAt = DateTime.UtcNow
        };

        await context.Users.AddRangeAsync(adminUser, managerUser, adultUser, dependentUser);

        // Family workspace
        var family = new Family
        {
            Id = familyId,
            Name = "The Sharma Family",
            Avatar = "🏡",
            AdminId = adminUserId,
            TotalMonthlyBudget = 150000m,
            SharedBudgetRemaining = 150000m,
            CreatedAt = DateTime.UtcNow
        };
        await context.Families.AddAsync(family);

        // Members with permissions
        var members = new List<FamilyMember>
        {
            new() { Id = "mem_1", FamilyId = familyId, UserId = adminUserId, Name = "Rajesh Sharma", Email = "rajesh.sharma@pennywise.app", Role = FamilyRole.FamilyAdmin, Avatar = adminUser.Avatar, SharedContributionMonth = 65000m, IsOnline = true },
            new() { Id = "mem_2", FamilyId = familyId, UserId = "usr_2", Name = "Priya Sharma", Email = "priya.sharma@pennywise.app", Role = FamilyRole.FinanceManager, Avatar = managerUser.Avatar, SharedContributionMonth = 50000m, IsOnline = true },
            new() { Id = "mem_3", FamilyId = familyId, UserId = "usr_3", Name = "Aarav Sharma", Email = "aarav.sharma@pennywise.app", Role = FamilyRole.AdultMember, Avatar = adultUser.Avatar, SharedContributionMonth = 12000m, IsOnline = false },
            new() { Id = "mem_4", FamilyId = familyId, UserId = "usr_4", Name = "Ananya Sharma", Email = "ananya.sharma@pennywise.app", Role = FamilyRole.Dependent, Avatar = dependentUser.Avatar, SharedContributionMonth = 0m, IsOnline = false },
        };
        await context.FamilyMembers.AddRangeAsync(members);

        // Standard accounts ready for real balances and usage (no fake transaction history)
        var accounts = new List<Account>
        {
            new() { Id = "acc_1", UserId = adminUserId, FamilyId = familyId, Nickname = "HDFC Salary Account", AccountType = AccountType.Savings, BankName = "HDFC Bank", MaskedNumber = "•••• 4192", CurrentBalance = 150000m, Currency = "₹", IsShared = false },
            new() { Id = "acc_2", UserId = adminUserId, FamilyId = familyId, Nickname = "SBI Household Joint Account", AccountType = AccountType.Savings, BankName = "State Bank of India", MaskedNumber = "•••• 8821", CurrentBalance = 50000m, Currency = "₹", IsShared = true },
            new() { Id = "acc_3", UserId = adminUserId, FamilyId = familyId, Nickname = "ICICI Sapphiro Credit Card", AccountType = AccountType.CreditCard, BankName = "ICICI Bank", MaskedNumber = "•••• 5034", CurrentBalance = 0m, Currency = "₹", IsShared = false, CreditLimit = 300000m, AvailableCredit = 300000m, OutstandingDue = 0m },
            new() { Id = "acc_4", UserId = adminUserId, FamilyId = familyId, Nickname = "Cash Reserve Wallet", AccountType = AccountType.CashWallet, BankName = "Cash", MaskedNumber = "CASH", CurrentBalance = 10000m, Currency = "₹", IsShared = true },
        };
        await context.Accounts.AddRangeAsync(accounts);

        // Standard financial categories with zero spent
        var categories = new List<Category>
        {
            new() { Id = "cat_rent", Name = "Rent & Maintenance", Type = CategoryType.Expense, Color = "#6366F1", MonthlyBudget = 35000m, SpentThisMonth = 0m, IsShared = true, IsDefault = true },
            new() { Id = "cat_emi", Name = "EMI & Loans", Type = CategoryType.Expense, Color = "#EF4444", MonthlyBudget = 32000m, SpentThisMonth = 0m, IsShared = true, IsDefault = true },
            new() { Id = "cat_groceries", Name = "Groceries & Supplies", Type = CategoryType.Expense, Color = "#16A36A", MonthlyBudget = 25000m, SpentThisMonth = 0m, IsShared = true, IsDefault = true },
            new() { Id = "cat_dining", Name = "Food & Dining Out", Type = CategoryType.Expense, Color = "#F59E0B", MonthlyBudget = 12000m, SpentThisMonth = 0m, IsShared = true, IsDefault = true },
            new() { Id = "cat_bills", Name = "Bills & Utilities", Type = CategoryType.Expense, Color = "#3B82F6", MonthlyBudget = 15000m, SpentThisMonth = 0m, IsShared = true, IsDefault = true },
            new() { Id = "cat_health", Name = "Healthcare & Medical", Type = CategoryType.Expense, Color = "#EC4899", MonthlyBudget = 10000m, SpentThisMonth = 0m, IsShared = true, IsDefault = true },
            new() { Id = "cat_shopping", Name = "Shopping & Personal Care", Type = CategoryType.Expense, Color = "#8B5CF6", MonthlyBudget = 15000m, SpentThisMonth = 0m, IsShared = false, IsDefault = true },
            new() { Id = "cat_education", Name = "Education & Courses", Type = CategoryType.Expense, Color = "#14B8A6", MonthlyBudget = 10000m, SpentThisMonth = 0m, IsShared = true, IsDefault = true },
            new() { Id = "cat_salary", Name = "Primary Salary", Type = CategoryType.Income, Color = "#16A36A", MonthlyBudget = 0m, SpentThisMonth = 0m, IsShared = false, IsDefault = true },
            new() { Id = "cat_investments", Name = "Investments & Dividends", Type = CategoryType.Income, Color = "#10B981", MonthlyBudget = 0m, SpentThisMonth = 0m, IsShared = true, IsDefault = true },
        };
        await context.Categories.AddRangeAsync(categories);

        // Fresh monthly budget with 0 spent
        var budget = new Budget
        {
            Id = "bgt_nov_2026",
            FamilyId = familyId,
            Month = "2026-11",
            TotalBudget = 154000m,
            TotalSpent = 0m,
            Categories = categories.Where(c => c.Type == CategoryType.Expense).Select(c => new BudgetCategory
            {
                Id = $"bgt_cat_{c.Id}",
                BudgetId = "bgt_nov_2026",
                CategoryId = c.Id,
                CategoryName = c.Name,
                Color = c.Color,
                BudgetLimit = c.MonthlyBudget,
                Spent = 0m,
                PreviousMonthSpent = 0m,
                CarryForward = 0m
            }).ToList()
        };
        await context.Budgets.AddAsync(budget);

        // NOTE: No dummy transactions, loans, or savings goals seeded!
        // The ledger starts empty with clean states and informative placeholders.

        await context.SaveChangesAsync();
    }
}
