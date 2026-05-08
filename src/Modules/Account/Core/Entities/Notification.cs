namespace Account.Core.Entities;

public class Notification : AuditableEntity
{
    public int Id { get; set; }
    public string? RecipientUserId { get; private set; }
    public string? RecipientRole { get; private set; }
    public string Type { get; private set; } = string.Empty;
    public string Title { get; private set; } = string.Empty;
    public string? Message { get; private set; }
    public string? EntityType { get; private set; }
    public string? EntityId { get; private set; }
    public string PayloadJson { get; private set; } = "{}";
    public bool IsRead { get; private set; }
    public DateTimeOffset? ReadAt { get; private set; }
    public string? ReadByUserId { get; private set; }

    public void SetRecipient(string? userId, string? role)
    {
        RecipientUserId = NormalizeOptional(userId, 450);
        RecipientRole = NormalizeOptional(role, 100);
    }

    public void SetContent(
        string type,
        string title,
        string? message,
        string? entityType,
        string? entityId,
        string payloadJson)
    {
        Type = RequireText(type, nameof(type), 100);
        Title = RequireText(title, nameof(title), 200);
        Message = NormalizeOptional(message, 1000);
        EntityType = NormalizeOptional(entityType, 100);
        EntityId = NormalizeOptional(entityId, 100);
        PayloadJson = string.IsNullOrWhiteSpace(payloadJson) ? "{}" : payloadJson;
    }

    public void MarkRead(string? userId)
    {
        if (IsRead)
            return;

        IsRead = true;
        ReadAt = DateTimeOffset.UtcNow;
        ReadByUserId = NormalizeOptional(userId, 450);
    }

    public void MarkUnread()
    {
        IsRead = false;
        ReadAt = null;
        ReadByUserId = null;
    }

    private static string RequireText(string value, string paramName, int maxLength)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(value, paramName);

        var normalized = value.Trim();
        if (normalized.Length > maxLength)
            throw new ArgumentOutOfRangeException(paramName, $"Value cannot exceed {maxLength} characters.");

        return normalized;
    }

    private static string? NormalizeOptional(string? value, int maxLength)
    {
        if (string.IsNullOrWhiteSpace(value))
            return null;

        var normalized = value.Trim();
        return normalized.Length > maxLength ? normalized[..maxLength] : normalized;
    }
}
