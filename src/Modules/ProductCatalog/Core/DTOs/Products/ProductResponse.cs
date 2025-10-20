using ProductCatalog.Core.Entities;

namespace ProductCatalog.Core.DTOs.Products;

public class ProductResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public ProductStatus Status { get; set; }
    public decimal Price { get; set; }
    public decimal CompareAtPrice { get; set; }
    public decimal CostPrice { get; set; }
    public bool ChargeTax { get; set; }
    public int Stock { get; set; }
    public string Sku { get; set; } = string.Empty;
    public string Barcode { get; set; } = string.Empty;
    public bool TrackInventory { get; set; }
    public int LowStockThreshold { get; set; }
    public bool AllowBackorder { get; set; }
    public int Sold { get; set; }
    public int Reserved { get; set; }
}
