using SharedKernel.Abstractions.Contracts;

namespace Intermediary.Events.Payment;

public class PaymentSucceeded : IntegrationEvent
{
    public int OrderId { get; set; }
    public string OrderCode { get; set; } = string.Empty;
    public int PaymentTransactionId { get; set; }
    public string Provider { get; set; } = string.Empty;
    public string ProviderPaymentId { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string CurrencyCode { get; set; } = string.Empty;
    public DateTimeOffset PaidAt { get; set; }
}
