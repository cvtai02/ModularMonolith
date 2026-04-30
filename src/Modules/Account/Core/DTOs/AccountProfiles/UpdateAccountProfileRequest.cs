namespace Account.Core.DTOs.AccountProfiles;

public class UpdateAccountProfileRequest
{
    public string? DisplayName { get; set; }
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public string? AvatarUrl { get; set; }
}
