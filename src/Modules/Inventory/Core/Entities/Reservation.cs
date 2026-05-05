namespace Inventory.Core.Entities;

public class Reservation : AuditableEntity
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public ReservationStatus Status { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }
    public List<ReservationLine> ReservationLines { get; set; } = [];
}

public enum ReservationStatus
{
    Active,
    Released,
    Confirmed
}
