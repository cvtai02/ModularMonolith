using SharedKernel.Abstractions.Contracts;

namespace Intermediary.Events.Inventory;

public class ReservationRejected : IntegrationEvent
{
    public string OrderCode { get; set; } = string.Empty;
    public IReadOnlyDictionary<string, string[]> Errors { get; init; } = new Dictionary<string, string[]>();
}
