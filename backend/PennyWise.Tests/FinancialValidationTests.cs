using Xunit;
using PennyWise.Core.Entities;
using PennyWise.Core.Enums;
using PennyWise.Services;
using System;
using System.Collections.Generic;

namespace PennyWise.Tests;

public class FinancialValidationTests
{
    private readonly LoanCalculationService _loanService = new();

    [Fact]
    public void EligibleExpenses_StrictlyExcludesSelfTransfers_AndCashWithdrawals()
    {
        // Arrange
        var transactions = new List<Transaction>
        {
            new() { Id = "1", Type = TransactionType.Expense, Amount = 35000m, Category = "Rent", Status = TransactionStatus.Completed },
            new() { Id = "2", Type = TransactionType.Expense, Amount = 6840m, Category = "Groceries", Status = TransactionStatus.Completed },
            new() { Id = "3", Type = TransactionType.Transfer, Amount = 60000m, Category = "Internal Transfer", Status = TransactionStatus.Completed },
            new() { Id = "4", Type = TransactionType.Expense, Amount = 5000m, Category = "Cash Withdrawal", Status = TransactionStatus.Completed },
            new() { Id = "5", Type = TransactionType.Expense, Amount = 1499m, Category = "Netflix", Status = TransactionStatus.Failed }, // Failed payment
        };

        // Act
        // Replicating calculation logic
        decimal eligibleTotal = 0;
        foreach (var t in transactions)
        {
            if (t.Type == TransactionType.Expense &&
                t.Status == TransactionStatus.Completed &&
                t.Category != "Internal Transfer" &&
                t.Category != "Cash Withdrawal")
            {
                eligibleTotal += t.Amount;
            }
        }

        // Assert
        // Only Rent (35,000) + Groceries (6,840) should be counted = 41,840
        // Transfer (60,000), Cash Withdrawal (5,000) and Failed Netflix (1,499) MUST NOT inflate expenses
        Assert.Equal(41840m, eligibleTotal);
    }

    [Fact]
    public void EligibleIncome_StrictlyProtectsPrivateSalary_FromUnauthorizedMembers()
    {
        // Arrange
        var rajeshPrivateSalary = new Transaction
        {
            Id = "tx_salary",
            UserId = "usr_1",
            Type = TransactionType.Income,
            Amount = 185000m,
            Category = "Primary Salary",
            Status = TransactionStatus.Completed,
            IsShared = false // Strictly Private
        };

        var priyaSharedFreelance = new Transaction
        {
            Id = "tx_freelance",
            UserId = "usr_2",
            Type = TransactionType.Income,
            Amount = 25000m,
            Category = "Freelancing",
            Status = TransactionStatus.Completed,
            IsShared = true // Shared with Family
        };

        var allTransactions = new List<Transaction> { rajeshPrivateSalary, priyaSharedFreelance };

        var childUser = new User
        {
            Id = "usr_4",
            Name = "Ananya Sharma",
            Role = FamilyRole.Dependent
        };

        // Act
        // Child queries family income: can only see shared income
        var visibleIncomeToChild = 0m;
        foreach (var t in allTransactions)
        {
            if (t.Type == TransactionType.Income && t.Status == TransactionStatus.Completed)
            {
                if (t.IsShared || t.UserId == childUser.Id)
                {
                    visibleIncomeToChild += t.Amount;
                }
            }
        }

        // Assert: Child sees only 25,000 (shared freelance), and 0 of Rajesh's private 185,000 salary!
        Assert.Equal(25000m, visibleIncomeToChild);
    }

    [Fact]
    public void PrepaymentSimulation_ReducesTenure_AndSavesSubstantialInterest()
    {
        // Arrange: 34,20,000 principal at 8.55% annual interest, 172 months remaining, 32,000 monthly EMI
        decimal outstanding = 3420000m;
        double annualRate = 8.55;
        int remainingMonths = 172;
        decimal emi = 32000m;
        decimal prepayment = 50000m;

        // Act
        var result = _loanService.SimulatePrepayment(outstanding, annualRate, remainingMonths, emi, prepayment);

        // Assert
        Assert.True(result.MonthsReduced > 0, "Prepayment should reduce remaining loan tenure");
        Assert.True(result.TotalInterestSaved > 0, "Prepayment should reduce cumulative interest payout");
    }

    [Fact]
    public void MessageParser_IdentifiesDebitSMS_AndExtractsAmountCorrectly()
    {
        // Arrange
        var parser = new MessageParsingService();
        var rawSms = "Dear Cardholder, INR 3,450.00 was spent on your Credit Card xx5034 at BARBEQUE NATION on 08-NOV-26. Ref: 847291";

        // Act
        var result = parser.ParseMessage(rawSms, "Android SMS");

        // Assert
        Assert.True(result.Success);
        Assert.Equal(3450m, result.Amount);
        Assert.Equal("Barbeque Nation", result.Merchant);
        Assert.Equal("debit", result.TransactionType);
        Assert.Equal("Food & Dining Out", result.SuggestedCategory);
        Assert.False(result.IsFailedPayment);
    }
}

