using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using SharedKernel.Abstractions.Services;

namespace SharedKernel.Abstractions.Contracts;

public abstract class TenancyDbContext : DbContext
{
    protected readonly ITenant _tenant;

    protected TenancyDbContext(DbContextOptions options, ITenant? tenant) : base(options)
    {
        _tenant = tenant ?? new AnonymousTenant();
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        var entityTypes = modelBuilder.Model
            .GetEntityTypes()
            .Where(e => typeof(Entity).IsAssignableFrom(e.ClrType))
            .ToList();

        foreach (var entityType in entityTypes)
        {
            modelBuilder.Entity(entityType.ClrType).HasIndex(nameof(Entity.TenantId));

            var param = Expression.Parameter(entityType.ClrType, "x");
            var tenantIdProp = Expression.Property(param, nameof(Entity.TenantId));
            var filter = Expression.Lambda(
                Expression.Equal(tenantIdProp, Expression.Constant(_tenant.Id)),
                param
            );
            modelBuilder.Entity(entityType.ClrType).HasQueryFilter(filter);
        }
    }

    private class AnonymousTenant : ITenant
    {
        public int Id => 0;
        public string Name => throw new NotImplementedException();
        public string Signature => throw new NotImplementedException();
        public string Domain => throw new NotImplementedException();
    }
}