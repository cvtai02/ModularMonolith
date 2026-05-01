using Payment.DTOs;
using Payment.Core.Strategies;

namespace Payment.Core.Usecases;

public class ListPaymentMethods(PaymentMethodStrategyResolver resolver)
{
    public IReadOnlyList<PaymentMethodResponse> Execute() => resolver.ListMethods();
}
