using Intermediary.Events.Inventory;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Order.Api.Hubs;
using Order.Core.EventHandlers;
using Order.Core.Notifications;
using Order.Core.Usecases.Orders;

namespace Order;

public class OrderModule(IHostApplicationBuilder b) : Module(b)
{
    public override string Key => ModuleConstants.Key;

    public override void RegisterModule()
    {
        base.RegisterModule();
        RegisterUsecases();
    }

    protected override void RegisterDbContext()
    {
        CommonRegisterDbContext<OrderDbContext>();
    }

    protected override void RegisterUsecases()
    {
        Services.AddScoped<CreateOrder>();
        Services.AddScoped<GetOrderById>();
        Services.AddScoped<ListOrders>();
        Services.AddScoped<OrderRealtimeNotifier>();
        Services.AddScoped<IEventHandler<InventoryReserved>, InventoryReservedHandler>();
        Services.AddScoped<IEventHandler<ReservationRejected>, ReservationRejectedHandler>();
        Services.AddScoped<IEventHandler<ReservationCommited>, ReservationCommitedHandler>();
        Services.AddScoped<IEventHandler<ReservationExpired>, ReservationExpiredHandler>();
    }

    public override void Run(WebApplication app)
    {
        app.MapHub<OrderHub>("/hubs/orders").RequireAuthorization();
    }
}

public static class ModuleConstants
{
    public const string Key = "Order";
}
