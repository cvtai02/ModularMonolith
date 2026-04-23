using Microsoft.Extensions.Hosting;

namespace Cart;

public class CartModule(IHostApplicationBuilder b) : Module(b)
{
    public override string Key => ModuleConstants.Key;

    protected override void RegisterDbContext()
    {
        CommonRegisterDbContext<CartDbContext>();
    }
}

public static class ModuleConstants
{
    public const string Key = "Cart";
}
