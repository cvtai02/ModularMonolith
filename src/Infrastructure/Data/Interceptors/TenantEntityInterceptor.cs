using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using SharedKernel.Abstractions.Contracts;
using SharedKernel.Abstractions.Services;

namespace Infrastructure.Data.Interceptors;

public class TenantEntityInterceptor(ITenant tenant) : SaveChangesInterceptor
{
    private readonly ITenant _tenant = tenant;

    public override InterceptionResult<int> SavingChanges(DbContextEventData eventData, InterceptionResult<int> result)
    {
        UpdateEntities(eventData.Context);
        return base.SavingChanges(eventData, result);
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        UpdateEntities(eventData.Context);
        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    private void UpdateEntities(DbContext? context)
    {
        if (context == null) return;

        foreach (var entry in context.ChangeTracker.Entries<Entity>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.TenantId = _tenant.Id;
            }
            else
            {
                var tenantProp = entry.Property(e => e.TenantId);
                if (tenantProp.IsModified)
                    tenantProp.CurrentValue = tenantProp.OriginalValue;
            }
        }
    }
}
