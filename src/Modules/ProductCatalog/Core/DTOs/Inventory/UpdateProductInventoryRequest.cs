using System.ComponentModel.DataAnnotations;

namespace ProductCatalog.Core.DTOs.Inventory;

public class UpdateProductInventoryRequest
{
    [Required]
    [MaxLength(200)]
    public string Sku { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Barcode { get; set; } = string.Empty;

    [Range(0, int.MaxValue)]
    public int Stock { get; set; }

    [Range(0, int.MaxValue)]
    public int Sold { get; set; }

    public bool TrackInventory { get; set; } = true;

    [Range(0, int.MaxValue)]
    public int LowStockThreshold { get; set; }

    public bool AllowBackorder { get; set; }

    [Range(0, int.MaxValue)]
    public int Reserved { get; set; }
}
