using Microsoft.EntityFrameworkCore;
using Payment.Core.Entities;
using SharedKernel.Abstractions.Services;

namespace Payment;

public class PaymentDbContext(DbContextOptions<PaymentDbContext> options, ITenant? tenant) : TenancyDbContext(options, tenant)
{
    public DbSet<PaymentTransaction> Transactions => Set<PaymentTransaction>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<PaymentTransaction>(builder =>
        {
            builder.Property(x => x.OrderCode).HasMaxLength(64);
            builder.Property(x => x.CustomerId).HasMaxLength(450);
            builder.Property(x => x.Amount).HasPrecision(18, 2);
            builder.Property(x => x.CurrencyCode).HasMaxLength(3);
            builder.Property(x => x.Provider).HasMaxLength(64);
            builder.Property(x => x.ProviderPaymentId).HasMaxLength(256);
            builder.Property(x => x.CheckoutUrl).HasMaxLength(2000);
            builder.Property(x => x.FailureReason).HasMaxLength(2000);
            builder.HasIndex(x => x.OrderId);
            builder.HasIndex(x => new { x.Provider, x.ProviderPaymentId }).IsUnique();
        });
    }
}
