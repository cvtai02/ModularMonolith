using Inventory.Core.BackgroundServices;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace Inventory;

public class InventoryModule(IHostApplicationBuilder b) : Module(b)
{
    public override string Key => ModuleConstants.Key;

    protected override void RegisterDbContext()
    {
        CommonRegisterDbContext<InventoryDbContext>();
    }

    protected override void RegisterUsecases()
    {
        Services.AddHostedService<ReservationExpiryBackgroundService>();
    }

    public override void Run(WebApplication app)
    {
    }
}

public static class ModuleConstants
{
    public const string Key = "Inventory";
}
