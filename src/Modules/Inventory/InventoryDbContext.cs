using Inventory.Core.Entities;
using Microsoft.EntityFrameworkCore;
using SharedKernel.Abstractions.Services;

namespace Inventory;

public class InventoryDbContext : TenancyDbContext
{
    public InventoryDbContext(DbContextOptions<InventoryDbContext> options, ITenant? tenant) : base(options, tenant)
    {
    }

    public DbSet<ProductInventory> ProductInventories => Set<ProductInventory>();
    public DbSet<VariantInventory> VariantInventories => Set<VariantInventory>();
    public DbSet<VariantTracking> VariantTrackings => Set<VariantTracking>();
    public DbSet<Batch> Batches => Set<Batch>();
    public DbSet<Reservation> Reservations => Set<Reservation>();
    public DbSet<Transaction> Transactions => Set<Transaction>();
}
