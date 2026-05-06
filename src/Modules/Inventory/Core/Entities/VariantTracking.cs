using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Inventory.Core.Entities;

public class VariantTracking : Entity
{
    [Key]
    public string VariantId { get; set; } = string.Empty;
    public int OnHand { get; set; }
    public int Reserved { get; set; }
    [NotMapped]
    public int Available => OnHand - Reserved;
    public byte[] Version { get; set; } = Guid.NewGuid().ToByteArray();
    public VariantInventory Variant { get; set; } = null!;
}
