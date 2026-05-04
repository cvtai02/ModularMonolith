using Account.Core.Entities;

namespace Account.DTOs.AccountProfiles;

public class AdminCreateAccountProfileRequest : UpdateAccountProfileRequest
{
    public string? IdentityUserId { get; set; }
    public AccountStatus? Status { get; set; }
}
