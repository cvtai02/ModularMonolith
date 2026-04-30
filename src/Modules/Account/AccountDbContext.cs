using Account.Core.Entities;
using Microsoft.EntityFrameworkCore;
using SharedKernel.Abstractions.Services;

namespace Account;

public class AccountDbContext(DbContextOptions<AccountDbContext> options, ITenant? tenant)
    : TenancyDbContext(options, tenant)
{
    public DbSet<AccountProfile> Profiles => Set<AccountProfile>();
    public DbSet<AccountAddress> Addresses => Set<AccountAddress>();

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
    }
}
