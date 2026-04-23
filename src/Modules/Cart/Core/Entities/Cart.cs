namespace Cart.Core.Entities;

public class Cart : AuditableEntity
{
    public int Id { get; set; }
    public string? UserId { get; set; }
    public string CurrencyCode { get; set; } = "USD";
    public CartStatus Status { get; set; } = CartStatus.Active;
    public DateTimeOffset ExpiresAt { get; set; }
    public ICollection<CartItem> Items { get; set; } = [];
}

public enum CartStatus
{
    Active,
    CheckedOut,
    Expired,
    Abandoned
}
