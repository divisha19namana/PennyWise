using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using PennyWise.Core.Enums;

namespace PennyWise.Core.Entities;

public class User
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    [MaxLength(50)]
    public string Phone { get; set; } = string.Empty;

    [MaxLength(500)]
    public string Avatar { get; set; } = string.Empty;

    public FamilyRole Role { get; set; } = FamilyRole.FamilyAdmin;

    [MaxLength(100)]
    public string FamilyId { get; set; } = string.Empty;

    [MaxLength(10)]
    public string Currency { get; set; } = "₹";

    public int FinancialMonthStartDay { get; set; } = 1;

    [Column(TypeName = "decimal(18,2)")]
    public decimal? MonthlySalary { get; set; } // Strictly private

    public int? SalaryDate { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public bool IsDeleted { get; set; } = false;

    // Navigation
    public UserSettings? Settings { get; set; }
    public FamilyPermission? Permissions { get; set; }
    public ICollection<Account> Accounts { get; set; } = new List<Account>();
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}

public class UserSettings
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    public string UserId { get; set; } = string.Empty;

    public bool InAppNotifications { get; set; } = true;
    public bool PushNotifications { get; set; } = true;
    public bool EmailAlerts { get; set; } = true;
    public bool MaskLockScreenAmounts { get; set; } = true;
    public bool TwoFactorEnabled { get; set; } = false;
    public string ThemePreference { get; set; } = "light"; // light, dark, system
    public bool EnableSmsTracking { get; set; } = true;
    public bool AutoScrubRawMessages { get; set; } = true;
    public int ScrubRetentionHours { get; set; } = 48;

    [ForeignKey(nameof(UserId))]
    public User? User { get; set; }
}

public class Family
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(50)]
    public string Avatar { get; set; } = "🏡";

    [Required]
    public string AdminId { get; set; } = string.Empty;

    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalMonthlyBudget { get; set; } = 150000m;

    [Column(TypeName = "decimal(18,2)")]
    public decimal SharedBudgetRemaining { get; set; } = 150000m;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsDeleted { get; set; } = false;

    // Navigation
    public ICollection<FamilyMember> Members { get; set; } = new List<FamilyMember>();
    public ICollection<Account> SharedAccounts { get; set; } = new List<Account>();
    public ICollection<Budget> Budgets { get; set; } = new List<Budget>();
    public ICollection<Loan> Loans { get; set; } = new List<Loan>();
    public ICollection<SavingsGoal> SavingsGoals { get; set; } = new List<SavingsGoal>();
    public ICollection<FamilyChallenge> Challenges { get; set; } = new List<FamilyChallenge>();
}

public class FamilyMember
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    public string FamilyId { get; set; } = string.Empty;

    [Required]
    public string UserId { get; set; } = string.Empty;

    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    public FamilyRole Role { get; set; } = FamilyRole.AdultMember;

    [MaxLength(500)]
    public string Avatar { get; set; } = string.Empty;

    [Column(TypeName = "decimal(18,2)")]
    public decimal SharedContributionMonth { get; set; } = 0m;

    public bool IsOnline { get; set; } = false;
    public DateTime JoinedDate { get; set; } = DateTime.UtcNow;

    // Sharing Settings
    public bool ShareSalary { get; set; } = false;
    public bool ShareAccounts { get; set; } = false;
    public bool ShareLoans { get; set; } = false;

    [ForeignKey(nameof(FamilyId))]
    public Family? Family { get; set; }

    [ForeignKey(nameof(UserId))]
    public User? User { get; set; }

    public FamilyPermission? Permissions { get; set; }
}

public class FamilyPermission
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    public string UserId { get; set; } = string.Empty;

    public bool CanViewFamilyBudget { get; set; } = true;
    public bool CanEditFamilyBudget { get; set; } = false;
    public bool CanViewSharedTransactions { get; set; } = true;
    public bool CanAddSharedTransactions { get; set; } = true;
    public bool CanManageMembers { get; set; } = false;
    public bool CanViewReports { get; set; } = true;
    public bool CanManageAccounts { get; set; } = false;
    public bool CanViewSharedLoans { get; set; } = false;
    public bool CanManageSavingsGoals { get; set; } = true;

    [ForeignKey(nameof(UserId))]
    public User? User { get; set; }
}

public class Account
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    public string UserId { get; set; } = string.Empty;

    [Required]
    public string FamilyId { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Nickname { get; set; } = string.Empty;

    public AccountType AccountType { get; set; } = AccountType.Savings;

    [MaxLength(100)]
    public string BankName { get; set; } = string.Empty;

    [MaxLength(50)]
    public string MaskedNumber { get; set; } = "••••";

    [Column(TypeName = "decimal(18,2)")]
    public decimal CurrentBalance { get; set; } = 0m;

    [MaxLength(10)]
    public string Currency { get; set; } = "₹";

    public bool IsShared { get; set; } = false;

    [Column(TypeName = "decimal(18,2)")]
    public decimal? CreditLimit { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? AvailableCredit { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? OutstandingDue { get; set; }

    public DateTime? StatementDueDate { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;

    [ForeignKey(nameof(UserId))]
    public User? User { get; set; }

    [ForeignKey(nameof(FamilyId))]
    public Family? Family { get; set; }

    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}

public class Category
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    public CategoryType Type { get; set; } = CategoryType.Expense;

    [MaxLength(50)]
    public string Icon { get; set; } = "Tag";

    [MaxLength(20)]
    public string Color { get; set; } = "#16A36A";

    [Column(TypeName = "decimal(18,2)")]
    public decimal MonthlyBudget { get; set; } = 0m;

    [Column(TypeName = "decimal(18,2)")]
    public decimal SpentThisMonth { get; set; } = 0m;

    public bool IsShared { get; set; } = true;
    public bool IsDefault { get; set; } = false;
    public bool IsDeleted { get; set; } = false;
}

public class Transaction
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    public string UserId { get; set; } = string.Empty;

    [Required]
    public string FamilyId { get; set; } = string.Empty;

    [Required]
    [MaxLength(150)]
    public string UserName { get; set; } = string.Empty;

    [Required]
    public string AccountId { get; set; } = string.Empty;

    [MaxLength(100)]
    public string AccountNickname { get; set; } = string.Empty;

    public string? ToAccountId { get; set; }

    [MaxLength(100)]
    public string? ToAccountNickname { get; set; }

    public TransactionType Type { get; set; } = TransactionType.Expense;

    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    [Required]
    [MaxLength(100)]
    public string Category { get; set; } = string.Empty;

    [Required]
    public string CategoryId { get; set; } = string.Empty;

    [Required]
    [MaxLength(150)]
    public string Merchant { get; set; } = string.Empty;

    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;

    public DateTime Date { get; set; } = DateTime.UtcNow;

    public TransactionStatus Status { get; set; } = TransactionStatus.Completed;

    public bool IsShared { get; set; } = true;

    public TransactionSourceType Source { get; set; } = TransactionSourceType.Manual;

    [MaxLength(50)]
    public string PaymentMethod { get; set; } = "UPI";

    [MaxLength(500)]
    public string? ReceiptUrl { get; set; }

    [MaxLength(100)]
    public string? ReferenceNumber { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }

    public bool IsDeleted { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(UserId))]
    public User? User { get; set; }

    [ForeignKey(nameof(AccountId))]
    public Account? Account { get; set; }
}

public class ImportedMessage
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    public string RawText { get; set; } = string.Empty;

    [MaxLength(50)]
    public string Source { get; set; } = "Android SMS";

    public DateTime ReceivedAt { get; set; } = DateTime.UtcNow;

    [Column(TypeName = "decimal(18,2)")]
    public decimal ExtractedAmount { get; set; }

    [MaxLength(150)]
    public string Merchant { get; set; } = string.Empty;

    [MaxLength(20)]
    public string TransactionType { get; set; } = "debit"; // debit or credit

    [MaxLength(100)]
    public string AccountNickname { get; set; } = string.Empty;

    [MaxLength(10)]
    public string AccountLast4 { get; set; } = string.Empty;

    [MaxLength(50)]
    public string PaymentMethod { get; set; } = "UPI";

    [MaxLength(100)]
    public string SuggestedCategory { get; set; } = string.Empty;

    public double ConfidenceScore { get; set; } = 0.95;

    [MaxLength(30)]
    public string ReviewStatus { get; set; } = "pending"; // pending, confirmed, rejected

    [MaxLength(100)]
    public string ReferenceNo { get; set; } = string.Empty;

    public bool IsPurged { get; set; } = false;
}

public class MessageParsingRule
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    [MaxLength(100)]
    public string Keyword { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string TargetCategory { get; set; } = string.Empty;

    public bool DefaultShared { get; set; } = true;
}

public class Budget
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    public string FamilyId { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string Month { get; set; } = "2026-11";

    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalBudget { get; set; } = 150000m;

    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalSpent { get; set; } = 0m;

    public ICollection<BudgetCategory> Categories { get; set; } = new List<BudgetCategory>();
}

public class BudgetCategory
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    public string BudgetId { get; set; } = string.Empty;

    [Required]
    public string CategoryId { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string CategoryName { get; set; } = string.Empty;

    [MaxLength(50)]
    public string Icon { get; set; } = "Tag";

    [MaxLength(20)]
    public string Color { get; set; } = "#16A36A";

    [Column(TypeName = "decimal(18,2)")]
    public decimal BudgetLimit { get; set; } = 0m;

    [Column(TypeName = "decimal(18,2)")]
    public decimal Spent { get; set; } = 0m;

    [Column(TypeName = "decimal(18,2)")]
    public decimal PreviousMonthSpent { get; set; } = 0m;

    [Column(TypeName = "decimal(18,2)")]
    public decimal CarryForward { get; set; } = 0m;

    [ForeignKey(nameof(BudgetId))]
    public Budget? Budget { get; set; }
}

public class Loan
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    public string UserId { get; set; } = string.Empty;

    [Required]
    public string FamilyId { get; set; } = string.Empty;

    [Required]
    [MaxLength(150)]
    public string BorrowerName { get; set; } = string.Empty;

    [Required]
    [MaxLength(150)]
    public string LoanName { get; set; } = string.Empty;

    public LoanType LoanType { get; set; } = LoanType.Home;

    [MaxLength(100)]
    public string Lender { get; set; } = string.Empty;

    [MaxLength(50)]
    public string AccountNumberMasked { get; set; } = string.Empty;

    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalPrincipal { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal OutstandingPrincipal { get; set; }

    public double InterestRate { get; set; } // Annual percentage

    [MaxLength(20)]
    public string InterestMethod { get; set; } = "reducing"; // reducing or flat

    public int TenureMonths { get; set; }
    public int RemainingMonths { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal EmiAmount { get; set; }

    public int DueDay { get; set; } = 5;

    public string LinkedAccountId { get; set; } = string.Empty;
    public bool IsShared { get; set; } = true;

    [MaxLength(20)]
    public string Status { get; set; } = "active";

    public DateTime StartDate { get; set; } = DateTime.UtcNow;

    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalInterestPaid { get; set; } = 0m;

    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalPrincipalPaid { get; set; } = 0m;

    public ICollection<LoanEMI> EMISchedules { get; set; } = new List<LoanEMI>();
}

public class LoanEMI
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    public string LoanId { get; set; } = string.Empty;

    public int InstallmentNo { get; set; }
    public DateTime DueDate { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal EmiAmount { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal PrincipalComponent { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal InterestComponent { get; set; }

    [MaxLength(20)]
    public string Status { get; set; } = "upcoming"; // upcoming, paid, overdue

    public DateTime? PaidDate { get; set; }
    public string? TransactionId { get; set; }

    [ForeignKey(nameof(LoanId))]
    public Loan? Loan { get; set; }
}

public class SavingsGoal
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    public string FamilyId { get; set; } = string.Empty;

    [Required]
    [MaxLength(150)]
    public string Title { get; set; } = string.Empty;

    public GoalType Type { get; set; } = GoalType.Vacation;

    [Column(TypeName = "decimal(18,2)")]
    public decimal TargetAmount { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal CurrentAmount { get; set; } = 0m;

    public DateTime TargetDate { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal MonthlyTarget { get; set; }

    [MaxLength(20)]
    public string Priority { get; set; } = "high";

    public bool IsShared { get; set; } = true;

    [MaxLength(20)]
    public string Status { get; set; } = "in_progress"; // in_progress, completed, paused

    [MaxLength(50)]
    public string Icon { get; set; } = "Plane";

    [MaxLength(20)]
    public string Color { get; set; } = "#0284C7";

    public ICollection<SavingsContribution> Contributions { get; set; } = new List<SavingsContribution>();
}

public class SavingsContribution
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    public string GoalId { get; set; } = string.Empty;

    [Required]
    public string UserId { get; set; } = string.Empty;

    [Required]
    [MaxLength(150)]
    public string UserName { get; set; } = string.Empty;

    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    public DateTime Date { get; set; } = DateTime.UtcNow;
    public string FromAccountId { get; set; } = string.Empty;

    [MaxLength(250)]
    public string? Note { get; set; }

    [ForeignKey(nameof(GoalId))]
    public SavingsGoal? Goal { get; set; }
}

public class RecurringTransaction
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    [MaxLength(20)]
    public string Frequency { get; set; } = "monthly"; // daily, weekly, monthly, quarterly, yearly

    [MaxLength(100)]
    public string Category { get; set; } = string.Empty;

    public string AccountId { get; set; } = string.Empty;

    [MaxLength(100)]
    public string AccountNickname { get; set; } = string.Empty;

    public DateTime NextDueDate { get; set; }
    public bool IsShared { get; set; } = true;

    [MaxLength(20)]
    public string Status { get; set; } = "active";

    [MaxLength(150)]
    public string OwnerName { get; set; } = string.Empty;

    public bool PriceChanged { get; set; } = false;

    [Column(TypeName = "decimal(18,2)")]
    public decimal? PreviousPrice { get; set; }
}

public class Notification
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public NotificationType Type { get; set; } = NotificationType.ExpenseRecorded;

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Column(TypeName = "decimal(18,2)")]
    public decimal? Amount { get; set; }

    [MaxLength(1000)]
    public string Description { get; set; } = string.Empty;

    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public bool IsRead { get; set; } = false;

    [Required]
    public string RecipientId { get; set; } = string.Empty;

    public bool IsShared { get; set; } = true;

    [MaxLength(250)]
    public string? ActionUrl { get; set; }

    [MaxLength(100)]
    public string? Category { get; set; }

    [MaxLength(50)]
    public string? StatusBadge { get; set; }
}

public class FamilyChallenge
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    public string FamilyId { get; set; } = string.Empty;

    [Required]
    [MaxLength(150)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;

    [MaxLength(100)]
    public string TargetMetric { get; set; } = string.Empty;

    public int CurrentProgress { get; set; } = 0; // 0-100%

    [Column(TypeName = "decimal(18,2)")]
    public decimal TargetValue { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal CurrentValue { get; set; }

    public DateTime Deadline { get; set; }

    [MaxLength(500)]
    public string ParticipantsCsv { get; set; } = string.Empty;

    [MaxLength(20)]
    public string Status { get; set; } = "active";

    [MaxLength(100)]
    public string RewardBadge { get; set; } = string.Empty;

    public bool Celebrated { get; set; } = false;
}

public class AuditLog
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    public string EntityName { get; set; } = string.Empty;

    [Required]
    public string EntityId { get; set; } = string.Empty;

    [Required]
    public string Action { get; set; } = string.Empty; // Create, Update, Delete, Reversal

    [Required]
    public string UserId { get; set; } = string.Empty;

    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    public string? Details { get; set; }
}

