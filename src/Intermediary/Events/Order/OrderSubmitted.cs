using SharedKernel.Abstractions.Contracts;

namespace Intermediary.Events.Order;

public class OrderSubmitted : IntegrationEvent
{
    public int OrderId { get; init; }
    public string OrderCode { get; init; } = string.Empty;
    public string CurrencyCode { get; init; } = string.Empty;
    public IReadOnlyCollection<OrderSubmittedItem> Items { get; init; } = [];
}

public class OrderSubmittedItem
{
    public int VariantId { get; init; }
    public int Quantity { get; init; }
}
