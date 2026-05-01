using Microsoft.EntityFrameworkCore;
using Order;
using Order.Core.Entities;
using Payment.DTOs;
using Payment.Core.Entities;
using Payment.Core.Strategies;
using SharedKernel.Abstractions.Services;
using SharedKernel.Exceptions;

namespace Payment.Core.Usecases;

public class CreateOrderCheckout(
    PaymentDbContext paymentDb,
    OrderDbContext orderDb,
    IUser user,
    PaymentMethodStrategyResolver strategyResolver)
{
    public async Task<PaymentTransactionResponse> ExecuteAsync(
        int orderId,
        CreateCheckoutRequest request,
        CancellationToken ct)
    {
        request ??= new CreateCheckoutRequest();

        var order = await orderDb.Orders
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == orderId && !x.IsDeleted, ct);

        if (order is null)
            throw Validation("orderId", "Order does not exist.");

        if (!string.IsNullOrWhiteSpace(order.CustomerId) &&
            !string.Equals(order.CustomerId, user.Id, StringComparison.Ordinal))
        {
            throw Validation("orderId", "Order does not belong to the current user.");
        }

        if (order.Status != OrderStatus.Placed)
            throw Validation("orderId", "Order must be placed before checkout can be created.");

        var strategy = strategyResolver.Resolve(request.Provider);
        var existing = await paymentDb.Transactions
            .AsNoTracking()
            .Where(x => x.OrderId == orderId &&
                        x.Provider == strategy.Code &&
                        !x.IsDeleted &&
                        (x.Status == PaymentStatus.Pending || x.Status == PaymentStatus.Succeeded))
            .OrderByDescending(x => x.Id)
            .FirstOrDefaultAsync(ct);

        if (existing is not null)
            return PaymentMapper.ToResponse(existing);

        var checkout = await strategy.CreateCheckoutAsync(new PaymentCheckoutContext(
            order.Id,
            order.Code,
            order.TotalAmount,
            order.CurrencyCode,
            order.CustomerId,
            request), ct);

        var transaction = new PaymentTransaction
        {
            OrderId = order.Id,
            OrderCode = order.Code,
            CustomerId = order.CustomerId,
            Amount = order.TotalAmount,
            CurrencyCode = order.CurrencyCode,
            Provider = strategy.Code,
            ProviderPaymentId = checkout.ProviderPaymentId,
            Status = checkout.Status,
            CheckoutUrl = checkout.CheckoutUrl,
            PaidAt = checkout.Status == PaymentStatus.Succeeded ? DateTimeOffset.UtcNow : null
        };

        paymentDb.Transactions.Add(transaction);
        await paymentDb.SaveChangesAsync(ct);

        return PaymentMapper.ToResponse(transaction);
    }

    private static ValidationException Validation(string field, string message) =>
        new("Validation failed", new Dictionary<string, string[]>
        {
            [field] = [message]
        });
}
