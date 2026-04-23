using SharedKernel.Abstractions.Contracts;

namespace SharedKernel.Abstractions.Services;

public interface IEventBus
{
    Task Publish<T>(T @event, CancellationToken ct = default)
        where T : IntegrationEvent;

    void Subscribe<T, TH>()
        where T : IntegrationEvent
        where TH : IEventHandler<T>;
}
