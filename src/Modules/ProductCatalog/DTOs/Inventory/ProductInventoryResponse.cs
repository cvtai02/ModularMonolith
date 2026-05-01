namespace ProductCatalog.DTOs.Inventory;

public class ProductInventoryResponse
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public string Barcode { get; set; } = string.Empty;
    public int Stock { get; set; }
    public int Sold { get; set; }
    public bool TrackInventory { get; set; }
    public int LowStockThreshold { get; set; }
    public bool AllowBackorder { get; set; }
    public int Reserved { get; set; }
    public int AvailableStock { get; set; }
}
