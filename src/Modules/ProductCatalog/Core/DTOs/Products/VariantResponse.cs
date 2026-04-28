namespace ProductCatalog.Core.DTOs.Products;

public class VariantResponse
{
    public int Id { get; set; }
    public bool UseProductPricing { get; set; }
    public bool UseProductShipping { get; set; }
    public decimal Price { get; set; }
    public decimal CompareAtPrice { get; set; }
    public decimal CostPrice { get; set; }
    public bool ChargeTax { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public int Stock { get; set; }
    public int Sold { get; set; }
    public int Reserved { get; set; }
    public bool TrackInventory { get; set; }
    public int LowStockThreshold { get; set; }
    public bool AllowBackorder { get; set; }
    public bool PhysicalProduct { get; set; }
    public float Weight { get; set; }
    public float Width { get; set; }
    public float Height { get; set; }
    public float Length { get; set; }
    public List<VariantOptionValueDto> OptionValues { get; set; } = [];
}
