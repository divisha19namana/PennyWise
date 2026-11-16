using Microsoft.EntityFrameworkCore;
using PennyWise.Core.Entities;
using PennyWise.Core.Enums;
using PennyWise.Infrastructure.Data;

namespace PennyWise.Services;

public class ValidationOutcome
{
    public bool IsValid { get; set; }
    public List<string> Errors { get; set; } = new();
    public List<string> Warnings { get; set; } = new();
    public bool IsPotentialDuplicate { get; set; }
}

public interface ITransactionValidationService
{
    Task<ValidationOutcome> ValidateAsync(Transaction tx, User currentUser);
    Task<Transaction> ProcessAndPersistTransactionAsync(Transaction tx, User currentUser);
    Task<Transaction> ExecuteAccountTransferAsync(string fromAccountId, string toAccountId, decimal amount, string note, User currentUser);
    decimal CalculateEligibleExpenses(IEnumerable<Transaction> transactions);
    decimal CalculateEligibleIncome(IEnumerable<Transaction> transactions, User currentUser);
}

public class TransactionValidationService : ITransactionValidationService
{
    private readonly ApplicationDbContext _context;

    public TransactionValidationService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ValidationOutcome> ValidateAsync(Transaction tx, User currentUser)
    {
        var outcome = new ValidationOutcome { IsValid = true };

        // 1. Amount Validation
        if (tx.Amount <= 0)
        {
            outcome.Errors.Add("Amount must be greater than zero.");
            outcome.IsValid = false;
        }

        // 2. Account verification
        if (string.IsNullOrWhiteSpace(tx.AccountId))
        {
            outcome.Errors.Add("An account must be selected.");
            outcome.IsValid = false;
        }
        else
        {
            var account = await _context.Accounts.FindAsync(tx.AccountId);
            if (account == null)
            {
                outcome.Errors.Add("Selected account does not exist.");
                outcome.IsValid = false;
            }
            else if (!account.IsShared && account.UserId != currentUser.Id && currentUser.Role != FamilyRole.FamilyAdmin)
            {
                outcome.Errors.Add("You are not authorized to transact using this personal account.");
                outcome.IsValid = false;
            }
        }

        // 3. Date validation
        if (tx.Status == TransactionStatus.Completed && tx.Date > DateTime.UtcNow.AddMinutes(5))
        {
            outcome.Errors.Add("Completed transaction date cannot be in the future.");
            outcome.IsValid = false;
        }

        // 4. Transfer rules
        if (tx.Type == TransactionType.Transfer)
        {
            if (string.IsNullOrWhiteSpace(tx.ToAccountId))
            {
                outcome.Errors.Add("Destination account is required for transfers.");
                outcome.IsValid = false;
            }
            else if (tx.AccountId == tx.ToAccountId)
            {
                outcome.Errors.Add("Source and destination accounts must be different.");
                outcome.IsValid = false;
            }
        }

        // 5. Duplicate detection engine
        if (tx.Amount > 0 && !string.IsNullOrWhiteSpace(tx.AccountId) && !string.IsNullOrWhiteSpace(tx.Merchant))
        {
            var txDateOnly = tx.Date.Date;
            var potentialDup = await _context.Transactions
                .Where(t => t.Id != tx.Id)
                .Where(t => 
                    (!string.IsNullOrEmpty(tx.ReferenceNumber) && t.ReferenceNumber == tx.ReferenceNumber) ||
                    (t.AccountId == tx.AccountId && t.Amount == tx.Amount && t.Merchant.ToLower() == tx.Merchant.ToLower() && t.Date.Date == txDateOnly)
                )
                .FirstOrDefaultAsync();

            if (potentialDup != null)
            {
                outcome.IsPotentialDuplicate = true;
                outcome.Warnings.Add($"Potential duplicate detected! Matches previous transaction #{potentialDup.Id} for ₹{potentialDup.Amount}.");
            }
        }

        return outcome;
    }

    public async Task<Transaction> ProcessAndPersistTransactionAsync(Transaction tx, User currentUser)
    {
        var validation = await ValidateAsync(tx, currentUser);
        if (!validation.IsValid)
        {
            throw new InvalidOperationException(string.Join(" ", validation.Errors));
        }

        using var dbTransaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var account = await _context.Accounts.FindAsync(tx.AccountId)
                ?? throw new KeyNotFoundException("Account not found");

            // Update balance based on completed transaction
            if (tx.Status == TransactionStatus.Completed)
            {
                if (tx.Type == TransactionType.Expense)
                {
                    account.CurrentBalance -= tx.Amount;
                }
                else if (tx.Type == TransactionType.Income)
                {
                    account.CurrentBalance += tx.Amount;
                }
                else if (tx.Type == TransactionType.Transfer && !string.IsNullOrEmpty(tx.ToAccountId))
                {
                    var destAccount = await _context.Accounts.FindAsync(tx.ToAccountId)
                        ?? throw new KeyNotFoundException("Destination account not found");
                    account.CurrentBalance -= tx.Amount;
                    destAccount.CurrentBalance += tx.Amount;
                    destAccount.UpdatedAt = DateTime.UtcNow;
                }
                account.UpdatedAt = DateTime.UtcNow;
            }

            tx.CreatedAt = DateTime.UtcNow;
            await _context.Transactions.AddAsync(tx);

            // Create Audit Log
            await _context.AuditLogs.AddAsync(new AuditLog
            {
                EntityName = nameof(Transaction),
                EntityId = tx.Id,
                Action = "CREATE",
                UserId = currentUser.Id,
                Timestamp = DateTime.UtcNow,
                Details = $"Created {tx.Type} of ₹{tx.Amount} at {tx.Merchant}"
            });

            await _context.SaveChangesAsync();
            await dbTransaction.CommitAsync();

            return tx;
        }
        catch
        {
            await dbTransaction.RollbackAsync();
            throw;
        }
    }

    public async Task<Transaction> ExecuteAccountTransferAsync(string fromAccountId, string toAccountId, decimal amount, string note, User currentUser)
    {
        if (amount <= 0) throw new ArgumentException("Amount must be greater than zero.");
        if (fromAccountId == toAccountId) throw new ArgumentException("Source and destination accounts must be different.");

        var fromAcc = await _context.Accounts.FindAsync(fromAccountId) ?? throw new KeyNotFoundException("Source account not found");
        var toAcc = await _context.Accounts.FindAsync(toAccountId) ?? throw new KeyNotFoundException("Destination account not found");

        var transferTx = new Transaction
        {
            UserId = currentUser.Id,
            FamilyId = currentUser.FamilyId,
            UserName = currentUser.Name,
            AccountId = fromAccountId,
            AccountNickname = fromAcc.Nickname,
            ToAccountId = toAccountId,
            ToAccountNickname = toAcc.Nickname,
            Type = TransactionType.Transfer,
            Amount = amount,
            Category = "Internal Transfer",
            CategoryId = "cat_other_exp",
            Merchant = $"Transfer to {toAcc.Nickname}",
            Description = string.IsNullOrWhiteSpace(note) ? $"Account transfer from {fromAcc.Nickname} to {toAcc.Nickname}" : note,
            Date = DateTime.UtcNow,
            Status = TransactionStatus.Completed,
            IsShared = true,
            Source = TransactionSourceType.Manual,
            PaymentMethod = "Self Account Transfer",
            Notes = "Self-transfer: Never counted as income or expense."
        };

        return await ProcessAndPersistTransactionAsync(transferTx, currentUser);
    }

    public decimal CalculateEligibleExpenses(IEnumerable<Transaction> transactions)
    {
        return transactions
            .Where(t => t.Type == TransactionType.Expense &&
                        t.Status == TransactionStatus.Completed &&
                        t.Category != "Internal Transfer" &&
                        t.Category != "Cash Withdrawal")
            .Sum(t => t.Amount);
    }

    public decimal CalculateEligibleIncome(IEnumerable<Transaction> transactions, User currentUser)
    {
        return transactions
            .Where(t => t.Type == TransactionType.Income &&
                        t.Status == TransactionStatus.Completed &&
                        t.Category != "Internal Transfer" &&
                        (t.IsShared || t.UserId == currentUser.Id || currentUser.Role == FamilyRole.FamilyAdmin))
            .Sum(t => t.Amount);
    }
}

