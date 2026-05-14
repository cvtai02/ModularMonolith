using ProductCatalog.Core.Entities;
using ProductCatalog.DTOs.Collections;
using SharedKernel.Abstractions.Services;

namespace ProductCatalog.Core.Usecases.Collections;

internal static class CustomerCollectionMapper
{
    internal static CustomerCollectionResponse ToResponse(
        Collection collection,
        IFileManager fileManager,
        int productCount = 0) => new()
    {
        Id = collection.Id,
        Title = collection.Title,
        Description = collection.Description,
        Slug = collection.Slug,
        ImageUrl = string.IsNullOrWhiteSpace(collection.ImageKey) ? null : fileManager.BuildPublicUrl(collection.ImageKey),
        ProductCount = productCount
    };

    internal static CustomerCollectionDetailResponse ToDetailResponse(
        Collection collection,
        IFileManager fileManager,
        List<CollectionProduct> collectionProducts)
    {
        var products = collectionProducts
            .GroupBy(x => x.ProductId)
            .Select(x => x.OrderBy(cp => cp.DisplayOrder).First())
            .OrderBy(x => x.DisplayOrder)
            .ToList();

        return new CustomerCollectionDetailResponse
        {
            Id = collection.Id,
            Title = collection.Title,
            Description = collection.Description,
            Slug = collection.Slug,
            ImageUrl = string.IsNullOrWhiteSpace(collection.ImageKey) ? null : fileManager.BuildPublicUrl(collection.ImageKey),
            ProductCount = products.Count,
            Products = products
                .Select(x =>
                {
                    var summary = ProductCatalog.Core.Usecases.Products.CustomerProductMapper.ToSummary(x.Product, fileManager);
                    return new CustomerCollectionProductResponse
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
                        DisplayOrder = x.DisplayOrder
                    };
                })
                .ToList()
        };
    }
}
