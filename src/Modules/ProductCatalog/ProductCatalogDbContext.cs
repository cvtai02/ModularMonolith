using Microsoft.EntityFrameworkCore;
using ProductCatalog.Core.Entities;
using SharedKernel.Abstractions.Services;

namespace ProductCatalog;

public class ProductCatalogDbContext: TenancyDbContext
{
    public ProductCatalogDbContext(DbContextOptions<ProductCatalogDbContext> options, ITenant? tenant) : base (options, tenant){}
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Variant> Variants => Set<Variant>();
    public DbSet<Option> Options => Set<Option>();
    public DbSet<OptionValue> OptionValues => Set<OptionValue>();
    public DbSet<VariantOptionValue> VariantOptionValues => Set<VariantOptionValue>();
    public DbSet<ProductShipping> ProductShippings => Set<ProductShipping>();
    public DbSet<VariantShipping> VariantShippings => Set<VariantShipping>();
    public DbSet<Collection> Collections => Set<Collection>();
    public DbSet<CollectionProduct> CollectionProducts => Set<CollectionProduct>();
    public DbSet<ProductMedia> ProductMedias => Set<ProductMedia>();
    public DbSet<ProductMetric> ProductMetrics => Set<ProductMetric>();
    public DbSet<VariantMetric> VariantMetrics => Set<VariantMetric>();
}
