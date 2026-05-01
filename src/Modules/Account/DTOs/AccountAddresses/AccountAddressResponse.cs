namespace Account.DTOs.AccountAddresses;

public class AccountAddressResponse
{
    public int Id { get; set; }
    public int AccountProfileId { get; set; }
    public string OwnerName { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
    public string Line1 { get; set; } = string.Empty;
    public string Line2 { get; set; } = string.Empty;
    public bool IsDefaultShipping { get; set; }
    public bool IsDefaultBilling { get; set; }
}
