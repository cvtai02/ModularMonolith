using System.ComponentModel.DataAnnotations;

namespace ProductCatalog.DTOs.Products;

public class ListCustomerProductsRequest
{
    [Range(1, int.MaxValue)]
    public int PageNumber { get; set; } = 1;

    [Range(1, 200)]
    public int PageSize { get; set; } = 20;

    public string? Search { get; set; }

    public string? CategoryName { get; set; }

    public string? SortBy { get; set; }

    public string? SortDirection { get; set; }
}
