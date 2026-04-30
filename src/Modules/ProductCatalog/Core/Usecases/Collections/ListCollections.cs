using Microsoft.EntityFrameworkCore;
using ProductCatalog.Core.DTOs.Collections;
using SharedKernel.Abstractions.Services;
using SharedKernel.DTOs;

namespace ProductCatalog.Core.Usecases.Collections;

public class ListCollections(ProductCatalogDbContext db, IFileManager fm)
{
    public async Task<PaginatedList<CollectionResponse>> ExecuteAsync(
        int pageNumber, int pageSize, string? search, CancellationToken ct)
    {
        var query = db.Collections.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(x => x.Title.ToLower().Contains(s) || x.Slug.ToLower().Contains(s));
        }

        var totalCount = await query.CountAsync(ct);
        var items = await query
            .OrderBy(x => x.Title)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new CollectionResponse
            {
                Id = x.Id,
                Title = x.Title,
                Description = x.Description,
                Slug = x.Slug,
                ImageUrl = string.IsNullOrWhiteSpace(x.ImageKey) ? null : fm.BuildPublicUrl(x.ImageKey),
            })
            .ToListAsync(ct);

        return new PaginatedList<CollectionResponse>(items, totalCount, pageNumber, pageSize);
    }
}
