using Intermediary.Events.Inventory;
using SharedKernel.Abstractions.Contracts;

namespace Order.Core.EventHandlers;

public class ReservationCommitedHandler : IIntegrationEventHandler<ReservationCommited>
{
    public Task Handle(ReservationCommited @event, CancellationToken ct = default) => Task.CompletedTask;
}
