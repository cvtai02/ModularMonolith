namespace ProductCatalog.Core.DTOs.Inventory;

public class AdjustProductInventoryRequest
{
    public int StockChange { get; set; }
    public int SoldChange { get; set; }
    public int ReservedChange { get; set; }
}
