using Payment.DTOs;
using Payment.Core.Entities;

namespace Payment.Core.Strategies;

public interface IPaymentMethodStrategy
{
    string Code { get; }
    string DisplayName { get; }
    bool RequiresRedirect { get; }

    Task<PaymentCheckoutResult> CreateCheckoutAsync(
        PaymentCheckoutContext context,
        CancellationToken ct);

    Task<PaymentWebhookResult> HandleWebhookAsync(
        PaymentWebhookContext context,
        CancellationToken ct);
}

public record PaymentCheckoutContext(
    int OrderId,
    string OrderCode,
    decimal Amount,
    string CurrencyCode,
    string? CustomerId,
    CreateCheckoutRequest Request);

public record PaymentCheckoutResult(
    string ProviderPaymentId,
    PaymentStatus Status,
    string? CheckoutUrl);

public record PaymentWebhookContext(
    string Provider,
    PaymentWebhookRequest Request);

public record PaymentWebhookResult(
    PaymentStatus Status,
    string? FailureReason);
