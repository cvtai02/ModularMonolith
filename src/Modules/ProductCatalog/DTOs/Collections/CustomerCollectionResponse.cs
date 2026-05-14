using ProductCatalog.DTOs.Products;

namespace ProductCatalog.DTOs.Collections;

public class CustomerCollectionResponse
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public int ProductCount { get; set; }
}

public class CustomerCollectionDetailResponse : CustomerCollectionResponse
{
    public List<CustomerCollectionProductResponse> Products { get; set; } = [];
}

public class CustomerCollectionProductResponse : CustomerProductSummaryResponse
{
    public int DisplayOrder { get; set; }
}
