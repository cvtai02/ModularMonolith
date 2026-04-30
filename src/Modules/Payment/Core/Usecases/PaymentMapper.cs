using Payment.Core.DTOs;
using Payment.Core.Entities;

namespace Payment.Core.Usecases;

public static class PaymentMapper
{
    public static PaymentTransactionResponse ToResponse(PaymentTransaction transaction) => new()
    {
        Id = transaction.Id,
        OrderId = transaction.OrderId,
        OrderCode = transaction.OrderCode,
        CustomerId = transaction.CustomerId,
        Amount = transaction.Amount,
        CurrencyCode = transaction.CurrencyCode,
        Provider = transaction.Provider,
        ProviderPaymentId = transaction.ProviderPaymentId,
        Status = transaction.Status,
        CheckoutUrl = transaction.CheckoutUrl,
        FailureReason = transaction.FailureReason,
        PaidAt = transaction.PaidAt,
        CancelledAt = transaction.CancelledAt,
        Created = transaction.Created,
        LastModified = transaction.LastModified
    };
}
