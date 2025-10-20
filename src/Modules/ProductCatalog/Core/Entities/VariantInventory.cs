using System.ComponentModel.DataAnnotations;

namespace ProductCatalog.Core.Entities;

public class VariantInventory : Entity, IReferTenantEntity
{
    [Key]
    public int VariantId { get; set; }
    public string Sku { get; set; } = string.Empty;
    public string Barcode { get; set; } = string.Empty;
    public int Stock { get; set; }
    public int Sold { get; set; }
    public bool TrackInventory { get; set; } // Whether to track inventory or not
    public int LowStockThreshold { get; set; } // Threshold for low stock warning
    public bool AllowBackorder { get; set; } // Allow backorders when out of stock 
    public int Reserved { get; set; } 
    public Variant? Variant { get; set; } = null!;
}
