using Microsoft.Extensions.Hosting;

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
    }
}

public static class ModuleConstants
{
    public const string Key = "Order";
}
