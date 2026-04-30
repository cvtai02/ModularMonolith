using SharedKernel.Abstractions.Contracts;

namespace Intermediary.Events.Payment;

public class PaymentFailed : IntegrationEvent
{
    public int OrderId { get; set; }
    public string OrderCode { get; set; } = string.Empty;
    public int PaymentTransactionId { get; set; }
    public string Provider { get; set; } = string.Empty;
    public string ProviderPaymentId { get; set; } = string.Empty;
    public string? FailureReason { get; set; }
}
