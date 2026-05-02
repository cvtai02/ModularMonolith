using ProductCatalog.DTOs.Collections;
using ProductCatalog.Core.Entities;
using SharedKernel.Abstractions.Services;

namespace ProductCatalog.Core.Usecases.Collections;

internal static class CollectionMapper
{
    internal static CollectionResponse ToResponse(Collection c, IFileManager fm, int productCount = 0) => new()
    {
        Id = c.Id,
        Title = c.Title,
        Description = c.Description,
        Slug = c.Slug,
        ImageUrl = string.IsNullOrWhiteSpace(c.ImageKey) ? null : fm.BuildPublicUrl(c.ImageKey),
        ProductCount = productCount,
    };

    internal static CollectionDetailResponse ToDetailResponse(
        Collection collection,
        IFileManager fm,
        List<CollectionProduct> collectionProducts)
    {
        var distinctCollectionProducts = collectionProducts
            .GroupBy(x => x.ProductId)
            .Select(x => x.OrderBy(cp => cp.DisplayOrder).First())
            .OrderBy(x => x.DisplayOrder)
            .ToList();

        var response = new CollectionDetailResponse
        {
            Id = collection.Id,
            Title = collection.Title,
            Description = collection.Description,
            Slug = collection.Slug,
            ImageUrl = string.IsNullOrWhiteSpace(collection.ImageKey) ? null : fm.BuildPublicUrl(collection.ImageKey),
            ProductCount = distinctCollectionProducts.Count,
            Products = distinctCollectionProducts
                .Select(x => new CollectionProductResponse
                {
                    ProductId = x.ProductId,
                    Name = x.Product.Name,
                    Slug = x.Product.Slug,
                    ImageUrl = BuildProductImageUrl(x.Product, fm),
                    Status = x.Product.Status,
                    Price = x.Product.Variants.OrderBy(v => v.Id).Select(v => v.Price).FirstOrDefault(x.Product.Price),
                    Currency = x.Product.Currency,
                    DisplayOrder = x.DisplayOrder
                })
                .ToList()
        };

        return response;
    }

    private static string BuildProductImageUrl(Product product, IFileManager fm)
    {
        if (!string.IsNullOrWhiteSpace(product.ImageUrl))
            return product.ImageUrl;

        return product.Medias
            .OrderBy(x => x.DisplayOrder)
            .Select(x => fm.BuildPublicUrl(x.Key))
            .FirstOrDefault(x => !string.IsNullOrWhiteSpace(x)) ?? string.Empty;
    }
}
