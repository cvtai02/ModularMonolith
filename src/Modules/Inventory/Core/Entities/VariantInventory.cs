using System.ComponentModel.DataAnnotations;

namespace Inventory.Core.Entities;
public class VariantInventory : AuditableEntity
{
    [Key]
    public int VariantId  { get; set; } // treat ad SKU

    public bool UseProductInventory { get; set; } = true;
    public bool TrackInventory { get; set; }
    public int LowStockThreshold { get; set; }
    public bool AllowBackorder { get; set; }

    public VariantTracking Tracking { get; set; } = null!;
}
