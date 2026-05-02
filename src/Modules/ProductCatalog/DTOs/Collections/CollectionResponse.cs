using ProductCatalog.Core.Entities;
using SharedKernel.Enums;

namespace ProductCatalog.DTOs.Collections;

public class CollectionResponse {
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public int ProductCount { get; set; }
}

public class CollectionDetailResponse : CollectionResponse
{
    public List<CollectionProductResponse> Products { get; set; } = [];
}

public class CollectionProductResponse
{
    public int ProductId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public ProductStatus Status { get; set; }
    public decimal Price { get; set; }
    public Currency Currency { get; set; }
    public int DisplayOrder { get; set; }
}
