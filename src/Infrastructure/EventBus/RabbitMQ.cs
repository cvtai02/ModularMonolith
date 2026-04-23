using SharedKernel.Abstractions.Contracts;
using SharedKernel.Abstractions.Services;

namespace Infrastructure.EventBus;

public class RabbitMQ : IEventBus
{
    public Task Publish<T>(T @event, CancellationToken ct = default) where T : IntegrationEvent
    {
        throw new NotImplementedException();
    }

    public void Subscribe<T, TH>()
        where T : IntegrationEvent
        where TH : IEventHandler<T>
    {
        throw new NotImplementedException();
    }
}