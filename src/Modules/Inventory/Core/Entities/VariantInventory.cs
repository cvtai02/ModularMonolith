using System.ComponentModel.DataAnnotations;

namespace Inventory.Core.Entities;
public class VariantInventory : AuditableEntity
{
    [Key]
    public int VariantId  { get; set; } // treat ad SKU

    public bool UseProductInventory { get; private set; } = true;
    public bool TrackInventory { get; private set; }
    public int LowStockThreshold { get; private set; }
    public bool AllowBackorder { get; private set; }

    public void ApplyProductInventory(ProductInventory productInventory)
    {
        UseProductInventory = true;
        TrackInventory = productInventory.TrackInventory;
        AllowBackorder = productInventory.AllowBackorder;
        LowStockThreshold = productInventory.LowStockThreshold;
    }

    public void ApplyVariantInventory(bool trackInventory, bool allowBackorder, int lowStockThreshold)
    {
        UseProductInventory = false;
        TrackInventory = trackInventory;
        AllowBackorder = trackInventory && allowBackorder;
        LowStockThreshold = lowStockThreshold;
    }

    public VariantTracking Tracking { get; set; } = null!;
}
