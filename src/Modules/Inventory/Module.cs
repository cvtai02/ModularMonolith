using Intermediary.Events.Order;
using Inventory.Core.EventHandlers;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Inventory.Core.Usecases.Inventory;

namespace Inventory;

public class InventoryModule(IHostApplicationBuilder b) : Module(b)
{
    public override string Key => ModuleConstants.Key;

    protected override void RegisterDbContext()
    {
        CommonRegisterDbContext<InventoryDbContext>();
    }

    public override void RegisterModule()
    {
        base.RegisterModule();
        RegisterUsecases();
    }

    protected override void RegisterUsecases()
    {
        Services.AddScoped<InitializeProductInventory>();
        Services.AddScoped<ImportVariantInventory>();
    }

    public override void Run(WebApplication app)
    {
    }
}

public static class ModuleConstants
{
    public const string Key = "Inventory";
}
