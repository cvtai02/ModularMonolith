using SharedKernel.Abstractions.Contracts;

namespace Intermediary.Events.Inventory;

public class ReservationRejected : IntegrationEvent
{
    public int OrderId { get; init; }
    public IReadOnlyDictionary<string, string[]> Errors { get; init; } = new Dictionary<string, string[]>();
}
