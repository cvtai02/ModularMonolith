using Payment.Core.Entities;

namespace Payment.Core.DTOs;

public class PaymentTransactionResponse
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public string OrderCode { get; set; } = string.Empty;
    public string? CustomerId { get; set; }
    public decimal Amount { get; set; }
    public string CurrencyCode { get; set; } = string.Empty;
    public string Provider { get; set; } = string.Empty;
    public string ProviderPaymentId { get; set; } = string.Empty;
    public PaymentStatus Status { get; set; }
    public string? CheckoutUrl { get; set; }
    public string? FailureReason { get; set; }
    public DateTimeOffset? PaidAt { get; set; }
    public DateTimeOffset? CancelledAt { get; set; }
    public DateTimeOffset Created { get; set; }
    public DateTimeOffset LastModified { get; set; }
}
