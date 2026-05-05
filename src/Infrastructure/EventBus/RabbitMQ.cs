using SharedKernel.Abstractions.Contracts;

namespace Infrastructure.EventBus;

public class RabbitMQ : IEventBus
{
    public Task Publish<T>(T @event, CancellationToken ct = default) where T : IntegrationEvent
    {
        throw new NotImplementedException();
    }

}
