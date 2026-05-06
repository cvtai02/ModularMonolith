using SharedKernel.Abstractions.Contracts;

namespace Intermediary.Events.Order;

public class OrderPaid : IntegrationEvent
{
    public string OrderCode { get; init; } = string.Empty;
    public int PaymentTransactionId { get; init; }
    public decimal Amount { get; init; }
    public string CurrencyCode { get; init; } = string.Empty;
    public DateTimeOffset PaidAt { get; init; }
}
