using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Hosting;

namespace Inventory;

public class InventoryModule(IHostApplicationBuilder b) : Module(b)
{
    public override string Key => ModuleConstants.Key;

    protected override void RegisterDbContext()
    {
        CommonRegisterDbContext<InventoryDbContext>();
    }

    public override void Run(WebApplication app)
    {
    }
}

public static class ModuleConstants
{
    public const string Key = "Inventory";
}
