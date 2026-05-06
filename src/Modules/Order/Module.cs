using Intermediary.Events.Inventory;
using Intermediary.Events.Payment;
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
        Services.AddScoped<AdminCreateOrder>();
        Services.AddScoped<GetOrderByCode>();
        Services.AddScoped<ListOrders>();
        Services.AddScoped<OrderRealtimeNotifier>();
        Services.AddScoped<IIntegrationEventHandler<InventoryReserved>, InventoryReservedHandler>();
        Services.AddScoped<IIntegrationEventHandler<ReservationRejected>, ReservationRejectedHandler>();
        Services.AddScoped<IIntegrationEventHandler<ReservationCommited>, ReservationCommitedHandler>();
        Services.AddScoped<IIntegrationEventHandler<ReservationExpired>, ReservationExpiredHandler>();
        Services.AddScoped<IIntegrationEventHandler<PaymentSucceeded>, PaymentSucceededHandler>();
        Services.AddScoped<IIntegrationEventHandler<PaymentFailed>, PaymentFailedHandler>();
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
