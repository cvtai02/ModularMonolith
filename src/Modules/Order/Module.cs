using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
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
        Services.AddScoped<ListOrders>();
        Services.AddScoped<GetOrderById>();
        Services.AddScoped<CreateOrder>();
        Services.AddScoped<UpdateOrderStatus>();
        Services.AddScoped<DeleteOrder>();
    }
}

public static class ModuleConstants
{
    public const string Key = "Order";
}
