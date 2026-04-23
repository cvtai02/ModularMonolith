using Microsoft.EntityFrameworkCore;
using ProductCatalog.Core.DTOs.Products;
using ProductCatalog.Core.Entities;
using SharedKernel.Abstractions.Services;
using SharedKernel.Exceptions;
using SharedKernel.Extensions;

namespace ProductCatalog.Core.Usecases.Products;

public class CreateProduct(ProductCatalogDbContext db, IFileManager fileManager)
{
    public async Task<ProductResponse> ExecuteAsync(CreateProductRequest request, CancellationToken ct)
    {
        var name = request.Name.Trim();
        var categoryName = request.CategoryName.Trim();
        var slug = string.IsNullOrWhiteSpace(request.Slug) ? name.ToSlug() : request.Slug.Trim();

        await ValidateRequest(request, name, categoryName, slug, ct);

        var category = await db.Categories.FirstAsync(x => x.Name == categoryName, ct);
        var medias = BuildMedias(request);

        var product = new Product
        {
            Name = name,
            Description = request.Description.Trim(),
            CategoryName = category.Name,
            Brand = request.Brand.Trim(),
            Slug = slug,
            ImageUrl = medias.OrderBy(x => x.DisplayOrder).Select(x => fileManager.BuildPublicUrl(x.Key)).FirstOrDefault()
                ?? request.ImageUrl.Trim(),
            Price = request.Price,
            Currency = request.Currency,
            CompareAtPrice = request.CompareAtPrice,
            CostPrice = request.CostPrice,
            ChargeTax = request.ChargeTax,
            TrackInventory = request.TrackInventory,
            AllowBackorder = request.AllowBackorder,
            Status = request.Status,
            Category = category,
            Medias = medias,
            Options = BuildOptions(request),
            Metric = new ProductMetric(),
        };

        db.Products.Add(product);

        await using var transaction = await db.Database.BeginTransactionAsync(ct);
        await db.SaveChangesAsync(ct);

        var optionLookup = await db.Options
            .Where(x => x.ProductId == product.Id)
            .ToDictionaryAsync(x => x.Name, x => x, StringComparer.OrdinalIgnoreCase, ct);

        var variants = BuildVariants(request, product, optionLookup);
        db.Variants.AddRange(variants);
        await db.SaveChangesAsync(ct);

        var shippingInfos = variants.Select(variant =>
        {
            var variantInput = request.Variants.FirstOrDefault(x => MatchesVariant(x, variant));
            return new VariantShipping
            {
                VariantId = variant.Id,
                Physical = variantInput?.PhysicalProduct ?? request.PhysicalProduct,
                Weight = variantInput?.Weight ?? request.Weight,
                Width = variantInput?.Width ?? request.Width,
                Height = variantInput?.Height ?? request.Height,
                Length = variantInput?.Length ?? request.Length,
            };
        }).ToList();

        if (shippingInfos.Count > 0)
            db.VariantShippings.AddRange(shippingInfos);

        await db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        var created = await db.Products
            .AsNoTracking()
            .Include(x => x.Medias)
            .Include(x => x.Options).ThenInclude(x => x.OptionValues)
            .Include(x => x.Variants).ThenInclude(x => x.OptionValues)
            .Include(x => x.Variants).ThenInclude(x => x.ShippingInfo)
            .Include(x => x.Metric)
            .FirstAsync(x => x.Id == product.Id, ct);

        return ProductMapper.ToResponse(created, fileManager);
    }

    private async Task ValidateRequest(
        CreateProductRequest request, string name, string categoryName, string slug, CancellationToken ct)
    {
        var errors = new Dictionary<string, string[]>();

        if (!await db.Categories.AnyAsync(x => x.Name == categoryName, ct))
            errors[nameof(request.CategoryName)] = ["Category does not exist."];

        if (await db.Products.AnyAsync(x => x.Slug == slug, ct))
            errors[nameof(request.Slug)] = ["Slug already exists."];

        if (request.Options.Count > 2)
            errors[nameof(request.Options)] = ["A product can have at most 2 options."];

        var optionNames = request.Options
            .Select(x => x.Name.Trim())
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .ToList();

        if (optionNames.Count != optionNames.Distinct(StringComparer.OrdinalIgnoreCase).Count())
            errors[nameof(request.Options)] = ["Option names must be unique."];

        foreach (var option in request.Options)
        {
            var distinctValues = option.Values
                .Select(x => x.Trim())
                .Where(x => !string.IsNullOrWhiteSpace(x))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            if (distinctValues.Count == 0)
                errors[$"{nameof(request.Options)}.{option.Name}"] = ["Each option must have at least one value."];
        }

        if (request.Options.Count > 0 && request.Variants.Count == 0)
            errors[nameof(request.Variants)] = ["Variants are required when product options are provided."];

        if (request.Options.Count == 0 && request.Variants.Count > 1)
            errors[nameof(request.Variants)] = ["Products without options can only create one default variant."];

        if (request.Variants.Count > 0)
        {
            var optionNameSet = request.Options.Select(x => x.Name.Trim()).ToHashSet(StringComparer.OrdinalIgnoreCase);
            var variantKeys = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            foreach (var variant in request.Variants)
            {
                if (request.Options.Count > 0 && variant.OptionValues.Count != request.Options.Count)
                {
                    errors[nameof(request.Variants)] = ["Each variant must provide a value for every option."];
                    break;
                }

                foreach (var optionValue in variant.OptionValues)
                {
                    if (!optionNameSet.Contains(optionValue.OptionName.Trim()))
                    {
                        errors[nameof(request.Variants)] = ["Variant option values must reference defined product options."];
                        break;
                    }
                }

                var variantKey = string.Join("|", variant.OptionValues
                    .OrderBy(x => x.OptionName, StringComparer.OrdinalIgnoreCase)
                    .Select(x => $"{x.OptionName.Trim()}:{x.Value.Trim()}"));

                if (!variantKeys.Add(variantKey))
                {
                    errors[nameof(request.Variants)] = ["Duplicate variant combinations are not allowed."];
                    break;
                }

                var variantPrice = variant.Price ?? request.Price;
                var variantCompareAtPrice = variant.CompareAtPrice ?? request.CompareAtPrice;
                if (variantCompareAtPrice > 0 && variantCompareAtPrice < variantPrice)
                {
                    errors[nameof(request.Variants)] = ["Variant compare-at price must be greater than or equal to price."];
                    break;
                }
            }
        }

        if (request.CompareAtPrice > 0 && request.CompareAtPrice < request.Price)
            errors[nameof(request.CompareAtPrice)] = ["Compare-at price must be greater than or equal to price."];

        if (errors.Count > 0)
            throw new ValidationException("Validation failed", errors);
    }

    private static List<ProductMedia> BuildMedias(CreateProductRequest request)
    {
        var medias = request.Medias
            .Where(x => !string.IsNullOrWhiteSpace(x.Url))
            .Select(x => new ProductMedia { Key = NormalizeMediaKey(x.Url), DisplayOrder = x.DisplayOrder })
            .OrderBy(x => x.DisplayOrder)
            .ToList();

        if (medias.Count == 0 && !string.IsNullOrWhiteSpace(request.ImageUrl))
            medias.Add(new ProductMedia { Key = NormalizeMediaKey(request.ImageUrl), DisplayOrder = 0 });

        return medias;
    }

    private static List<Option> BuildOptions(CreateProductRequest request) =>
        request.Options.Select(option => new Option
        {
            Name = option.Name.Trim(),
            DisplayOrder = option.DisplayOrder,
            OptionValues = option.Values
                .Select((value, index) => new { Value = value.Trim(), Index = index })
                .Where(x => !string.IsNullOrWhiteSpace(x.Value))
                .DistinctBy(x => x.Value, StringComparer.OrdinalIgnoreCase)
                .Select(x => new OptionValue { Value = x.Value, DisplayOrder = x.Index })
                .ToList()
        }).ToList();

    private static List<Variant> BuildVariants(
        CreateProductRequest request,
        Product product,
        IReadOnlyDictionary<string, Option> optionLookup)
    {
        if (request.Variants.Count == 0)
            return
            [
                new Variant
                {
                    ProductId = product.Id,
                    ImageUrl = string.IsNullOrWhiteSpace(request.ImageUrl) ? null : request.ImageUrl.Trim(),
                    TrackInventory = request.TrackInventory,
                    LowStockThreshold = request.LowStockThreshold,
                    AllowBackorder = request.AllowBackorder,
                    Price = request.Price,
                    CompareAtPrice = request.CompareAtPrice,
                    CostPrice = request.CostPrice,
                    ChargeTax = request.ChargeTax
                }
            ];

        return request.Variants.Select(variant => new Variant
        {
            ProductId = product.Id,
            ImageUrl = string.IsNullOrWhiteSpace(variant.ImageUrl) ? product.ImageUrl : variant.ImageUrl.Trim(),
            TrackInventory = variant.TrackInventory ?? request.TrackInventory,
            LowStockThreshold = variant.LowStockThreshold ?? request.LowStockThreshold,
            AllowBackorder = variant.AllowBackorder ?? request.AllowBackorder,
            Price = variant.Price ?? request.Price,
            CompareAtPrice = variant.CompareAtPrice ?? request.CompareAtPrice,
            CostPrice = variant.CostPrice ?? request.CostPrice,
            ChargeTax = variant.ChargeTax ?? request.ChargeTax,
            OptionValues = variant.OptionValues.Select(optionValue =>
            {
                var option = optionLookup[optionValue.OptionName.Trim()];
                return new VariantOptionValue
                {
                    OptionId = option.Id,
                    OptionName = option.Name,
                    Value = optionValue.Value.Trim()
                };
            }).ToList()
        }).ToList();
    }

    private static bool MatchesVariant(CreateVariantRequest request, Variant variant)
    {
        var requestKey = string.Join("|", request.OptionValues
            .OrderBy(x => x.OptionName, StringComparer.OrdinalIgnoreCase)
            .Select(x => $"{x.OptionName.Trim()}:{x.Value.Trim()}"));
        var variantKey = string.Join("|", variant.OptionValues
            .OrderBy(x => x.OptionName, StringComparer.OrdinalIgnoreCase)
            .Select(x => $"{x.OptionName}:{x.Value}"));
        return string.Equals(requestKey, variantKey, StringComparison.OrdinalIgnoreCase);
    }

    private static string NormalizeMediaKey(string value)
    {
        var trimmed = value.Trim();
        if (Uri.TryCreate(trimmed, UriKind.Absolute, out var uri))
            return uri.AbsolutePath.TrimStart('/');
        return trimmed.TrimStart('/');
    }
}
