using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using SharedKernel.Abstractions.Services;

namespace SharedKernel.Abstractions.Contracts;

public interface IReferTenantEntity;
public abstract class TenancyDbContext : DbContext
{
    protected readonly IUser _user;

    protected TenancyDbContext(DbContextOptions options, IUser? user) : base(options)
    {
        _user = user??new AnomynousUser();
    }


    public static readonly string TenantForeignKey = "TenantId";
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        var vendorEntities = modelBuilder.Model
        .GetEntityTypes()
        .Where(e => typeof(IReferTenantEntity).IsAssignableFrom(e.ClrType))
        .ToList();

        foreach (var entity in vendorEntities)
        {
            modelBuilder.Entity(entity.ClrType).Property<int?>(TenantForeignKey);
            modelBuilder.Entity(entity.ClrType)
                .HasIndex(TenantForeignKey);

             // Build: x => EF.Property<int>(x, TenantForeignKey) == user.TenantId
            var param = Expression.Parameter(entity.ClrType, "x");
            var tenantIdProperty = Expression.Call(
                typeof(EF),
                nameof(EF.Property),
                [typeof(int?)],
                param,
                Expression.Constant(TenantForeignKey)
            );
            var filter = Expression.Lambda(
                Expression.Equal(tenantIdProperty, Expression.Constant(_user.TenantId)),
                param
            );

            modelBuilder.Entity(entity.ClrType).HasQueryFilter(filter);
        }
    }
    
    private class AnomynousUser : IUser
    {
        public string Id => throw new NotImplementedException();
        public string? UserName => throw new NotImplementedException();
        public string? Email => throw new NotImplementedException();
        public string? FullName => throw new NotImplementedException();
        public int? TenantId => null;
    }
}