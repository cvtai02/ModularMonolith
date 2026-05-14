using ProductCatalog.Core.Entities;
using ProductCatalog.DTOs.Products;
using SharedKernel.Abstractions.Services;

namespace ProductCatalog.Core.Usecases.Products;

internal static class CustomerProductMapper
{
    internal static CustomerProductSummaryResponse ToSummary(Product product, IFileManager fileManager)
    {
        var primaryVariant = product.Variants.OrderBy(x => x.Id).FirstOrDefault();
        var displayPrice = primaryVariant?.Price ?? product.Price;
        var (lowestPrice, highestPrice) = ResolvePriceRange(product);

        return new CustomerProductSummaryResponse
        {
            Id = product.Id,
            Name = product.Name,
            Slug = product.Slug,
            ImageUrl = ResolveImageUrl(product, fileManager),
            CategoryId = product.CategoryId,
            CategoryName = product.Category?.Name ?? string.Empty,
            Price = displayPrice,
            LowestPrice = lowestPrice,
            HighestPrice = highestPrice,
            Currency = product.Currency
        };
    }

    internal static CustomerProductResponse ToResponse(Product product, IFileManager fileManager)
    {
        var summary = ToSummary(product, fileManager);
        var primaryVariant = product.Variants.OrderBy(x => x.Id).FirstOrDefault();

        return new CustomerProductResponse
        {
            Id = summary.Id,
            Name = summary.Name,
            Slug = summary.Slug,
            ImageUrl = summary.ImageUrl,
            CategoryId = summary.CategoryId,
            CategoryName = summary.CategoryName,
            Price = summary.Price,
            LowestPrice = summary.LowestPrice,
            HighestPrice = summary.HighestPrice,
            Currency = summary.Currency,
            Description = product.Description,
            CompareAtPrice = primaryVariant?.CompareAtPrice ?? product.CompareAtPrice,
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
            Variants = product.Variants
                .OrderBy(x => x.Id)
                .Select(x => ToVariantResponse(x, fileManager))
                .ToList()
        };
    }

    private static CustomerVariantResponse ToVariantResponse(Variant variant, IFileManager fileManager) => new()
    {
        Id = variant.Id,
        Price = variant.Price,
        CompareAtPrice = variant.CompareAtPrice ?? 0,
        ImageUrl = string.IsNullOrWhiteSpace(variant.ImageKey) ? string.Empty : fileManager.BuildPublicUrl(variant.ImageKey)!,
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

    private static (decimal LowestPrice, decimal HighestPrice) ResolvePriceRange(Product product)
    {
        var hasMetricPriceRange = product.Metric is not null
            && (product.Metric.LowestPrice > 0 || product.Metric.HighestPrice > 0);
        if (hasMetricPriceRange)
            return (product.Metric!.LowestPrice, product.Metric.HighestPrice);

        var prices = product.Variants.Select(x => x.Price)
            .DefaultIfEmpty(product.Price)
            .ToList();
        return (prices.Min(), prices.Max());
    }

    private static string ResolveImageUrl(Product product, IFileManager fileManager)
        => string.IsNullOrWhiteSpace(product.ImageUrl)
            ? product.Medias.OrderBy(x => x.DisplayOrder).Select(x => fileManager.BuildPublicUrl(x.Key)).FirstOrDefault() ?? string.Empty
            : product.ImageUrl;

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
