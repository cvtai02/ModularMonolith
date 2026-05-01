using Payment.Core.Entities;

namespace Payment.DTOs;

public class PaymentWebhookRequest
{
    public string ProviderPaymentId { get; set; } = string.Empty;
    public PaymentStatus Status { get; set; }
    public string? FailureReason { get; set; }
    public string? EventId { get; set; }
    public string? Signature { get; set; }
}
