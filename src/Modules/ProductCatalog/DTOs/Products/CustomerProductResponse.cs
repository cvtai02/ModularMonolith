using SharedKernel.Enums;

namespace ProductCatalog.DTOs.Products;

public class CustomerProductSummaryResponse
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal LowestPrice { get; set; }
    public decimal HighestPrice { get; set; }
    public Currency Currency { get; set; }
}

public class CustomerProductResponse : CustomerProductSummaryResponse
{
    public string Description { get; set; } = string.Empty;
    public decimal CompareAtPrice { get; set; }
    public List<ProductMediaResponse> Medias { get; set; } = [];
    public List<OptionResponse> Options { get; set; } = [];
    public List<CustomerVariantResponse> Variants { get; set; } = [];
}

public class CustomerVariantResponse
{
    public string Id { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal CompareAtPrice { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public List<VariantOptionValueDto> OptionValues { get; set; } = [];
}
