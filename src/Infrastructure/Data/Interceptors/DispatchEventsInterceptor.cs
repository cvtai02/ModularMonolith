using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using SharedKernel.Abstractions.Contracts;
using SharedKernel.Abstractions.Services;

namespace Infrastructure.Data.Interceptors;

public class DispatchEventsInterceptor : SaveChangesInterceptor
{
    private readonly IEventBus _eventBus;

    public DispatchEventsInterceptor(IEventBus eventbus)
    {
        _eventBus = eventbus;
    }

    public override InterceptionResult<int> SavingChanges(DbContextEventData eventData, InterceptionResult<int> result)
    {
        DispatchDomainEvents(eventData.Context).GetAwaiter().GetResult();

        return base.SavingChanges(eventData, result);

    }

    public override async ValueTask<InterceptionResult<int>> SavingChangesAsync(DbContextEventData eventData, InterceptionResult<int> result, CancellationToken cancellationToken = default)
    {
        await DispatchDomainEvents(eventData.Context);

        return await base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    public async Task DispatchDomainEvents(DbContext? context)
    {
        if (context == null) return;

        var entities = context.ChangeTracker
            .Entries<Entity>()
            .Where(e => e.Entity.Events.Count != 0)
            .Select(e => e.Entity);

        var domainEvents = entities
            .SelectMany(e => e.Events)
            .ToList();

        entities.ToList().ForEach(e => e.Events.Clear());

        foreach (var domainEvent in domainEvents)
            await _eventBus.Publish(domainEvent);
    }
}