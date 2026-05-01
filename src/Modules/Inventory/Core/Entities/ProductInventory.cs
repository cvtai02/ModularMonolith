using System.ComponentModel.DataAnnotations;

namespace Inventory.Core.Entities;

public class ProductInventory : AuditableEntity
{
    [Key]
    public int ProductId { get; set; }
    public bool TrackInventory { get; private set; }
    public bool AllowBackorder { get; private set; }
    public int LowStockThreshold { get; private set; }

    public void SetInventoryPolicy(bool trackInventory, bool allowBackorder, int lowStockThreshold)
    {
        TrackInventory = trackInventory;
        AllowBackorder = trackInventory && allowBackorder;
        LowStockThreshold = lowStockThreshold;
    }
}
