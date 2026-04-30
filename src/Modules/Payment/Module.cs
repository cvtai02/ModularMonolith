using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Payment.Core.Strategies;
using Payment.Core.Usecases;
using Payment.Infrastructure.PaymentMethods;

namespace Payment;

public class PaymentModule(IHostApplicationBuilder b) : Module(b)
{
    public override string Key => ModuleConstants.Key;

    protected override void RegisterDbContext()
    {
        CommonRegisterDbContext<PaymentDbContext>();
    }

    protected override void RegisterUsecases()
    {
        Services.AddScoped<IPaymentMethodStrategy, CashOnDeliveryPaymentMethodStrategy>();
        Services.AddScoped<PaymentMethodStrategyResolver>();
        Services.AddScoped<ListPaymentMethods>();
        Services.AddScoped<CreateOrderCheckout>();
        Services.AddScoped<GetPaymentTransactionById>();
        Services.AddScoped<HandlePaymentWebhook>();
    }
}

public static class ModuleConstants
{
    public const string Key = "Payment";
}
