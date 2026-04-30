namespace Intermediary.Ordering;

public interface IOrderProductLookup
{
    Task<IReadOnlyCollection<OrderProductVariantInfo>> GetVariantsForOrderAsync(
        IReadOnlyCollection<int> variantIds,
        CancellationToken cancellationToken = default);
}

public sealed record OrderProductVariantInfo(
    int ProductId,
    string ProductName,
    bool IsProductActive,
    int VariantId,
    string VariantName,
    string? ImageUrl,
    decimal UnitPrice,
    string CurrencyCode);
