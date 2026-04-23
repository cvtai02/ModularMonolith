using System.ComponentModel.DataAnnotations;

namespace Inventory.Core.Entities;

public class ProductInventory : AuditableEntity
{
    [Key]
    public int ProductId { get; set; }
    public bool TrackInventory { get; set; }
    public bool AllowBackorder { get; set; }
    public int LowStockThreshold { get; set; }
}