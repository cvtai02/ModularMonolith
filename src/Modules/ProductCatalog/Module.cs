using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Intermediary.Media;
using ProductCatalog.Core.Services;
using ProductCatalog.Core.Usecases.Products;
using ProductCatalog.Core.Usecases.Categories;
using ProductCatalog.Core.Usecases.Collections;
using Intermediary.Ordering;

namespace ProductCatalog;

public class ProductCatalogModule(IHostApplicationBuilder b) : Module(b)
{
    public override string Key => ModuleConstants.Key;

    public override void RegisterModule()
    {
        base.RegisterModule();
    }

    protected override void RegisterDbContext()
    {
        CommonRegisterDbContext<ProductCatalogDbContext>();
    }

    protected override void RegisterUsecases()
    {
        Services.AddScoped<ListCategories>();
        Services.AddScoped<GetCategoryByName>();
        Services.AddScoped<CreateCategory>();
        Services.AddScoped<UpdateCategory>();
        Services.AddScoped<DeleteCategory>();

        Services.AddScoped<ListCollections>();
        Services.AddScoped<GetCollectionById>();
        Services.AddScoped<CreateCollection>();
        Services.AddScoped<UpdateCollection>();
        Services.AddScoped<DeleteCollection>();

        Services.AddScoped<ListProducts>();
        Services.AddScoped<GetProductById>();
        Services.AddScoped<CreateProduct>();
        Services.AddScoped<UpdateProduct>();

        Services.AddScoped<IMediaUsageChecker, ProductMediaUsageChecker>();
        Services.AddScoped<IOrderProductLookup, OrderProductLookup>();
    }
}

public static class ModuleConstants
{
    public const string Key = "ProductCatalog";
}
