using Payment.Core.Entities;
using Payment.Core.Strategies;

namespace Payment.Infrastructure.PaymentMethods;

public class CashOnDeliveryPaymentMethodStrategy : IPaymentMethodStrategy
{
    public string Code => "CashOnDelivery";
    public string DisplayName => "Cash on delivery";
    public bool RequiresRedirect => false;

    public Task<PaymentCheckoutResult> CreateCheckoutAsync(
        PaymentCheckoutContext context,
        CancellationToken ct)
    {
        return Task.FromResult(new PaymentCheckoutResult(
            $"{Code.ToLowerInvariant()}_{Guid.NewGuid():N}",
            PaymentStatus.Pending,
            null));
    }

    public Task<PaymentWebhookResult> HandleWebhookAsync(
        PaymentWebhookContext context,
        CancellationToken ct)
    {
        return Task.FromResult(new PaymentWebhookResult(
            context.Request.Status,
            NormalizeFailureReason(context.Request.FailureReason)));
    }

    private static string? NormalizeFailureReason(string? failureReason) =>
        string.IsNullOrWhiteSpace(failureReason) ? null : failureReason.Trim();
}
