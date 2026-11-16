using Microsoft.AspNetCore.SignalR;

namespace PennyWise.API.Hubs;

public class FinanceHub : Hub
{
    public async Task JoinFamilyGroup(string familyId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"family_{familyId}");
    }

    public async Task LeaveFamilyGroup(string familyId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"family_{familyId}");
    }

    public async Task BroadcastFamilyTransaction(string familyId, object transaction)
    {
        await Clients.Group($"family_{familyId}").SendAsync("OnTransactionRecorded", transaction);
    }

    public async Task BroadcastBudgetAlert(string familyId, object alert)
    {
        await Clients.Group($"family_{familyId}").SendAsync("OnBudgetThresholdCrossed", alert);
    }
}

