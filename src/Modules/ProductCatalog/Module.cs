using Microsoft.Extensions.Hosting;

namespace ProductCatalog;

public class ProductCatalogModule(IHostApplicationBuilder b) : Module(b)
{
    public override string Key => ModuleConstants.Key;
    protected override void RegisterDbContext()
    {
        CommonRegisterDbContext<ProductCatalogDbContext>();
    }
}

public static class ModuleConstants
{
    public const string Key = "ProductCatalog";
}
