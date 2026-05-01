using Content.DTOs.FileObjects;
using Content.Core.Entities;
using Microsoft.EntityFrameworkCore;
using SharedKernel.Abstractions.Services;
using SharedKernel.DTOs;

namespace Content.Core.Usecases.FileObjects;

public class ListMediaFiles(ContentDbContext db, IFileManager fileManager)
{
    public async Task<PaginatedList<MediaFileResponse>> ExecuteAsync(
        ListMediaFilesRequest request,
        CancellationToken cancellationToken)
    {
        var query = db.Files
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLowerInvariant();
            query = query.Where(x =>
                x.Name.ToLower().Contains(search) ||
                x.Key.ToLower().Contains(search));
        }

        if (!string.IsNullOrWhiteSpace(request.Category))
        {
            var category = request.Category.Trim();
            query = query.Where(x => x.Category == category);
        }

        if (!string.IsNullOrWhiteSpace(request.ContentType))
        {
            var contentType = request.ContentType.Trim().ToLowerInvariant();
            query = query.Where(x => x.ContentType.ToLower() == contentType);
        }

        if (request.MinSize.HasValue)
            query = query.Where(x => x.Size >= request.MinSize.Value);

        if (request.MaxSize.HasValue)
            query = query.Where(x => x.Size <= request.MaxSize.Value);

        if (request.CreatedFrom.HasValue)
            query = query.Where(x => x.Created >= request.CreatedFrom.Value);

        if (request.CreatedTo.HasValue)
            query = query.Where(x => x.Created <= request.CreatedTo.Value);

        query = ApplySorting(query, request);

        var totalCount = await query.CountAsync(cancellationToken);
        var files = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var items = files.Select(ToResponse).ToList();
        return new PaginatedList<MediaFileResponse>(items, totalCount, request.PageNumber, request.PageSize);
    }

    private static IQueryable<FileObject> ApplySorting(IQueryable<FileObject> query, ListMediaFilesRequest request)
    {
        var direction = request.SortDirection?.Trim().ToLowerInvariant();
        var descending = direction == "desc" || direction == "descending";

        return request.SortBy?.Trim().ToLowerInvariant() switch
        {
            "name" => descending ? query.OrderByDescending(x => x.Name) : query.OrderBy(x => x.Name),
            "category" => descending ? query.OrderByDescending(x => x.Category) : query.OrderBy(x => x.Category),
            "contenttype" or "content-type" => descending ? query.OrderByDescending(x => x.ContentType) : query.OrderBy(x => x.ContentType),
            "size" => descending ? query.OrderByDescending(x => x.Size) : query.OrderBy(x => x.Size),
            "created" => descending ? query.OrderByDescending(x => x.Created) : query.OrderBy(x => x.Created),
            "lastmodified" or "last-modified" => descending ? query.OrderByDescending(x => x.LastModified) : query.OrderBy(x => x.LastModified),
            _ => query.OrderByDescending(x => x.LastModified)
        };
    }

    private MediaFileResponse ToResponse(FileObject file) => new()
    {
        Id = file.Id,
        Url = fileManager.BuildPublicUrl(file.Key)!,
        Category = file.Category,
        Name = file.Name,
        ContentType = file.ContentType,
        Size = file.Size,
        Created = file.Created,
        LastModified = file.LastModified
    };
}
