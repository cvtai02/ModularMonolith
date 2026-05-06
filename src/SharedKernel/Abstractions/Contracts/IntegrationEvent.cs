using MediatR;

namespace SharedKernel.Abstractions.Contracts;

public abstract class IntegrationEvent : INotification
{
    public Guid Id { get; } = Guid.NewGuid();
    public DateTime OccurredOn { get; } = DateTime.UtcNow;
}