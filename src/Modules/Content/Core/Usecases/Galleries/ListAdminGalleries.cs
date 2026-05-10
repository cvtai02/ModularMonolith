using Content.DTOs.Galleries;
using Microsoft.EntityFrameworkCore;
using SharedKernel.DTOs;

namespace Content.Core.Usecases.Galleries;

[UsecaseInject]
public class ListAdminGalleries(ContentDbContext db)
{
    public async Task<PaginatedList<GallerySummaryResponse>> ExecuteAsync(ListGalleriesRequest request, CancellationToken ct)
    {
        request ??= new ListGalleriesRequest();

        var query = db.Galleries
            .AsNoTracking()
            .ActiveOnly()
            .Include(x => x.Items.Where(i => !i.IsDeleted))
            .ApplySearch(request.Search);

        if (request.IsPublic.HasValue)
            query = query.Where(x => x.IsPublic == request.IsPublic.Value);

        query = query.ApplySorting(request);

        var totalCount = await query.CountAsync(ct);
        var galleries = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(ct);

        return new PaginatedList<GallerySummaryResponse>(
            galleries.Select(GalleryMapper.ToSummary).ToList(),
            totalCount,
            request.PageNumber,
            request.PageSize);
    }
}
