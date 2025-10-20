using System.ComponentModel.DataAnnotations;
using ProductCatalog.Core.Entities;

namespace ProductCatalog.Core.DTOs.Products;

public class CreateProductRequest
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string CategoryName { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Slug { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string ImageUrl { get; set; } = string.Empty;

    public ProductStatus Status { get; set; } = ProductStatus.Active;

    [Range(0, double.MaxValue)]
    public decimal Price { get; set; }

    [Range(0, double.MaxValue)]
    public decimal CompareAtPrice { get; set; }

    [Range(0, double.MaxValue)]
    public decimal CostPrice { get; set; }

    public bool ChargeTax { get; set; } = true;

    [Range(0, int.MaxValue)]
    public int Stock { get; set; }

    [Required]
    [MaxLength(200)]
    public string Sku { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Barcode { get; set; } = string.Empty;

    public bool TrackInventory { get; set; } = true;

    [Range(0, int.MaxValue)]
    public int LowStockThreshold { get; set; }

    public bool AllowBackorder { get; set; }
}
