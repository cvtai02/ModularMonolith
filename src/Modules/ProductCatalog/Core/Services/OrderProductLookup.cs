using Intermediary.Ordering;
using Microsoft.EntityFrameworkCore;
using ProductCatalog.Core.Entities;
using SharedKernel.Abstractions.Services;

namespace ProductCatalog.Core.Services;

public class OrderProductLookup(ProductCatalogDbContext db, IFileManager fileManager) : IOrderProductLookup
{
    public async Task<IReadOnlyCollection<OrderProductVariantInfo>> GetVariantsForOrderAsync(
        IReadOnlyCollection<int> variantIds,
        CancellationToken cancellationToken = default)
    {
        if (variantIds.Count == 0)
            return [];

        var variants = await db.Variants
            .AsNoTracking()
            .Include(x => x.Product).ThenInclude(x => x.Medias)
            .Include(x => x.OptionValues)
            .Where(x => variantIds.Contains(x.Id))
            .ToListAsync(cancellationToken);

        return variants
            .Select(x => new OrderProductVariantInfo(
                x.ProductId,
                x.Product.Name,
                x.Product.Status == ProductStatus.Active,
                x.Id,
                BuildVariantName(x),
                BuildImageUrl(x),
                x.Price,
                x.Product.Currency.ToString()))
            .ToList();
    }

    private string? BuildImageUrl(Variant variant)
    {
        var variantUrl = fileManager.BuildPublicUrl(variant.ImageKey);
        if (!string.IsNullOrWhiteSpace(variantUrl))
            return variantUrl;

        var primaryProductMediaKey = variant.Product.Medias
            .OrderBy(x => x.DisplayOrder)
            .Select(x => x.Key)
            .FirstOrDefault(x => !string.IsNullOrWhiteSpace(x));
        var primaryProductMediaUrl = fileManager.BuildPublicUrl(primaryProductMediaKey);
        if (!string.IsNullOrWhiteSpace(primaryProductMediaUrl))
            return primaryProductMediaUrl;

        return string.IsNullOrWhiteSpace(variant.Product.ImageUrl)
            ? null
            : variant.Product.ImageUrl.Trim();
    }

    private static string BuildVariantName(Variant variant)
    {
        var options = variant.OptionValues
            .OrderBy(x => x.OptionName)
            .Select(x => $"{x.OptionName}: {x.Value}")
            .ToList();

        return options.Count == 0
            ? variant.Product.Name
            : string.Join(", ", options);
    }
}
