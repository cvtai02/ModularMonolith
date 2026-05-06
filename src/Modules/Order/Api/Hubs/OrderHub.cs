using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace Order.Api.Hubs;

[Authorize]
public class OrderHub(OrderDbContext db) : Hub
{
    public async Task JoinOrder(string orderCode)
    {
        var userId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(orderCode) || string.IsNullOrWhiteSpace(userId))
        {
            throw new HubException("Order is not available.");
        }

        var normalizedCode = orderCode.Trim();
        var canAccessOrder = await db.Orders
            .AsNoTracking()
            .AnyAsync(x => x.Code == normalizedCode && x.CustomerId == userId, Context.ConnectionAborted);

        if (!canAccessOrder)
        {
            throw new HubException("Order is not available.");
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, OrderRealtimeGroups.Order(normalizedCode), Context.ConnectionAborted);
    }

    public Task LeaveOrder(string orderCode)
        => Groups.RemoveFromGroupAsync(Context.ConnectionId, OrderRealtimeGroups.Order(orderCode.Trim()), Context.ConnectionAborted);

    public Task JoinMyOrders()
    {
        var userId = GetAuthenticatedUserId();
        return Groups.AddToGroupAsync(Context.ConnectionId, OrderRealtimeGroups.Customer(userId), Context.ConnectionAborted);
    }

    public Task LeaveMyOrders()
    {
        var userId = GetAuthenticatedUserId();
        return Groups.RemoveFromGroupAsync(Context.ConnectionId, OrderRealtimeGroups.Customer(userId), Context.ConnectionAborted);
    }

    private string GetAuthenticatedUserId()
    {
        var userId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
        {
            throw new HubException("Order notifications are not available.");
        }

        return userId;
    }
}
