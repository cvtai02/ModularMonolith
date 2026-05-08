using Account.Core.Entities;
using Account.DTOs.Notifications;
using Microsoft.EntityFrameworkCore;
using SharedKernel.DTOs;

namespace Account.Core.Usecases.Notifications;

[UsecaseInject]
public class ListAdminNotifications(AccountDbContext db)
{
    public async Task<PaginatedList<NotificationResponse>> ExecuteAsync(
        ListNotificationsRequest request,
        CancellationToken ct)
    {
        request ??= new ListNotificationsRequest();

        var query = db.Notifications
            .AsNoTracking()
            .Where(x => !x.IsDeleted);

        if (request.IsRead.HasValue)
            query = query.Where(x => x.IsRead == request.IsRead.Value);

        if (!string.IsNullOrWhiteSpace(request.Type))
        {
            var type = request.Type.Trim();
            query = query.Where(x => x.Type == type);
        }

        if (!string.IsNullOrWhiteSpace(request.EntityType))
        {
            var entityType = request.EntityType.Trim();
            query = query.Where(x => x.EntityType == entityType);
        }

        if (!string.IsNullOrWhiteSpace(request.EntityId))
        {
            var entityId = request.EntityId.Trim();
            query = query.Where(x => x.EntityId == entityId);
        }

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLowerInvariant();
            query = query.Where(x =>
                x.Title.ToLower().Contains(search) ||
                (x.Message != null && x.Message.ToLower().Contains(search)) ||
                (x.EntityId != null && x.EntityId.ToLower().Contains(search)));
        }

        query = query.OrderBy(x => x.IsRead).ThenByDescending(x => x.Created);

        var totalCount = await query.CountAsync(ct);
        var notifications = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(ct);

        return new PaginatedList<NotificationResponse>(
            notifications.Select(NotificationMapper.ToResponse).ToList(),
            totalCount,
            request.PageNumber,
            request.PageSize);
    }
}
