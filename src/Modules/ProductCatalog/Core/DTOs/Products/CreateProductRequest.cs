using System.ComponentModel.DataAnnotations;
using ProductCatalog.Core.Entities;
using SharedKernel.Enums;

namespace ProductCatalog.Core.DTOs.Products;

public class CreateProductRequest
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;

    [Required]
    public int CategoryId { get; set; }

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
    public Currency Currency { get; set; } = Currency.VND;

    [Range(0, int.MaxValue)]
    public int Stock { get; set; }

    public bool TrackInventory { get; set; } = true;

    [Range(0, int.MaxValue)]
    public int LowStockThreshold { get; set; }

    public bool AllowBackorder { get; set; }
    public bool PhysicalProduct { get; set; } = true;

    [Range(0, double.MaxValue)]
    public float Weight { get; set; }

    [Range(0, double.MaxValue)]
    public float Width { get; set; }

    [Range(0, double.MaxValue)]
    public float Height { get; set; }

    [Range(0, double.MaxValue)]
    public float Length { get; set; }

    public List<CreateProductMediaRequest> Medias { get; set; } = [];
    public List<CreateProductOptionRequest> Options { get; set; } = [];
    public List<CreateVariantRequest> Variants { get; set; } = [];
}

public class CreateProductMediaRequest
{
    [Required]
    [MaxLength(2000)]
    public string Url { get; set; } = string.Empty;

    [MaxLength(50)]
    public string Type { get; set; } = "image";

    public float DisplayOrder { get; set; }
}

public class CreateProductOptionRequest
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    public int DisplayOrder { get; set; }

    public List<string> Values { get; set; } = [];
}
