using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace Order.Api.Hubs;

[Authorize]
public class OrderHub(OrderDbContext db) : Hub
{
    public async Task JoinOrder(int orderId)
    {
        var userId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        if (orderId <= 0 || string.IsNullOrWhiteSpace(userId))
        {
            throw new HubException("Order is not available.");
        }

        var canAccessOrder = await db.Orders
            .AsNoTracking()
            .AnyAsync(x => x.Id == orderId && x.CustomerId == userId, Context.ConnectionAborted);

        if (!canAccessOrder)
        {
            throw new HubException("Order is not available.");
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, OrderRealtimeGroups.Order(orderId), Context.ConnectionAborted);
    }

    public Task LeaveOrder(int orderId)
        => Groups.RemoveFromGroupAsync(Context.ConnectionId, OrderRealtimeGroups.Order(orderId), Context.ConnectionAborted);
}
