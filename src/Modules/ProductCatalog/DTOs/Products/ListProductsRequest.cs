using System.ComponentModel.DataAnnotations;
using ProductCatalog.Core.Entities;

namespace ProductCatalog.DTOs.Products;

public class ListProductsRequest
{
    [Range(1, int.MaxValue)]
    public int PageNumber { get; set; } = 1;

    [Range(1, 200)]
    public int PageSize { get; set; } = 20;

    public string? Search { get; set; }

    public string? CategoryName { get; set; }

    public ProductStatus? Status { get; set; }

    public string? SortBy { get; set; }

    public string? SortDirection { get; set; }
}
