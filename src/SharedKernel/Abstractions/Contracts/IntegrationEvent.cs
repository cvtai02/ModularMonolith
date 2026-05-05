using MediatR;

namespace SharedKernel.Abstractions.Contracts;

public abstract class IntegrationEvent : INotification
{
    public Guid Id { get; } = Guid.NewGuid();
    public int EntityId { get; }
    public DateTime OccurredOn { get; } = DateTime.UtcNow;
}