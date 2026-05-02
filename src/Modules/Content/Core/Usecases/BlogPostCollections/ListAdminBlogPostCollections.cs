using Content.DTOs.BlogPostCollections;
using Microsoft.EntityFrameworkCore;
using SharedKernel.DTOs;

namespace Content.Core.Usecases.BlogPostCollections;

public class ListAdminBlogPostCollections(ContentDbContext db)
{
    public async Task<PaginatedList<BlogPostCollectionSummaryResponse>> ExecuteAsync(
        ListBlogPostCollectionsRequest request,
        CancellationToken ct)
    {
        var query = db.BlogPostCollections
            .AsNoTracking()
            .ActiveOnly()
            .Include(x => x.Items.Where(i => !i.IsDeleted))
                .ThenInclude(x => x.BlogPost)
            .ApplySearch(request.Search);

        if (request.IsPublic.HasValue)
        {
            query = query.Where(x => x.IsPublic == request.IsPublic.Value);
        }

        query = query.ApplySorting(request);

        var totalCount = await query.CountAsync(ct);
        var collections = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(ct);

        return new PaginatedList<BlogPostCollectionSummaryResponse>(
            collections.Select(BlogPostCollectionMapper.ToSummary).ToList(),
            totalCount,
            request.PageNumber,
            request.PageSize);
    }
}
