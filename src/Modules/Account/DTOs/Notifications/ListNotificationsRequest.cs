using System.ComponentModel.DataAnnotations;

namespace Account.DTOs.Notifications;

public class ListNotificationsRequest
{
    [Range(1, int.MaxValue)]
    public int PageNumber { get; set; } = 1;

    [Range(1, 200)]
    public int PageSize { get; set; } = 20;

    public bool? IsRead { get; set; }
    public string? Type { get; set; }
    public string? EntityType { get; set; }
    public string? EntityId { get; set; }
    public string? Search { get; set; }
}
