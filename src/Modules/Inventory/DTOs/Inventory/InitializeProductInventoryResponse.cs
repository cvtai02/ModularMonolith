namespace Inventory.DTOs.Inventory;

public class InitializeProductInventoryResponse
{
    public string ProductId { get; set; } = string.Empty;
    public bool TrackInventory { get; set; }
    public bool AllowBackorder { get; set; }
    public int LowStockThreshold { get; set; }
    public List<VariantInventoryResponse> Variants { get; set; } = [];
}

public class VariantInventoryResponse
{
    public string VariantId { get; set; } = string.Empty;
    public bool UseProductInventory { get; set; }
    public bool TrackInventory { get; set; }
    public bool AllowBackorder { get; set; }
    public int LowStockThreshold { get; set; }
    public int Quantity { get; set; }
    public int Reserved { get; set; }
    public int Available { get; set; }
}
