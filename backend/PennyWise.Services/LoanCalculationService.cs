using PennyWise.Core.Entities;

namespace PennyWise.Services;

public class AmortizationScheduleRow
{
    public int MonthNumber { get; set; }
    public decimal OpeningPrincipal { get; set; }
    public decimal EmiAmount { get; set; }
    public decimal PrincipalPaid { get; set; }
    public decimal InterestPaid { get; set; }
    public decimal ClosingPrincipal { get; set; }
}

public class PrepaymentResult
{
    public int MonthsReduced { get; set; }
    public decimal TotalInterestSaved { get; set; }
    public decimal NewTotalInterest { get; set; }
}

public interface ILoanCalculationService
{
    List<AmortizationScheduleRow> GenerateAmortizationSchedule(decimal principal, double annualRate, int tenureMonths, decimal emiAmount);
    PrepaymentResult SimulatePrepayment(decimal outstandingPrincipal, double annualRate, int remainingMonths, decimal emiAmount, decimal prepaymentAmount);
}

public class LoanCalculationService : ILoanCalculationService
{
    public List<AmortizationScheduleRow> GenerateAmortizationSchedule(decimal principal, double annualRate, int tenureMonths, decimal emiAmount)
    {
        var schedule = new List<AmortizationScheduleRow>();
        decimal currentPrincipal = principal;
        double monthlyRate = (annualRate / 100.0) / 12.0;

        for (int month = 1; month <= tenureMonths && currentPrincipal > 0; month++)
        {
            decimal interest = Math.Round(currentPrincipal * (decimal)monthlyRate, 2);
            decimal actualEmi = Math.Min(emiAmount, currentPrincipal + interest);
            decimal principalPaid = actualEmi - interest;
            decimal closingPrincipal = Math.Max(0, currentPrincipal - principalPaid);

            schedule.Add(new AmortizationScheduleRow
            {
                MonthNumber = month,
                OpeningPrincipal = currentPrincipal,
                EmiAmount = actualEmi,
                PrincipalPaid = principalPaid,
                InterestPaid = interest,
                ClosingPrincipal = closingPrincipal
            });

            currentPrincipal = closingPrincipal;
        }

        return schedule;
    }

    public PrepaymentResult SimulatePrepayment(decimal outstandingPrincipal, double annualRate, int remainingMonths, decimal emiAmount, decimal prepaymentAmount)
    {
        if (prepaymentAmount <= 0)
        {
            return new PrepaymentResult { MonthsReduced = 0, TotalInterestSaved = 0 };
        }

        double monthlyRate = (annualRate / 100.0) / 12.0;

        // Baseline total interest without prepayment
        decimal baselineInterest = 0;
        decimal p1 = outstandingPrincipal;
        int m1 = 0;
        while (p1 > 0 && m1 < remainingMonths + 50)
        {
            m1++;
            decimal interest = Math.Round(p1 * (decimal)monthlyRate, 2);
            baselineInterest += interest;
            decimal principalPortion = Math.Min(p1, emiAmount - interest);
            p1 -= principalPortion;
        }

        // New total interest with lump sum prepayment
        decimal newInterest = 0;
        decimal p2 = Math.Max(0, outstandingPrincipal - prepaymentAmount);
        int m2 = 0;
        while (p2 > 0 && m2 < remainingMonths + 50)
        {
            m2++;
            decimal interest = Math.Round(p2 * (decimal)monthlyRate, 2);
            newInterest += interest;
            decimal principalPortion = Math.Min(p2, emiAmount - interest);
            p2 -= principalPortion;
        }

        int monthsSaved = Math.Max(0, m1 - m2);
        decimal interestSaved = Math.Max(0, baselineInterest - newInterest);

        return new PrepaymentResult
        {
            MonthsReduced = monthsSaved,
            TotalInterestSaved = interestSaved,
            NewTotalInterest = newInterest
        };
    }
}

