using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Order.Api.Hubs;
using Order.Core.Notifications;

namespace Order;

public class OrderModule(IHostApplicationBuilder b) : Module(b)
{
    public override string Key => ModuleConstants.Key;

    protected override void RegisterDbContext()
    {
        CommonRegisterDbContext<OrderDbContext>();
    }

    protected override void RegisterUsecases()
    {
        Services.AddScoped<OrderRealtimeNotifier>();
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
