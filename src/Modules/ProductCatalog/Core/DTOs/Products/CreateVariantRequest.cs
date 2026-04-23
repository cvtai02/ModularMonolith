namespace ProductCatalog.Core.DTOs.Products;

public class CreateVariantRequest
{
    public decimal? Price { get; set; }
    public decimal? CompareAtPrice { get; set; }
    public decimal? CostPrice { get; set; }
    public bool? ChargeTax { get; set; }
    public string? ImageUrl { get; set; }
    public int Stock { get; set; }
    public bool? TrackInventory { get; set; }
    public int? LowStockThreshold { get; set; }
    public bool? AllowBackorder { get; set; }
    public bool? PhysicalProduct { get; set; }
    public float? Weight { get; set; }
    public float? Width { get; set; }
    public float? Height { get; set; }
    public float? Length { get; set; }
    public List<VariantOptionValueDto> OptionValues { get; set; } = [];
}

public class VariantOptionValueDto
{
    public int OptionId { get; set; }
    public string OptionName { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
}
