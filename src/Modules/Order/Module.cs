using Intermediary.Events.Inventory;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Order.Core.EventHandlers;
using Order.Core.Usecases.Orders;
using SharedKernel.Abstractions.Contracts;

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
        Services.AddScoped<IEventHandler<InventoryReserved>, InventoryReservedHandler>();
        Services.AddScoped<IEventHandler<ReservationRejected>, ReservationRejectedHandler>();
        Services.AddScoped<IEventHandler<ReservationCommited>, ReservationCommitedHandler>();
        Services.AddScoped<IEventHandler<ReservationExpired>, ReservationExpiredHandler>();
    }
}

public static class ModuleConstants
{
    public const string Key = "Order";
}
