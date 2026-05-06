using SharedKernel.Abstractions.Contracts;

namespace Intermediary.Events.Payment;

public class PaymentFailed : IntegrationEvent
{
    public string OrderCode { get; set; } = string.Empty;
    public int PaymentTransactionId { get; set; }
    public string Provider { get; set; } = string.Empty;
    public string ProviderPaymentId { get; set; } = string.Empty;
    public string? FailureReason { get; set; }
}
