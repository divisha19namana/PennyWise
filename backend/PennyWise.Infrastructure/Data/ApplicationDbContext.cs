using Microsoft.EntityFrameworkCore;
using PennyWise.Core.Entities;

namespace PennyWise.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<UserSettings> UserSettings => Set<UserSettings>();
    public DbSet<Family> Families => Set<Family>();
    public DbSet<FamilyMember> FamilyMembers => Set<FamilyMember>();
    public DbSet<FamilyPermission> FamilyPermissions => Set<FamilyPermission>();
    public DbSet<Account> Accounts => Set<Account>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<ImportedMessage> ImportedMessages => Set<ImportedMessage>();
    public DbSet<MessageParsingRule> MessageParsingRules => Set<MessageParsingRule>();
    public DbSet<Budget> Budgets => Set<Budget>();
    public DbSet<BudgetCategory> BudgetCategories => Set<BudgetCategory>();
    public DbSet<Loan> Loans => Set<Loan>();
    public DbSet<LoanEMI> LoanEMIs => Set<LoanEMI>();
    public DbSet<SavingsGoal> SavingsGoals => Set<SavingsGoal>();
    public DbSet<SavingsContribution> SavingsContributions => Set<SavingsContribution>();
    public DbSet<RecurringTransaction> RecurringTransactions => Set<RecurringTransaction>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<FamilyChallenge> FamilyChallenges => Set<FamilyChallenge>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Precise decimal configurations
        foreach (var property in modelBuilder.Model.GetEntityTypes()
            .SelectMany(t => t.GetProperties())
            .Where(p => p.ClrType == typeof(decimal) || p.ClrType == typeof(decimal?)))
        {
            property.SetColumnType("decimal(18,2)");
        }

        // Global query filter for soft deleted items
        modelBuilder.Entity<User>().HasQueryFilter(u => !u.IsDeleted);
        modelBuilder.Entity<Family>().HasQueryFilter(f => !f.IsDeleted);
        modelBuilder.Entity<Transaction>().HasQueryFilter(t => !t.IsDeleted);
        modelBuilder.Entity<Category>().HasQueryFilter(c => !c.IsDeleted);

        // Indices for high performance ledger queries
        modelBuilder.Entity<Transaction>()
            .HasIndex(t => new { t.FamilyId, t.Date, t.Type });

        modelBuilder.Entity<Transaction>()
            .HasIndex(t => new { t.AccountId, t.Date });

        modelBuilder.Entity<Transaction>()
            .HasIndex(t => t.ReferenceNumber);

        modelBuilder.Entity<ImportedMessage>()
            .HasIndex(m => m.ReferenceNo);
    }
}

