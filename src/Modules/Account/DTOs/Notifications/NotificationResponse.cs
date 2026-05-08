namespace Account.DTOs.Notifications;

public class NotificationResponse
{
    public int Id { get; set; }
    public string? RecipientUserId { get; set; }
    public string? RecipientRole { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Message { get; set; }
    public string? EntityType { get; set; }
    public string? EntityId { get; set; }
    public string PayloadJson { get; set; } = "{}";
    public bool IsRead { get; set; }
    public DateTimeOffset? ReadAt { get; set; }
    public string? ReadByUserId { get; set; }
    public DateTimeOffset Created { get; set; }
}
