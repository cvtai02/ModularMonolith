using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Inventory.Core.Usecases.Inventory;
using SharedKernel.Abstractions.Services;

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
    }

    public override void Run(WebApplication app)
    {
        var eventBus = app.Services.GetRequiredService<IEventBus>();
    }
}

public static class ModuleConstants
{
    public const string Key = "Inventory";
}
