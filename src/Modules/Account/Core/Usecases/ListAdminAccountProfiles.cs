using Account.DTOs.AccountProfiles;
using Account.Core.Entities;
using Microsoft.EntityFrameworkCore;
using SharedKernel.DTOs;

namespace Account.Core.Usecases;

public class ListAdminAccountProfiles(AccountDbContext db)
{
    public async Task<PaginatedList<AccountProfileResponse>> ExecuteAsync(
        ListAccountProfilesRequest request,
        CancellationToken ct)
    {
        var query = db.Profiles
            .AsNoTracking()
            .Include(x => x.Addresses)
            .Where(x => !x.IsDeleted);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLowerInvariant();
            query = query.Where(x =>
                x.DisplayName.ToLower().Contains(search) ||
                x.Email.ToLower().Contains(search) ||
                x.PhoneNumber.ToLower().Contains(search) ||
                x.IdentityUserId.ToLower().Contains(search));
        }

        if (request.Type.HasValue)
            query = query.Where(x => x.Type == request.Type.Value);

        if (request.Status.HasValue)
            query = query.Where(x => x.Status == request.Status.Value);

        query = ApplySorting(query, request);

        var totalCount = await query.CountAsync(ct);
        var profiles = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(ct);

        return new PaginatedList<AccountProfileResponse>(
            profiles.Select(AccountMapper.ToProfileResponse).ToList(),
            totalCount,
            request.PageNumber,
            request.PageSize);
    }

    private static IQueryable<AccountProfile> ApplySorting(
        IQueryable<AccountProfile> query,
        ListAccountProfilesRequest request)
    {
        var direction = request.SortDirection?.Trim().ToLowerInvariant();
        var descending = direction == "desc" || direction == "descending";

        return request.SortBy?.Trim().ToLowerInvariant() switch
        {
            "displayname" or "display-name" => descending ? query.OrderByDescending(x => x.DisplayName) : query.OrderBy(x => x.DisplayName),
            "email" => descending ? query.OrderByDescending(x => x.Email) : query.OrderBy(x => x.Email),
            "type" => descending ? query.OrderByDescending(x => x.Type) : query.OrderBy(x => x.Type),
            "status" => descending ? query.OrderByDescending(x => x.Status) : query.OrderBy(x => x.Status),
            "created" => descending ? query.OrderByDescending(x => x.Created) : query.OrderBy(x => x.Created),
            _ => query.OrderByDescending(x => x.LastModified)
        };
    }
}
