using Payment.Core.Entities;
using Payment.Core.Strategies;

namespace Payment.Infrastructure.PaymentMethods;

public class SepayPaymentMethodStrategy : IPaymentMethodStrategy
{
    public string Code => "Sepay";
    public string DisplayName => "Sepay";
    public bool RequiresRedirect => true;

    public Task<PaymentCheckoutResult> CreateCheckoutAsync(
        PaymentCheckoutContext context,
        CancellationToken ct)
    {
        throw new NotImplementedException("Sepay payment method is not implemented yet.");
    }

    public Task<PaymentWebhookResult> HandleWebhookAsync(
        PaymentWebhookContext context,
        CancellationToken ct)
    {
        throw new NotImplementedException("Sepay payment method is not implemented yet.");
    }
}
