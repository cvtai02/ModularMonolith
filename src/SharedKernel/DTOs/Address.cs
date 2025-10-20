namespace SharedKernel.DTOs;

public class Address : ValueObject
{
    public string OwnerName { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // Home, Work, etc.
    public string PhoneNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string? State { get; set; } = string.Empty;   // Province/Region
    public string? City { get; set; } = string.Empty;   // District
    public string? PostalCode  { get; set; } = string.Empty;
    public string Line1 { get; set; } = string.Empty;
    public string? Line2 { get; set; } = string.Empty;
    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Line1.ToLower();
        yield return Line2?.ToLower()?? string.Empty;
        yield return City?.ToLower()?? string.Empty;
        yield return State?.ToLower()?? string.Empty;
        yield return Country.ToLower();
        yield return PostalCode?.ToLower()?? string.Empty;
    }

}

