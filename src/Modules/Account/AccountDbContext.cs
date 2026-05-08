using Account.Core.Entities;
using Microsoft.EntityFrameworkCore;
using SharedKernel.Abstractions.Services;

namespace Account;

public class AccountDbContext(DbContextOptions<AccountDbContext> options, ITenant? tenant)
    : TenancyDbContext(options, tenant)
{
    public DbSet<AccountProfile> Profiles => Set<AccountProfile>();
    public DbSet<AccountAddress> Addresses => Set<AccountAddress>();
    public DbSet<Notification> Notifications => Set<Notification>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<AccountProfile>()
            .HasIndex(x => new { x.TenantId, x.IdentityUserId })
            .IsUnique()
            .HasFilter("\"IsDeleted\" = false");

        modelBuilder.Entity<AccountProfile>()
            .HasMany(x => x.Addresses)
            .WithOne(x => x.Profile)
            .HasForeignKey(x => x.AccountProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Notification>(builder =>
        {
            builder.Property(x => x.RecipientUserId).HasMaxLength(450);
            builder.Property(x => x.RecipientRole).HasMaxLength(100);
            builder.Property(x => x.Type).HasMaxLength(100);
            builder.Property(x => x.Title).HasMaxLength(200);
            builder.Property(x => x.Message).HasMaxLength(1000);
            builder.Property(x => x.EntityType).HasMaxLength(100);
            builder.Property(x => x.EntityId).HasMaxLength(100);
            builder.Property(x => x.PayloadJson).HasColumnType("jsonb");
            builder.Property(x => x.ReadByUserId).HasMaxLength(450);
            builder.HasIndex(x => new { x.TenantId, x.IsRead, x.Created });
            builder.HasIndex(x => new { x.TenantId, x.EntityType, x.EntityId });
        });
    }
}
