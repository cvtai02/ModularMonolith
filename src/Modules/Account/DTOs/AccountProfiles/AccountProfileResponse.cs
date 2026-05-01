using Account.DTOs.AccountAddresses;
using Account.Core.Entities;

namespace Account.DTOs.AccountProfiles;

public class AccountProfileResponse
{
    public int Id { get; set; }
    public string IdentityUserId { get; set; } = string.Empty;
    public AccountType Type { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string AvatarUrl { get; set; } = string.Empty;
    public AccountStatus Status { get; set; }
    public DateTimeOffset Created { get; set; }
    public DateTimeOffset LastModified { get; set; }
    public List<AccountAddressResponse> Addresses { get; set; } = [];
}
