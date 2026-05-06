using SharedKernel.Abstractions.Contracts;

namespace Intermediary.Events.Order;

public class OrderPlaced : IntegrationEvent
{
    public string OrderCode { get; init; } = string.Empty;
}
