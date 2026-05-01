using Account.Core.Entities;

namespace Account.DTOs.AccountProfiles;

public class AdminUpdateAccountProfileRequest : UpdateAccountProfileRequest
{
    public AccountType? Type { get; set; }
    public AccountStatus? Status { get; set; }
}
