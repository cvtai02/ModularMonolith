using Content.Core.DTOs.BlogPosts;
using Content.Core.Entities;
using Microsoft.EntityFrameworkCore;
using SharedKernel.DTOs;

namespace Content.Core.Usecases.BlogPosts;

public class ListPublishedBlogPosts(ContentDbContext db)
{
    public async Task<PaginatedList<BlogPostSummaryResponse>> ExecuteAsync(
        ListBlogPostsRequest request,
        CancellationToken ct)
    {
        var query = db.BlogPosts
            .AsNoTracking()
            .ActiveOnly()
            .Where(x => x.Status == BlogPostStatus.Published)
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
