namespace SharedKernel.Abstractions.Contracts;

public interface IEventHandler<in T> where T : IntegrationEvent
{
    Task Handle(T @event, CancellationToken ct = default);
}