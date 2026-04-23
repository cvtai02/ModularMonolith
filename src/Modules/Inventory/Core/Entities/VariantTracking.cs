using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Inventory.Core.Entities;

public class VariantTracking : Entity
{
    [Key]
    public int VariantId { get; set; }
    public int OnHand { get; set; }
    public int Reserved { get; set; }
    [NotMapped]
    public int Available => OnHand - Reserved;
    [Timestamp]
    public byte[] Version { get; set; } = null!;
    public VariantInventory Variant { get; set; } = null!;
}
