using Intermediary.Events.Payment;
using Microsoft.EntityFrameworkCore;
using Payment.DTOs;
using Payment.Core.Entities;
using Payment.Core.Strategies;
using SharedKernel.Abstractions.Services;
using SharedKernel.Exceptions;

namespace Payment.Core.Usecases;

public class HandlePaymentWebhook(
    PaymentDbContext db,
    IEventBus eventBus,
    PaymentMethodStrategyResolver strategyResolver)
{
    public async Task<PaymentTransactionResponse?> ExecuteAsync(
        string provider,
        PaymentWebhookRequest request,
        CancellationToken ct)
    {
        request ??= new PaymentWebhookRequest();
        Validate(request);

        var strategy = strategyResolver.Resolve(provider);
        var providerPaymentId = request.ProviderPaymentId.Trim();
        var transaction = await db.Transactions
            .FirstOrDefaultAsync(x => x.Provider == strategy.Code &&
                                      x.ProviderPaymentId == providerPaymentId &&
                                      !x.IsDeleted, ct);

        if (transaction is null)
            return null;

        if (IsTerminal(transaction.Status))
            return PaymentMapper.ToResponse(transaction);

        var result = await strategy.HandleWebhookAsync(new PaymentWebhookContext(
            strategy.Code,
            request), ct);

        switch (result.Status)
        {
            case PaymentStatus.Succeeded:
                await MarkSucceeded(transaction, ct);
                break;
            case PaymentStatus.Failed:
                await MarkFailed(transaction, result.FailureReason, ct);
                break;
            case PaymentStatus.Cancelled:
                await MarkCancelled(transaction, result.FailureReason, ct);
                break;
            case PaymentStatus.Refunded:
                transaction.Status = PaymentStatus.Refunded;
                transaction.FailureReason = result.FailureReason;
                await db.SaveChangesAsync(ct);
                break;
            case PaymentStatus.Pending:
                transaction.Status = PaymentStatus.Pending;
                await db.SaveChangesAsync(ct);
                break;
            default:
                throw new ArgumentOutOfRangeException(nameof(result.Status), result.Status, null);
        }

        return PaymentMapper.ToResponse(transaction);
    }

    private async Task MarkSucceeded(PaymentTransaction transaction, CancellationToken ct)
    {
        var paidAt = DateTimeOffset.UtcNow;
        transaction.Status = PaymentStatus.Succeeded;
        transaction.PaidAt = paidAt;
        transaction.FailureReason = null;
        await db.SaveChangesAsync(ct);

        await eventBus.Publish(new PaymentSucceeded
        {
            OrderId = transaction.OrderId,
            OrderCode = transaction.OrderCode,
            PaymentTransactionId = transaction.Id,
            Provider = transaction.Provider,
            ProviderPaymentId = transaction.ProviderPaymentId,
            Amount = transaction.Amount,
            CurrencyCode = transaction.CurrencyCode,
            PaidAt = paidAt
        }, ct);
    }

    private async Task MarkFailed(PaymentTransaction transaction, string? failureReason, CancellationToken ct)
    {
        transaction.Status = PaymentStatus.Failed;
        transaction.FailureReason = NormalizeFailureReason(failureReason);
        await db.SaveChangesAsync(ct);

        await eventBus.Publish(ToFailedEvent(transaction), ct);
    }

    private async Task MarkCancelled(PaymentTransaction transaction, string? failureReason, CancellationToken ct)
    {
        transaction.Status = PaymentStatus.Cancelled;
        transaction.CancelledAt = DateTimeOffset.UtcNow;
        transaction.FailureReason = NormalizeFailureReason(failureReason) ?? "Payment was cancelled.";
        await db.SaveChangesAsync(ct);

        await eventBus.Publish(ToFailedEvent(transaction), ct);
    }

    private static PaymentFailed ToFailedEvent(PaymentTransaction transaction) => new()
    {
        OrderId = transaction.OrderId,
        OrderCode = transaction.OrderCode,
        PaymentTransactionId = transaction.Id,
        Provider = transaction.Provider,
        ProviderPaymentId = transaction.ProviderPaymentId,
        FailureReason = transaction.FailureReason
    };

    private static void Validate(PaymentWebhookRequest request)
    {
        var errors = new Dictionary<string, string[]>();
        if (string.IsNullOrWhiteSpace(request.ProviderPaymentId))
            errors[nameof(request.ProviderPaymentId)] = ["Provider payment id is required."];

        if (errors.Count > 0)
            throw new ValidationException("Validation failed", errors);
    }

    private static bool IsTerminal(PaymentStatus status) =>
        status is PaymentStatus.Succeeded or PaymentStatus.Failed or PaymentStatus.Cancelled or PaymentStatus.Refunded;

    private static string? NormalizeFailureReason(string? failureReason) =>
        string.IsNullOrWhiteSpace(failureReason) ? null : failureReason.Trim();
}
