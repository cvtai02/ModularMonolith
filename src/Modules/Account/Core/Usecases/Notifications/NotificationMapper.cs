using Account.Core.Entities;
using Account.DTOs.Notifications;

namespace Account.Core.Usecases.Notifications;

public static class NotificationMapper
{
    public static NotificationResponse ToResponse(Notification notification) => new()
    {
        Id = notification.Id,
        RecipientUserId = notification.RecipientUserId,
        RecipientRole = notification.RecipientRole,
        Type = notification.Type,
        Title = notification.Title,
        Message = notification.Message,
        EntityType = notification.EntityType,
        EntityId = notification.EntityId,
        PayloadJson = notification.PayloadJson,
        IsRead = notification.IsRead,
        ReadAt = notification.ReadAt,
        ReadByUserId = notification.ReadByUserId,
        Created = notification.Created
    };
}
