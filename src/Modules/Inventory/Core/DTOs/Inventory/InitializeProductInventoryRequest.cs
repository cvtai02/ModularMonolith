using System.ComponentModel.DataAnnotations;

namespace Inventory.Core.DTOs.Inventory;

public class InitializeProductInventoryRequest
{
    public bool TrackInventory { get; set; } = true;
    public bool AllowBackorder { get; set; }

    [Range(0, int.MaxValue)]
    public int LowStockThreshold { get; set; }

    public List<VariantInventoryConfig> Variants { get; set; } = [];
}

public class VariantInventoryConfig
{
    [Required]
    public int VariantId { get; set; }

    public bool UseProductInventory { get; set; } = true;
    public bool TrackInventory { get; set; } = true;
    public bool AllowBackorder { get; set; }

    [Range(0, int.MaxValue)]
    public int LowStockThreshold { get; set; }

    [Range(0, int.MaxValue)]
    public int Quantity { get; set; }
}
