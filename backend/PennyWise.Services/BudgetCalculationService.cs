using Microsoft.EntityFrameworkCore;
using PennyWise.Core.Entities;
using PennyWise.Core.Enums;
using PennyWise.Infrastructure.Data;

namespace PennyWise.Services;

public class BudgetThresholdAlert
{
    public string CategoryName { get; set; } = string.Empty;
    public decimal ThresholdPercentage { get; set; }
    public string Message { get; set; } = string.Empty;
    public decimal Spent { get; set; }
    public decimal Limit { get; set; }
}

public interface IBudgetCalculationService
{
    Task<List<BudgetThresholdAlert>> EvaluateTransactionImpactAsync(Transaction tx);
    Task<Budget> RecalculateBudgetAsync(string budgetId);
}

public class BudgetCalculationService : IBudgetCalculationService
{
    private readonly ApplicationDbContext _context;

    public BudgetCalculationService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<BudgetThresholdAlert>> EvaluateTransactionImpactAsync(Transaction tx)
    {
        var alerts = new List<BudgetThresholdAlert>();

        if (tx.Type != TransactionType.Expense || tx.Status != TransactionStatus.Completed || tx.Category == "Internal Transfer")
        {
            return alerts;
        }

        var budgetCategory = await _context.BudgetCategories
            .FirstOrDefaultAsync(c => c.CategoryId == tx.CategoryId || c.CategoryName == tx.Category);

        if (budgetCategory != null && budgetCategory.BudgetLimit > 0)
        {
            var prevSpent = budgetCategory.Spent;
            var newSpent = prevSpent + tx.Amount;
            var prevPct = (prevSpent / budgetCategory.BudgetLimit) * 100m;
            var newPct = (newSpent / budgetCategory.BudgetLimit) * 100m;

            if (prevPct < 50m && newPct >= 50m && newPct < 75m)
            {
                alerts.Add(new BudgetThresholdAlert
                {
                    CategoryName = budgetCategory.CategoryName,
                    ThresholdPercentage = 50m,
                    Message = $"You have used 50% of your monthly budget for {budgetCategory.CategoryName}.",
                    Spent = newSpent,
                    Limit = budgetCategory.BudgetLimit
                });
            }
            else if (prevPct < 75m && newPct >= 75m && newPct < 80m)
            {
                alerts.Add(new BudgetThresholdAlert
                {
                    CategoryName = budgetCategory.CategoryName,
                    ThresholdPercentage = 75m,
                    Message = $"You have used 75% of your monthly budget. Watch your spending.",
                    Spent = newSpent,
                    Limit = budgetCategory.BudgetLimit
                });
            }
            else if (prevPct < 80m && newPct >= 80m && newPct < 90m)
            {
                alerts.Add(new BudgetThresholdAlert
                {
                    CategoryName = budgetCategory.CategoryName,
                    ThresholdPercentage = 80m,
                    Message = $"Your {budgetCategory.CategoryName} budget is approaching its limit.",
                    Spent = newSpent,
                    Limit = budgetCategory.BudgetLimit
                });
            }
            else if (prevPct < 90m && newPct >= 90m && newPct < 100m)
            {
                alerts.Add(new BudgetThresholdAlert
                {
                    CategoryName = budgetCategory.CategoryName,
                    ThresholdPercentage = 90m,
                    Message = "Warning! Only 10% of your budget remains.",
                    Spent = newSpent,
                    Limit = budgetCategory.BudgetLimit
                });
            }
            else if (prevPct < 100m && newPct >= 100m)
            {
                alerts.Add(new BudgetThresholdAlert
                {
                    CategoryName = budgetCategory.CategoryName,
                    ThresholdPercentage = 100m,
                    Message = "You have reached your monthly budget limit.",
                    Spent = newSpent,
                    Limit = budgetCategory.BudgetLimit
                });
            }
            else if (newPct > 100m)
            {
                var excess = newSpent - budgetCategory.BudgetLimit;
                alerts.Add(new BudgetThresholdAlert
                {
                    CategoryName = budgetCategory.CategoryName,
                    ThresholdPercentage = newPct,
                    Message = $"You exceeded your {budgetCategory.CategoryName} budget by ₹{excess:N2}.",
                    Spent = newSpent,
                    Limit = budgetCategory.BudgetLimit
                });
            }

            // Update budget category spent
            budgetCategory.Spent = newSpent;
            await _context.SaveChangesAsync();
        }

        return alerts;
    }

    public async Task<Budget> RecalculateBudgetAsync(string budgetId)
    {
        var budget = await _context.Budgets
            .Include(b => b.Categories)
            .FirstOrDefaultAsync(b => b.Id == budgetId)
            ?? throw new KeyNotFoundException("Budget not found");

        var eligibleExpenses = await _context.Transactions
            .Where(t => t.FamilyId == budget.FamilyId &&
                        t.Type == TransactionType.Expense &&
                        t.Status == TransactionStatus.Completed &&
                        t.Category != "Internal Transfer" &&
                        t.Category != "Cash Withdrawal")
            .ToListAsync();

        foreach (var cat in budget.Categories)
        {
            cat.Spent = eligibleExpenses
                .Where(t => t.CategoryId == cat.CategoryId || t.Category == cat.CategoryName)
                .Sum(t => t.Amount);
        }

        budget.TotalSpent = budget.Categories.Sum(c => c.Spent);
        await _context.SaveChangesAsync();

        return budget;
    }
}

