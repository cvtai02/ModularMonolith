using Payment.DTOs;
using SharedKernel.Exceptions;

namespace Payment.Core.Strategies;

public class PaymentMethodStrategyResolver(IEnumerable<IPaymentMethodStrategy> strategies)
{
    private readonly IReadOnlyList<IPaymentMethodStrategy> _strategies = strategies.ToList();

    public IReadOnlyList<PaymentMethodResponse> ListMethods() =>
        _strategies
            .OrderBy(x => x.DisplayName)
            .Select(x => new PaymentMethodResponse
            {
                Code = x.Code,
                DisplayName = x.DisplayName,
                RequiresRedirect = x.RequiresRedirect
            })
            .ToList();

    public IPaymentMethodStrategy Resolve(string? provider)
    {
        var code = string.IsNullOrWhiteSpace(provider) ? "CashOnDelivery" : provider.Trim();
        var strategy = _strategies.FirstOrDefault(x =>
            string.Equals(x.Code, code, StringComparison.OrdinalIgnoreCase));

        if (strategy is null)
            throw new ValidationException("Validation failed", new Dictionary<string, string[]>
            {
                ["provider"] = [$"Payment provider '{code}' is not supported."]
            });

        return strategy;
    }
}
