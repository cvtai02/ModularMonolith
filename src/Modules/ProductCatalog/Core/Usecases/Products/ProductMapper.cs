using ProductCatalog.DTOs.Products;
using ProductCatalog.Core.Entities;
using SharedKernel.Abstractions.Services;

namespace ProductCatalog.Core.Usecases.Products;

internal static class ProductMapper
{
    internal static ProductResponse ToResponse(
        Product product,
        IFileManager fileManager)
    {
        var variants = product.Variants
            .OrderBy(x => x.Id)
            .Select(MapVariantToResponse)
            .ToList();
        var primaryVariant = product.Variants.OrderBy(x => x.Id).FirstOrDefault();
        var primaryVariantShipping = primaryVariant?.ShippingInfo;
        var displayPrice = primaryVariant?.Price ?? product.Price;
        var hasMetricPriceRange = product.Metric is not null
            && (product.Metric.LowestPrice > 0 || product.Metric.HighestPrice > 0);
        var lowestPrice = hasMetricPriceRange
            ? product.Metric!.LowestPrice
            : product.Variants.Select(x => x.Price).DefaultIfEmpty(product.Price).Min();
        var highestPrice = hasMetricPriceRange
            ? product.Metric!.HighestPrice
            : product.Variants.Select(x => x.Price).DefaultIfEmpty(product.Price).Max();

        return new ProductResponse
        {
            Id = product.Id,
            Name = product.Name,
            Description = product.Description,
            CategoryId = product.CategoryId,
            CategoryName = product.Category?.Name ?? string.Empty,
            Slug = product.Slug,
            ImageUrl = string.IsNullOrWhiteSpace(product.ImageUrl)
                ? product.Medias.OrderBy(x => x.DisplayOrder).Select(x => fileManager.BuildPublicUrl(x.Key)).FirstOrDefault() ?? string.Empty
                : product.ImageUrl,
            Status = product.Status,
            Price = displayPrice,
            LowestPrice = lowestPrice,
            HighestPrice = highestPrice,
            Currency = product.Currency,
            CompareAtPrice = primaryVariant?.CompareAtPrice ?? product.CompareAtPrice,
            CostPrice = primaryVariant?.CostPrice ?? product.CostPrice,
            ChargeTax = primaryVariant?.ChargeTax ?? product.ChargeTax,
            Stock = product.Metric?.Stock ?? 0,
            TrackInventory = product.TrackInventory,
            LowStockThreshold = 0,
            AllowBackorder = product.AllowBackorder,
            Sold = product.Metric?.Sold ?? 0,
            Reserved = 0,
            PhysicalProduct = product.ShippingInfo?.Physical ?? primaryVariantShipping?.Physical ?? false,
            Weight = product.ShippingInfo?.Weight ?? primaryVariantShipping?.Weight ?? 0,
            Width = product.ShippingInfo?.Width ?? primaryVariantShipping?.Width ?? 0,
            Height = product.ShippingInfo?.Height ?? primaryVariantShipping?.Height ?? 0,
            Length = product.ShippingInfo?.Length ?? primaryVariantShipping?.Length ?? 0,
            Medias = product.Medias
                .OrderBy(x => x.DisplayOrder)
                .Select(x => new ProductMediaResponse
                {
                    Id = x.Id,
                    Url = fileManager.BuildPublicUrl(x.Key)!,
                    Type = GetMediaType(x.Key),
                    DisplayOrder = x.DisplayOrder
                })
                .ToList(),
            Options = product.Options
                .OrderBy(x => x.DisplayOrder)
                .Select(x => new OptionResponse
                {
                    Id = x.Id,
                    Name = x.Name,
                    DisplayOrder = x.DisplayOrder,
                    Values = x.OptionValues.OrderBy(v => v.DisplayOrder).Select(v => v.Value).ToList()
                })
                .ToList(),
            Variants = variants
        };
    }

    private static VariantResponse MapVariantToResponse(Variant variant)
    {
        return new()
    {
        Id = variant.Id,
        UseProductPricing = variant.UseProductPricing,
        UseProductShipping = variant.ShippingInfo?.UseProductShipping ?? true,
        Price = variant.Price,
        CompareAtPrice = variant.CompareAtPrice ?? 0,
        CostPrice = variant.CostPrice,
        ChargeTax = variant.ChargeTax,
        ImageUrl = variant.ImageKey ?? string.Empty,
        Stock = variant.Metric?.Stock ?? 0,
        Sold = variant.Metric?.Sold ?? 0,
        Reserved = 0,
        TrackInventory = variant.TrackInventory,
        LowStockThreshold = 0,
        AllowBackorder = variant.AllowBackorder,
        PhysicalProduct = variant.ShippingInfo?.Physical ?? false,
        Weight = variant.ShippingInfo?.Weight ?? 0,
        Width = variant.ShippingInfo?.Width ?? 0,
        Height = variant.ShippingInfo?.Height ?? 0,
        Length = variant.ShippingInfo?.Length ?? 0,
        OptionValues = variant.OptionValues
            .OrderBy(x => x.OptionName)
            .Select(x => new VariantOptionValueDto
            {
                OptionId = x.OptionId,
                OptionName = x.OptionName,
                Value = x.Value
            })
            .ToList()
    };
    }

    private static string GetMediaType(string key)
    {
        var extension = Path.GetExtension(key).ToLowerInvariant();
        return extension switch
        {
            ".jpg" or ".jpeg" or ".png" or ".gif" or ".webp" or ".svg" => "image",
            ".mp4" or ".webm" or ".mov" => "video",
            _ => "file"
        };
    }
}
