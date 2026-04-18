using Content;
using Identity;
using ProductCatalog;
using SharedKernel.Abstractions.Contracts;

namespace AppHost.Buildings;

public static class ModuleList
{
    public static List<Module> Get(IHostApplicationBuilder builder)
    {
        return [
            new IdentityModule(builder),
            new ProductCatalogModule(builder),
            new ContentModule(builder)
        ];
    }
};