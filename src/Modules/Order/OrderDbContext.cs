using Microsoft.EntityFrameworkCore;
using Order.Core.Entities;
using SharedKernel.Abstractions.Services;
using SharedKernel.Abstractions.Contracts;

namespace Order;

public class OrderDbContext : TenancyDbContext
{
    public OrderDbContext(DbContextOptions<OrderDbContext> options, ITenant? tenant) : base(options, tenant)
    {
    }

    public DbSet<Core.Entities.Order> Orders => Set<Core.Entities.Order>();
    public DbSet<OrderLine> OrderLines => Set<OrderLine>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Core.Entities.Order>(builder =>
        {
            builder.Property(order => order.Code).HasMaxLength(64);
            builder.Property(order => order.CurrencyCode).HasMaxLength(3);
            builder.Property(order => order.TotalAmount).HasPrecision(18, 2);
            builder.HasIndex(order => order.Code).IsUnique();
            builder.OwnsOne(order => order.ShippingAddress, sa =>
            {
                sa.Property(a => a.OwnerName).HasMaxLength(200);
                sa.Property(a => a.PhoneNumber).HasMaxLength(50);
                sa.Property(a => a.Email).HasMaxLength(200);
                sa.Property(a => a.Country).HasMaxLength(100);
                sa.Property(a => a.State).HasMaxLength(100);
                sa.Property(a => a.City).HasMaxLength(100);
                sa.Property(a => a.PostalCode).HasMaxLength(20);
                sa.Property(a => a.Line1).HasMaxLength(500);
                sa.Property(a => a.Line2).HasMaxLength(500);
            });
        });

        modelBuilder.Entity<OrderLine>(builder =>
        {
            builder.Property(line => line.ProductName).HasMaxLength(256);
            builder.Property(line => line.UnitPrice).HasPrecision(18, 2);
            builder.Property(line => line.Subtotal).HasPrecision(18, 2);
        });
    }
}
