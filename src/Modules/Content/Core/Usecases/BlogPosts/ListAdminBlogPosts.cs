using Content.Core.DTOs.BlogPosts;
using Microsoft.EntityFrameworkCore;
using SharedKernel.DTOs;

namespace Content.Core.Usecases.BlogPosts;

public class ListAdminBlogPosts(ContentDbContext db)
{
    public async Task<PaginatedList<BlogPostSummaryResponse>> ExecuteAsync(
        ListAdminBlogPostsRequest request,
        CancellationToken ct)
    {
        var query = db.BlogPosts
            .AsNoTracking()
            .ActiveOnly();

        if (request.Status.HasValue)
        {
            query = query.Where(x => x.Status == request.Status.Value);
        }

        query = query
            .ApplySearch(request.Search)
            .ApplySorting(request);

        var totalCount = await query.CountAsync(ct);
        var posts = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(ct);

        return new PaginatedList<BlogPostSummaryResponse>(
            posts.Select(BlogPostMapper.ToSummary).ToList(),
            totalCount,
            request.PageNumber,
            request.PageSize);
    }
}
