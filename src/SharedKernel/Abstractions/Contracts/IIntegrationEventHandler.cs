using MediatR;

namespace SharedKernel.Abstractions.Contracts;

public interface IIntegrationEventHandler<in T> : INotificationHandler<T> where T : IntegrationEvent
{
    new Task Handle(T @event, CancellationToken ct = default);
}