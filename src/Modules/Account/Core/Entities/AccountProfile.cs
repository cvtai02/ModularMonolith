namespace Account.Core.Entities;

public class AccountProfile : AuditableEntity
{
    public int Id { get; set; }
    public string IdentityUserId { get; set; } = string.Empty;
    public AccountType Type { get; set; } = AccountType.Customer;
    public string DisplayName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string AvatarUrl { get; set; } = string.Empty;
    public AccountStatus Status { get; set; } = AccountStatus.Active;
    public ICollection<AccountAddress> Addresses { get; set; } = [];
}

public enum AccountType
{
    Customer,
    TenantAdmin,
    TenantStaff
}

public enum AccountStatus
{
    Active,
    Suspended,
    Archived
}
