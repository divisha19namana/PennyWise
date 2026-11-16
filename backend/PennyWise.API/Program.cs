using Microsoft.EntityFrameworkCore;
using PennyWise.API.Hubs;
using PennyWise.Infrastructure.Data;
using PennyWise.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Database configuration: In-Memory / LocalDB fallback
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (!string.IsNullOrEmpty(connectionString))
{
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseSqlServer(connectionString));
}
else
{
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseInMemoryDatabase("PennyWiseDb"));
}

// Register Financial Business Services
builder.Services.AddScoped<ITransactionValidationService, TransactionValidationService>();
builder.Services.AddScoped<IBudgetCalculationService, BudgetCalculationService>();
builder.Services.AddScoped<ILoanCalculationService, LoanCalculationService>();
builder.Services.AddScoped<IMessageParsingService, MessageParsingService>();

// SignalR for Real-time Notifications & Alerts
builder.Services.AddSignalR();

// CORS for Frontend Vite client
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Seed initial family demo data on startup
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await DbInitializer.SeedAsync(context);
}

app.UseCors("FrontendPolicy");

app.UseAuthorization();

app.MapControllers();
app.MapHub<FinanceHub>("/hub/finance");

app.Run();
