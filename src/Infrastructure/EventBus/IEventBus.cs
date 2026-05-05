using SharedKernel.Abstractions.Contracts;

namespace Infrastructure.EventBus;

public interface IEventBus
{
    Task Publish<T>(T @event, CancellationToken ct = default)
        where T : IntegrationEvent;
}
