using Microsoft.EntityFrameworkCore;
using ProductCatalog.Core.Entities;
using SharedKernel.Abstractions.Services;

namespace ProductCatalog;

public class ProductCatalogDbContext: TenancyDbContext
{
    public ProductCatalogDbContext(DbContextOptions<ProductCatalogDbContext> options, IUser? user) : base (options, user){}
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Variant> Variants => Set<Variant>();
    public DbSet<Option> Options => Set<Option>();
    public DbSet<OptionValue> OptionValues => Set<OptionValue>();
    public DbSet<VariantOptionValue> VariantOptionValues => Set<VariantOptionValue>();
    public DbSet<Collection> Collections => Set<Collection>();
    public DbSet<CollectionProduct> CollectionProducts => Set<CollectionProduct>();
    public DbSet<ProductMedia> ProductMedias => Set<ProductMedia>();
}