using ProductCatalog.Core.Entities;
using SharedKernel.Enums;

namespace ProductCatalog.Core.DTOs.Products;

public class ProductResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public ProductStatus Status { get; set; }
    public decimal Price { get; set; }
    public Currency Currency { get; set; }
    public decimal CompareAtPrice { get; set; }
    public decimal CostPrice { get; set; }
    public bool ChargeTax { get; set; }
    public int Stock { get; set; }
    public bool TrackInventory { get; set; }
    public int LowStockThreshold { get; set; }
    public bool AllowBackorder { get; set; }
    public int Sold { get; set; }
    public int Reserved { get; set; }
    public bool PhysicalProduct { get; set; }
    public float Weight { get; set; }
    public float Width { get; set; }
    public float Height { get; set; }
    public float Length { get; set; }
    public List<ProductMediaResponse> Medias { get; set; } = [];
    public List<OptionResponse> Options { get; set; } = [];
    public List<VariantResponse> Variants { get; set; } = [];
}

public class ProductMediaResponse
{
    public int Id { get; set; }
    public string Url { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public float DisplayOrder { get; set; }
}
