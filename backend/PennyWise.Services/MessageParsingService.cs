using System.Text.RegularExpressions;
using PennyWise.Core.Entities;

namespace PennyWise.Services;

public class ParsedMessageResult
{
    public bool Success { get; set; }
    public decimal Amount { get; set; }
    public string Merchant { get; set; } = "Unknown Merchant";
    public string TransactionType { get; set; } = "debit"; // debit or credit
    public string AccountLast4 { get; set; } = string.Empty;
    public string ReferenceNumber { get; set; } = string.Empty;
    public string SuggestedCategory { get; set; } = "Groceries & Supplies";
    public double Confidence { get; set; }
    public bool IsFailedPayment { get; set; }
}

public interface IMessageParsingService
{
    ParsedMessageResult ParseMessage(string rawText, string source);
}

public class MessageParsingService : IMessageParsingService
{
    public ParsedMessageResult ParseMessage(string rawText, string source)
    {
        if (string.IsNullOrWhiteSpace(rawText))
        {
            return new ParsedMessageResult { Success = false };
        }

        var isFailed = Regex.IsMatch(rawText, @"\b(failed|declined|unsuccessful|reversed)\b", RegexOptions.IgnoreCase);
        var isCredit = Regex.IsMatch(rawText, @"\b(credited|received|deposit|refund)\b", RegexOptions.IgnoreCase);

        // Extract Amount: e.g. "INR 3,450.00" or "Rs. 650.00" or "Rs 1,85,000.00"
        var amountMatch = Regex.Match(rawText, @"(?:INR|Rs\.?)\s*([0-9,]+(?:\.[0-9]{2})?)", RegexOptions.IgnoreCase);
        decimal extractedAmount = 0m;
        if (amountMatch.Success)
        {
            var rawAmtStr = amountMatch.Groups[1].Value.Replace(",", "");
            decimal.TryParse(rawAmtStr, out extractedAmount);
        }

        // Extract Reference Number
        var refMatch = Regex.Match(rawText, @"(?:Ref|UPI Ref|Txn ID|Reference|Ref No)[:\s]*([A-Za-z0-9\-]+)", RegexOptions.IgnoreCase);
        var refNo = refMatch.Success ? refMatch.Groups[1].Value : $"REF-{Guid.NewGuid().ToString().Substring(0, 8)}";

        // Extract Account Last 4
        var acctMatch = Regex.Match(rawText, @"(?:A/c|card|A/C|xx)\s*([0-9]{4})", RegexOptions.IgnoreCase);
        var acctLast4 = acctMatch.Success ? acctMatch.Groups[1].Value : "4192";

        // Extract Merchant and Category
        string merchant = "Unknown Merchant";
        string category = "Other Expenses";

        var upper = rawText.ToUpper();
        if (upper.Contains("BLINKIT")) { merchant = "Blinkit Instamart"; category = "Groceries & Supplies"; }
        else if (upper.Contains("BARBEQUE NATION")) { merchant = "Barbeque Nation"; category = "Food & Dining Out"; }
        else if (upper.Contains("HDFC HOME LOAN")) { merchant = "HDFC Home Loan"; category = "EMI & Loans"; }
        else if (upper.Contains("TECHCORP")) { merchant = "TechCorp Solutions Ltd."; category = "Primary Salary"; }
        else if (upper.Contains("NETFLIX")) { merchant = "Netflix India"; category = "Entertainment & OTT"; }
        else if (upper.Contains("TATA POWER")) { merchant = "Tata Power Electricity"; category = "Bills & Utilities"; }
        else if (upper.Contains("ZARA")) { merchant = "Zara Lifestyle"; category = "Shopping & Apparel"; }
        else if (upper.Contains("APOLLO")) { merchant = "Apollo Pharmacy"; category = "Healthcare & Medicines"; }

        double confidence = 0.85;
        if (extractedAmount > 0) confidence += 0.05;
        if (refMatch.Success) confidence += 0.05;

        return new ParsedMessageResult
        {
            Success = extractedAmount > 0,
            Amount = extractedAmount,
            Merchant = merchant,
            TransactionType = isCredit ? "credit" : "debit",
            AccountLast4 = acctLast4,
            ReferenceNumber = refNo,
            SuggestedCategory = category,
            Confidence = confidence,
            IsFailedPayment = isFailed
        };
    }
}

