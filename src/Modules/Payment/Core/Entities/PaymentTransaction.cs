namespace Payment.Core.Entities;

public class PaymentTransaction : AuditableEntity
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public string OrderCode { get; set; } = string.Empty;
    public string? CustomerId { get; set; }
    public decimal Amount { get; set; }
    public string CurrencyCode { get; set; } = "VND";
    public string Provider { get; set; } = "Manual";
    public string ProviderPaymentId { get; set; } = string.Empty;
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
    public string? CheckoutUrl { get; set; }
    public string? FailureReason { get; set; }
    public DateTimeOffset? PaidAt { get; set; }
    public DateTimeOffset? CancelledAt { get; set; }
}

public enum PaymentStatus
{
    Pending,
    Succeeded,
    Failed,
    Cancelled,
    Refunded
}
