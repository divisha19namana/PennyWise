using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using PennyWise.API.Hubs;
using PennyWise.Core.Entities;
using PennyWise.Core.Enums;
using PennyWise.Infrastructure.Data;
using PennyWise.Services;

namespace PennyWise.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AuthController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _context.Users
            .Include(u => u.Permissions)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == request.EmailOrPhone.ToLower() || u.Phone == request.EmailOrPhone);

        if (user == null)
        {
            user = await _context.Users.Include(u => u.Permissions).FirstOrDefaultAsync();
        }

        if (user == null) return Unauthorized(new { message = "Invalid login credentials." });

        return Ok(new
        {
            token = "jwt_token_demo_sharma_family",
            user = new
            {
                user.Id,
                user.Name,
                user.Email,
                user.Phone,
                user.Avatar,
                Role = user.Role.ToString(),
                user.FamilyId,
                user.Currency,
                user.FinancialMonthStartDay,
                user.MonthlySalary,
                user.Permissions
            }
        });
    }

    public record LoginRequest(string EmailOrPhone, string Password);
}

[ApiController]
[Route("api/[controller]")]
public class TransactionsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ITransactionValidationService _validationService;
    private readonly IBudgetCalculationService _budgetService;
    private readonly IHubContext<FinanceHub> _hubContext;

    public TransactionsController(
        ApplicationDbContext context,
        ITransactionValidationService validationService,
        IBudgetCalculationService budgetService,
        IHubContext<FinanceHub> hubContext)
    {
        _context = context;
        _validationService = validationService;
        _budgetService = budgetService;
        _hubContext = hubContext;
    }

    [HttpGet]
    public async Task<IActionResult> GetTransactions([FromQuery] string? familyId, [FromQuery] string? currentUserId)
    {
        var query = _context.Transactions.AsQueryable();

        if (!string.IsNullOrEmpty(familyId))
        {
            query = query.Where(t => t.FamilyId == familyId);
        }

        // Privacy rule: show shared OR current user's own
        if (!string.IsNullOrEmpty(currentUserId))
        {
            query = query.Where(t => t.IsShared || t.UserId == currentUserId);
        }

        var list = await query.OrderByDescending(t => t.Date).ToListAsync();
        return Ok(list);
    }

    [HttpPost]
    public async Task<IActionResult> CreateTransaction([FromBody] Transaction tx, [FromQuery] string? userId)
    {
        var uid = !string.IsNullOrEmpty(userId) ? userId : tx.UserId;
        var user = await _context.Users.FindAsync(uid) ?? await _context.Users.FirstAsync();
        
        var validation = await _validationService.ValidateAsync(tx, user);
        if (!validation.IsValid)
        {
            return BadRequest(new { errors = validation.Errors, warnings = validation.Warnings });
        }

        var created = await _validationService.ProcessAndPersistTransactionAsync(tx, user);
        var alerts = await _budgetService.EvaluateTransactionImpactAsync(created);

        // Notify family members via SignalR
        await _hubContext.Clients.All.SendAsync("TransactionRecorded", created);
        foreach (var alert in alerts)
        {
            await _hubContext.Clients.All.SendAsync("BudgetAlert", alert);
        }

        return CreatedAtAction(nameof(GetTransactions), new { id = created.Id }, new
        {
            transaction = created,
            budgetAlerts = alerts,
            validation
        });
    }

    [HttpPost("transfer")]
    public async Task<IActionResult> Transfer([FromBody] TransferRequest request, [FromQuery] string? userId)
    {
        var user = !string.IsNullOrEmpty(userId) ? await _context.Users.FindAsync(userId) : null;
        user ??= await _context.Users.FirstAsync();

        var tx = await _validationService.ExecuteAccountTransferAsync(
            request.FromAccountId, 
            request.ToAccountId, 
            request.Amount, 
            request.Note, 
            user
        );

        await _hubContext.Clients.All.SendAsync("TransactionRecorded", tx);
        return Ok(tx);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTransaction(string id)
    {
        var tx = await _context.Transactions.FindAsync(id);
        if (tx == null) return NotFound();

        tx.IsDeleted = true;

        // Reverse balance impact
        var acc = await _context.Accounts.FindAsync(tx.AccountId);
        if (acc != null)
        {
            if (tx.Type == TransactionType.Expense || tx.Type == TransactionType.Transfer)
            {
                acc.CurrentBalance += tx.Amount;
            }
            else if (tx.Type == TransactionType.Income)
            {
                acc.CurrentBalance -= tx.Amount;
            }
        }

        if (tx.Type == TransactionType.Transfer && !string.IsNullOrEmpty(tx.ToAccountId))
        {
            var toAcc = await _context.Accounts.FindAsync(tx.ToAccountId);
            if (toAcc != null) toAcc.CurrentBalance -= tx.Amount;
        }

        await _context.SaveChangesAsync();
        await _hubContext.Clients.All.SendAsync("TransactionDeleted", id);
        return NoContent();
    }

    public record TransferRequest(string FromAccountId, string ToAccountId, decimal Amount, string Note);
}

[ApiController]
[Route("api/[controller]")]
public class BudgetsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IBudgetCalculationService _budgetService;

    public BudgetsController(ApplicationDbContext context, IBudgetCalculationService budgetService)
    {
        _context = context;
        _budgetService = budgetService;
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetBudget(string id)
    {
        var budget = await _context.Budgets
            .Include(b => b.Categories)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (budget == null)
        {
            budget = await _context.Budgets.Include(b => b.Categories).FirstOrDefaultAsync();
        }

        if (budget == null) return NotFound();
        return Ok(budget);
    }

    [HttpPut("{budgetId}/categories/{categoryId}")]
    public async Task<IActionResult> UpdateCategoryLimit(string budgetId, string categoryId, [FromBody] UpdateLimitRequest request)
    {
        var cat = await _context.BudgetCategories
            .FirstOrDefaultAsync(c => c.BudgetId == budgetId && c.CategoryId == categoryId);

        if (cat == null) return NotFound();

        cat.BudgetLimit = request.NewLimit;

        // Recalculate total budget
        var budget = await _context.Budgets.Include(b => b.Categories).FirstOrDefaultAsync(b => b.Id == budgetId);
        if (budget != null)
        {
            budget.TotalBudget = budget.Categories.Sum(c => c.BudgetLimit);
        }

        await _context.SaveChangesAsync();
        return Ok(cat);
    }

    public record UpdateLimitRequest(decimal NewLimit);
}

[ApiController]
[Route("api/[controller]")]
public class AccountsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AccountsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAccounts([FromQuery] string? familyId, [FromQuery] string? userId)
    {
        var query = _context.Accounts.Where(a => a.IsActive);
        if (!string.IsNullOrEmpty(familyId))
        {
            query = query.Where(a => a.FamilyId == familyId);
        }
        if (!string.IsNullOrEmpty(userId))
        {
            query = query.Where(a => a.IsShared || a.UserId == userId);
        }

        var accounts = await query.ToListAsync();
        return Ok(accounts);
    }

    [HttpPost]
    public async Task<IActionResult> CreateAccount([FromBody] Account account)
    {
        if (string.IsNullOrEmpty(account.Id)) account.Id = $"acc_{Guid.NewGuid():N}";
        account.UpdatedAt = DateTime.UtcNow;
        await _context.Accounts.AddAsync(account);
        await _context.SaveChangesAsync();
        return Ok(account);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateAccount(string id, [FromBody] Account account)
    {
        var existing = await _context.Accounts.FindAsync(id);
        if (existing == null) return NotFound();

        existing.Nickname = account.Nickname;
        existing.BankName = account.BankName;
        existing.CurrentBalance = account.CurrentBalance;
        existing.IsShared = account.IsShared;
        existing.CreditLimit = account.CreditLimit;
        existing.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Ok(existing);
    }
}

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public CategoriesController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _context.Categories.Where(c => !c.IsDeleted).ToListAsync();
        return Ok(categories);
    }

    [HttpPost]
    public async Task<IActionResult> CreateCategory([FromBody] Category category)
    {
        if (string.IsNullOrEmpty(category.Id)) category.Id = $"cat_{Guid.NewGuid():N}";
        await _context.Categories.AddAsync(category);

        // Add to active budget
        var activeBudget = await _context.Budgets.Include(b => b.Categories).FirstOrDefaultAsync();
        if (activeBudget != null && category.Type == CategoryType.Expense)
        {
            activeBudget.Categories.Add(new BudgetCategory
            {
                Id = $"bgt_cat_{category.Id}",
                BudgetId = activeBudget.Id,
                CategoryId = category.Id,
                CategoryName = category.Name,
                Color = category.Color,
                BudgetLimit = category.MonthlyBudget,
                Spent = 0m
            });
            activeBudget.TotalBudget += category.MonthlyBudget;
        }

        await _context.SaveChangesAsync();
        return Ok(category);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCategory(string id, [FromBody] Category category)
    {
        var existing = await _context.Categories.FindAsync(id);
        if (existing == null) return NotFound();

        existing.Name = category.Name;
        existing.Color = category.Color;
        existing.Icon = category.Icon;
        existing.MonthlyBudget = category.MonthlyBudget;
        existing.IsShared = category.IsShared;

        await _context.SaveChangesAsync();
        return Ok(existing);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategory(string id)
    {
        var existing = await _context.Categories.FindAsync(id);
        if (existing == null) return NotFound();

        var hasTx = await _context.Transactions.AnyAsync(t => t.CategoryId == id && !t.IsDeleted);
        if (hasTx) return BadRequest(new { message = "Cannot delete category with active transactions." });

        existing.IsDeleted = true;
        await _context.SaveChangesAsync();
        return NoContent();
    }
}

[ApiController]
[Route("api/[controller]")]
public class LoansController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILoanCalculationService _loanService;

    public LoansController(ApplicationDbContext context, ILoanCalculationService loanService)
    {
        _context = context;
        _loanService = loanService;
    }

    [HttpGet]
    public async Task<IActionResult> GetLoans([FromQuery] string? familyId)
    {
        var query = _context.Loans.AsQueryable();
        if (!string.IsNullOrEmpty(familyId))
        {
            query = query.Where(l => l.FamilyId == familyId);
        }
        var loans = await query.ToListAsync();
        return Ok(loans);
    }

    [HttpPost]
    public async Task<IActionResult> CreateLoan([FromBody] Loan loan)
    {
        if (string.IsNullOrEmpty(loan.Id)) loan.Id = $"loan_{Guid.NewGuid():N}";
        loan.StartDate = DateTime.UtcNow;
        await _context.Loans.AddAsync(loan);
        await _context.SaveChangesAsync();
        return Ok(loan);
    }

    [HttpPost("{id}/pay-emi")]
    public async Task<IActionResult> RecordEmiPayment(string id)
    {
        var loan = await _context.Loans.FindAsync(id);
        if (loan == null) return NotFound();

        var principalPortion = Math.Round(loan.EmiAmount * 0.45m);
        var interestPortion = loan.EmiAmount - principalPortion;

        loan.OutstandingPrincipal = Math.Max(0, loan.OutstandingPrincipal - principalPortion);
        loan.RemainingMonths = Math.Max(0, loan.RemainingMonths - 1);
        loan.TotalPrincipalPaid += principalPortion;
        loan.TotalInterestPaid += interestPortion;

        // Deduct from linked account if available
        var account = await _context.Accounts.FindAsync(loan.LinkedAccountId);
        if (account != null)
        {
            account.CurrentBalance -= loan.EmiAmount;
        }

        // Add expense transaction
        var tx = new Transaction
        {
            Id = $"tx_emi_{Guid.NewGuid():N}",
            UserId = loan.UserId,
            FamilyId = loan.FamilyId,
            UserName = loan.BorrowerName,
            AccountId = loan.LinkedAccountId,
            AccountNickname = account?.Nickname ?? "Linked Account",
            Type = TransactionType.Expense,
            Amount = loan.EmiAmount,
            Category = "EMI & Loans",
            CategoryId = "cat_emi",
            Merchant = $"{loan.Lender} EMI",
            Description = $"Monthly EMI deduction for {loan.LoanName}",
            Date = DateTime.UtcNow,
            Status = TransactionStatus.Completed,
            IsShared = loan.IsShared,
            PaymentMethod = "Auto Debit (EMI)"
        };
        await _context.Transactions.AddAsync(tx);

        await _context.SaveChangesAsync();
        return Ok(new { loan, transaction = tx });
    }

    [HttpGet("{id}/amortization")]
    public async Task<IActionResult> GetAmortization(string id)
    {
        var loan = await _context.Loans.FindAsync(id);
        if (loan == null) return NotFound();

        var schedule = _loanService.GenerateAmortizationSchedule(
            loan.TotalPrincipal, 
            loan.InterestRate, 
            loan.TenureMonths, 
            loan.EmiAmount
        );
        return Ok(schedule);
    }

    [HttpPost("{id}/simulate-prepayment")]
    public async Task<IActionResult> SimulatePrepayment(string id, [FromBody] PrepaymentRequest request)
    {
        var loan = await _context.Loans.FindAsync(id);
        if (loan == null) return NotFound();

        var sim = _loanService.SimulatePrepayment(
            loan.OutstandingPrincipal, 
            loan.InterestRate, 
            loan.RemainingMonths, 
            loan.EmiAmount, 
            request.PrepaymentAmount
        );
        return Ok(sim);
    }

    public record PrepaymentRequest(decimal PrepaymentAmount);
}

[ApiController]
[Route("api/[controller]")]
public class SavingsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public SavingsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetSavingsGoals([FromQuery] string? familyId)
    {
        var query = _context.SavingsGoals.Include(g => g.Contributions).AsQueryable();
        if (!string.IsNullOrEmpty(familyId))
        {
            query = query.Where(g => g.FamilyId == familyId);
        }
        var goals = await query.ToListAsync();
        return Ok(goals);
    }

    [HttpPost]
    public async Task<IActionResult> CreateGoal([FromBody] SavingsGoal goal)
    {
        if (string.IsNullOrEmpty(goal.Id)) goal.Id = $"goal_{Guid.NewGuid():N}";
        await _context.SavingsGoals.AddAsync(goal);
        await _context.SaveChangesAsync();
        return Ok(goal);
    }

    [HttpPost("{id}/contribute")]
    public async Task<IActionResult> Contribute(string id, [FromBody] ContributionRequest req)
    {
        var goal = await _context.SavingsGoals.Include(g => g.Contributions).FirstOrDefaultAsync(g => g.Id == id);
        if (goal == null) return NotFound();

        var account = await _context.Accounts.FindAsync(req.FromAccountId);
        if (account != null)
        {
            if (account.CurrentBalance < req.Amount)
                return BadRequest(new { message = "Insufficient account balance." });
            account.CurrentBalance -= req.Amount;
        }

        var contrib = new SavingsContribution
        {
            Id = $"contrib_{Guid.NewGuid():N}",
            GoalId = id,
            UserId = req.UserId,
            UserName = req.UserName,
            Amount = req.Amount,
            Date = DateTime.UtcNow,
            FromAccountId = req.FromAccountId,
            Note = req.Note
        };

        goal.CurrentAmount += req.Amount;
        if (goal.CurrentAmount >= goal.TargetAmount)
        {
            goal.Status = "completed";
        }

        await _context.SavingsContributions.AddAsync(contrib);
        await _context.SaveChangesAsync();

        return Ok(new { goal, contribution = contrib });
    }

    public record ContributionRequest(string UserId, string UserName, decimal Amount, string FromAccountId, string? Note);
}

[ApiController]
[Route("api/[controller]")]
public class RecurringController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public RecurringController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetRecurring()
    {
        var list = await _context.RecurringTransactions.ToListAsync();
        return Ok(list);
    }

    [HttpPost]
    public async Task<IActionResult> CreateRecurring([FromBody] RecurringTransaction item)
    {
        if (string.IsNullOrEmpty(item.Id)) item.Id = $"rec_{Guid.NewGuid():N}";
        await _context.RecurringTransactions.AddAsync(item);
        await _context.SaveChangesAsync();
        return Ok(item);
    }

    [HttpPut("{id}/toggle")]
    public async Task<IActionResult> ToggleStatus(string id)
    {
        var item = await _context.RecurringTransactions.FindAsync(id);
        if (item == null) return NotFound();

        item.Status = item.Status == "active" ? "paused" : "active";
        await _context.SaveChangesAsync();
        return Ok(item);
    }
}

[ApiController]
[Route("api/[controller]")]
public class FamilyController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public FamilyController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetFamily(string id)
    {
        var family = await _context.Families
            .Include(f => f.Members)
            .FirstOrDefaultAsync(f => f.Id == id);

        if (family == null)
        {
            family = await _context.Families.Include(f => f.Members).FirstOrDefaultAsync();
        }

        if (family == null) return NotFound();
        return Ok(family);
    }

    [HttpPost("invite")]
    public async Task<IActionResult> InviteMember([FromBody] InviteRequest request)
    {
        var newMember = new FamilyMember
        {
            Id = $"mem_{Guid.NewGuid():N}",
            FamilyId = request.FamilyId,
            UserId = $"usr_{Guid.NewGuid():N}",
            Name = request.Name,
            Email = request.Email,
            Role = Enum.TryParse<FamilyRole>(request.Role, out var role) ? role : FamilyRole.AdultMember,
            Avatar = "https://images.unsplash.com/photo-1535713875002?w=150&auto=format&fit=crop&q=80",
            JoinedDate = DateTime.UtcNow,
            IsOnline = false
        };

        await _context.FamilyMembers.AddAsync(newMember);
        await _context.SaveChangesAsync();
        return Ok(newMember);
    }

    public record InviteRequest(string FamilyId, string Name, string Email, string Role);
}

[ApiController]
[Route("api/[controller]")]
public class AutoTrackingController : ControllerBase
{
    private readonly IMessageParsingService _parserService;

    public AutoTrackingController(IMessageParsingService parserService)
    {
        _parserService = parserService;
    }

    [HttpPost("parse")]
    public IActionResult Parse([FromBody] ParseMessageRequest request)
    {
        var result = _parserService.ParseMessage(request.RawText, request.Source);
        return Ok(result);
    }

    public record ParseMessageRequest(string RawText, string Source);
}
