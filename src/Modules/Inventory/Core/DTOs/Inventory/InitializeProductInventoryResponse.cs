namespace Inventory.Core.DTOs.Inventory;

public class InitializeProductInventoryResponse
{
    public int ProductId { get; set; }
    public bool TrackInventory { get; set; }
    public bool AllowBackorder { get; set; }
    public int LowStockThreshold { get; set; }
    public List<VariantInventoryResponse> Variants { get; set; } = [];
}

public class VariantInventoryResponse
{
    public int VariantId { get; set; }
    public bool UseProductInventory { get; set; }
    public bool TrackInventory { get; set; }
    public bool AllowBackorder { get; set; }
    public int LowStockThreshold { get; set; }
    public int Quantity { get; set; }
    public int Reserved { get; set; }
    public int Available { get; set; }
}
