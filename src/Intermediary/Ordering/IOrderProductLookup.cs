namespace Intermediary.Ordering;

public interface IOrderProductLookup
{
    Task<IReadOnlyCollection<OrderProductVariantInfo>> GetVariantsForOrderAsync(
        IReadOnlyCollection<string> variantIds,
        CancellationToken cancellationToken = default);
}

public sealed record OrderProductVariantInfo(
    string ProductId,
    string ProductName,
    bool IsProductActive,
    string VariantId,
    string VariantName,
    string? ImageUrl,
    decimal UnitPrice,
    string CurrencyCode);
