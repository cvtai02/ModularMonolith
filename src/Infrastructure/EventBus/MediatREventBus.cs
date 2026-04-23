using MediatR;
using SharedKernel.Abstractions.Contracts;
using SharedKernel.Abstractions.Services;

namespace Infrastructure.EventBus;

public class MediatREventBus(IMediator mediator) : IEventBus
{
    public Task Publish<T>(T @event, CancellationToken ct = default) where T : IntegrationEvent
        => mediator.Publish(new IntegrationEventNotification<T>(@event), ct);

    public void Subscribe<T, TH>()
        where T : IntegrationEvent
        where TH : IEventHandler<T>
    {
        // MediatR resolves handlers from DI at publish time — register via AddMediatR() at startup
    }
}

public record IntegrationEventNotification<T>(T Event) : INotification where T : IntegrationEvent;

public class IntegrationEventNotificationHandler<T>(IEventHandler<T> handler)
    : INotificationHandler<IntegrationEventNotification<T>>
    where T : IntegrationEvent
{
    public Task Handle(IntegrationEventNotification<T> notification, CancellationToken ct)
        => handler.Handle(notification.Event, ct);
}
