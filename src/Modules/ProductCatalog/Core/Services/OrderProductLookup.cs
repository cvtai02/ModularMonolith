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
                fileManager.BuildPublicUrl(x.ImageKey),
                x.Price,
                x.Currency.ToString()))
            .ToList();
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
