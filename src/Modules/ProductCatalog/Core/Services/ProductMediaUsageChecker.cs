using Intermediary.Media;
using Microsoft.EntityFrameworkCore;

namespace ProductCatalog.Core.Services;

public class ProductMediaUsageChecker(ProductCatalogDbContext db) : IMediaUsageChecker
{
    public async Task<IReadOnlyCollection<string>> GetUsedKeysAsync(
        IReadOnlyCollection<string> keys,
        CancellationToken cancellationToken = default)
    {
        if (keys.Count == 0)
            return [];

        return await db.ProductMedias
            .AsNoTracking()
            .Where(x => keys.Contains(x.Key))
            .Select(x => x.Key)
            .Distinct()
            .ToListAsync(cancellationToken);
    }
}
