using MediatR;
using SharedKernel.Abstractions.Contracts;

namespace Infrastructure.EventBus;

public class MediatREventBus(IPublisher publisher) : IEventBus
{
    public Task Publish<T>(T @event, CancellationToken ct = default)
        where T : IntegrationEvent
        => publisher.Publish(@event, ct);
}