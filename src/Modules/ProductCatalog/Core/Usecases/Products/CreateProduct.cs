using Microsoft.EntityFrameworkCore;
using ProductCatalog.Core.Entities;
using ProductCatalog.DTOs.Products;
using SharedKernel.Abstractions.Services;
using SharedKernel.Exceptions;
using SharedKernel.Extensions;

namespace ProductCatalog.Core.Usecases.Products;

[UsecaseInject]
public class CreateProduct(ProductCatalogDbContext db, IFileManager fileManager, ITenant tenant)
{
    public async Task<ProductResponse> ExecuteAsync(CreateProductRequest request, CancellationToken ct)
    {
        var name = request.Name.Trim();
        var slug = name.ToSlug();

        await ValidateRequest(request, name, slug, ct);

        var category = await db.Categories.FirstAsync(x => x.Id == request.CategoryId, ct);
        var medias = BuildMedias(request);
        var productImageKey = ResolveProductImageKey(medias, request.ImageUrl);
        var productId = await ResolveProductIdAsync(request.Id, slug, ct);

        var product = new Product
        {
            Id = productId,
            Name = name,
            Description = request.Description.Trim(),
            CategoryId = category.Id,
            Slug = slug,
            ImageUrl = productImageKey is null ? null : fileManager.BuildPublicUrl(productImageKey)
                ?? request.ImageUrl.Trim(),
            Status = request.Status,
            Category = category,
            ShippingInfo = BuildProductShipping(request),
            Medias = medias,
            Options = BuildOptions(request),
            Metric = new ProductMetric { ProductId = productId },
        };
        product.ApplyPricing(request.Price, request.Currency, request.CompareAtPrice, request.CostPrice, request.ChargeTax);
        product.SetInventoryPolicy(request.TrackInventory, request.AllowBackorder);

        db.Products.Add(product);

        await using var transaction = await db.Database.BeginTransactionAsync(ct);
        await db.SaveChangesAsync(ct);

        var optionLookup = await db.Options
            .Where(x => x.ProductId == product.Id)
            .ToDictionaryAsync(x => x.Name, x => x, StringComparer.OrdinalIgnoreCase, ct);

        var variants = BuildVariants(request, product, optionLookup, productImageKey);
        db.Variants.AddRange(variants);
        await db.SaveChangesAsync(ct);

        var variantMetrics = BuildVariantMetrics(request, variants);
        product.Metric.Stock = variantMetrics.Sum(x => x.Stock);
        ApplyPriceRange(product, variants);
        db.VariantMetrics.AddRange(variantMetrics);

        var shippingInfos = variants.Select(variant =>
        {
            var variantInput = request.Variants.FirstOrDefault(x => MatchesVariant(x, variant));
            var useProductShipping = variantInput?.UseProductShipping ?? true;
            var shipping = new VariantShipping { VariantId = variant.Id };
            if (useProductShipping)
                shipping.ApplyProductShipping(product.ShippingInfo!);
            else
                shipping.ApplyVariantShipping(
                    variantInput?.PhysicalProduct ?? request.PhysicalProduct,
                    variantInput?.Weight ?? request.Weight,
                    variantInput?.Width ?? request.Width,
                    variantInput?.Height ?? request.Height,
                    variantInput?.Length ?? request.Length);
            return shipping;
        }).ToList();

        if (shippingInfos.Count > 0)
            db.VariantShippings.AddRange(shippingInfos);

        await db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        var created = await db.Products
            .AsNoTracking()
            .Include(x => x.Category)
            .Include(x => x.ShippingInfo)
            .Include(x => x.Medias)
            .Include(x => x.Options).ThenInclude(x => x.OptionValues)
            .Include(x => x.Variants).ThenInclude(x => x.OptionValues)
            .Include(x => x.Variants).ThenInclude(x => x.ShippingInfo)
            .Include(x => x.Variants).ThenInclude(x => x.Metric)
            .Include(x => x.Metric)
            .FirstAsync(x => x.Id == product.Id, ct);

        return ProductMapper.ToResponse(created, fileManager);
    }

    private async Task ValidateRequest(
        CreateProductRequest request, string name, string slug, CancellationToken ct)
    {
        var errors = new Dictionary<string, string[]>();

        if (!await db.Categories.AnyAsync(x => x.Id == request.CategoryId, ct))
            errors[nameof(request.CategoryId)] = ["Category does not exist."];

        if (await db.Products.AnyAsync(x => x.Slug == slug, ct))
            errors["slug"] = [$"A product with a similar name already exists. Try a different name."];

        var requestedProductId = NormalizeId(request.Id);
        if (requestedProductId is not null && await db.Products.AnyAsync(x => x.Id == requestedProductId, ct))
            errors[nameof(request.Id)] = ["Product id already exists."];

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
            ValidateVariants(request, errors);

        if (request.CompareAtPrice > 0 && request.CompareAtPrice < request.Price)
            errors[nameof(request.CompareAtPrice)] = ["Compare-at price must be greater than or equal to price."];

        ValidateMedias(request, errors);

        if (errors.Count > 0)
            throw new ValidationException("Validation failed", errors);
    }

    private static void ValidateVariants(CreateProductRequest request, Dictionary<string, string[]> errors)
    {
        var optionValueLookup = BuildOptionValueLookup(request);
        var variantKeys = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var variantIds = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (var variant in request.Variants)
        {
            var normalizedVariantId = NormalizeId(variant.Id);
            if (normalizedVariantId is not null && !variantIds.Add(normalizedVariantId))
            {
                errors[nameof(request.Variants)] = ["Duplicate variant ids are not allowed."];
                break;
            }

            if (request.Options.Count > 0 && variant.OptionValues.Count != request.Options.Count)
            {
                errors[nameof(request.Variants)] = ["Each variant must provide a value for every option."];
                break;
            }

            foreach (var optionValue in variant.OptionValues)
            {
                var optionName = optionValue.OptionName.Trim();
                var value = optionValue.Value.Trim();
                if (!optionValueLookup.TryGetValue(optionName, out var allowedValues) ||
                    !allowedValues.Contains(value))
                {
                    errors[nameof(request.Variants)] = ["Variant option values must reference defined product option values."];
                    break;
                }
            }

            if (errors.ContainsKey(nameof(request.Variants)))
                break;

            var variantKey = VariantKey(variant);
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

    private static Dictionary<string, HashSet<string>> BuildOptionValueLookup(CreateProductRequest request)
        => request.Options.ToDictionary(
            x => x.Name.Trim(),
            x => x.Values
                .Select(v => v.Trim())
                .Where(v => !string.IsNullOrWhiteSpace(v))
                .ToHashSet(StringComparer.OrdinalIgnoreCase),
            StringComparer.OrdinalIgnoreCase);

    private static List<ProductMedia> BuildMedias(CreateProductRequest request)
    {
        var mediaKeys = request.MediaKeys
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select((key, index) => new MediaInput(NormalizeMediaKey(key), index));

        var medias = mediaKeys.Concat(request.Medias
            .Where(x => !string.IsNullOrWhiteSpace(x.Url))
            .Select(x => new MediaInput(NormalizeMediaKey(x.Url), x.DisplayOrder)))
            .ToList();

        if (medias.Count == 0 && !string.IsNullOrWhiteSpace(request.ImageUrl))
            medias.Add(new MediaInput(NormalizeMediaKey(request.ImageUrl), 0));

        return OrderMedias(medias);
    }

    private static ProductShipping BuildProductShipping(CreateProductRequest request)
    {
        var shipping = new ProductShipping();
        shipping.ApplyShipping(request.PhysicalProduct, request.Weight, request.Width, request.Height, request.Length);
        return shipping;
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
        IReadOnlyDictionary<string, Option> optionLookup,
        string? productImageKey)
    {
        if (request.Variants.Count == 0)
        {
            var variant = new Variant
            {
                Id = GenerateVariantId(product.Id, "variant"),
                ProductId = product.Id,
                ImageKey = productImageKey
            };
            variant.ApplyProductPricing(product);
            variant.SetInventoryPolicy(request.TrackInventory, request.AllowBackorder);
            return [variant];
        }

        var imageKeyByFirstOptionValue = BuildImageKeyByFirstOptionValue(request, productImageKey);

        return request.Variants.Select(variantRequest =>
        {
            var variant = new Variant
            {
                Id = ResolveVariantId(variantRequest.Id, product.Id, variantRequest),
                ProductId = product.Id,
                ImageKey = ResolveVariantImageKey(variantRequest, request, productImageKey, imageKeyByFirstOptionValue),
                OptionValues = variantRequest.OptionValues.Select(optionValue =>
                {
                    var option = optionLookup[optionValue.OptionName.Trim()];
                    return new VariantOptionValue
                    {
                        OptionId = option.Id,
                        OptionName = option.Name,
                        Value = optionValue.Value.Trim()
                    };
                }).ToList()
            };

            if (variantRequest.UseProductPricing)
                variant.ApplyProductPricing(product);
            else
                variant.ApplyVariantPricing(
                    variantRequest.Price ?? request.Price,
                    variantRequest.CompareAtPrice ?? request.CompareAtPrice,
                    variantRequest.CostPrice ?? request.CostPrice,
                    variantRequest.ChargeTax ?? request.ChargeTax);

            variant.SetInventoryPolicy(
                variantRequest.TrackInventory ?? request.TrackInventory,
                variantRequest.AllowBackorder ?? request.AllowBackorder);

            return variant;
        }).ToList();
    }

    private static List<VariantMetric> BuildVariantMetrics(CreateProductRequest request, IReadOnlyCollection<Variant> variants)
        => variants.Select(variant =>
        {
            var variantInput = request.Variants.FirstOrDefault(x => MatchesVariant(x, variant));
            return new VariantMetric
            {
                VariantId = variant.Id,
                Stock = variantInput?.Quantity ?? request.Stock
            };
        }).ToList();

    private static void ApplyPriceRange(Product product, IReadOnlyCollection<Variant> variants)
    {
        var prices = variants.Select(x => x.Price)
            .DefaultIfEmpty(product.Price)
            .ToList();

        product.Metric.LowestPrice = prices.Min();
        product.Metric.HighestPrice = prices.Max();
    }

    private static Dictionary<string, string?> BuildImageKeyByFirstOptionValue(
        CreateProductRequest request,
        string? productImageKey)
    {
        var firstOptionName = GetFirstOptionName(request);
        if (firstOptionName is null)
            return [];

        var imageKeyByValue = new Dictionary<string, string?>(StringComparer.OrdinalIgnoreCase);
        foreach (var group in request.Variants
                     .Select(x => new { Variant = x, FirstOptionValue = GetOptionValue(x, firstOptionName) })
                     .Where(x => x.FirstOptionValue is not null)
                     .GroupBy(x => x.FirstOptionValue!, StringComparer.OrdinalIgnoreCase))
        {
            var explicitImageKey = group
                .Select(x => x.Variant.ImageKey)
                .FirstOrDefault(x => !string.IsNullOrWhiteSpace(x));
            imageKeyByValue[group.Key] = explicitImageKey is null
                ? productImageKey
                : NormalizeMediaKey(explicitImageKey);
        }

        return imageKeyByValue;
    }

    private static string? ResolveVariantImageKey(
        CreateVariantRequest variant,
        CreateProductRequest request,
        string? productImageKey,
        IReadOnlyDictionary<string, string?> imageKeyByFirstOptionValue)
    {
        var firstOptionName = GetFirstOptionName(request);
        var firstOptionValue = firstOptionName is null ? null : GetOptionValue(variant, firstOptionName);
        if (firstOptionValue is not null
            && imageKeyByFirstOptionValue.TryGetValue(firstOptionValue, out var sharedImageKey))
        {
            return sharedImageKey;
        }

        return string.IsNullOrWhiteSpace(variant.ImageKey)
            ? productImageKey
            : NormalizeMediaKey(variant.ImageKey);
    }

    private static string? GetFirstOptionName(CreateProductRequest request)
        => request.Options
            .OrderBy(x => x.DisplayOrder)
            .ThenBy(x => x.Name, StringComparer.OrdinalIgnoreCase)
            .Select(x => x.Name.Trim())
            .FirstOrDefault(x => !string.IsNullOrWhiteSpace(x));

    private static string? GetOptionValue(CreateVariantRequest variant, string optionName)
        => variant.OptionValues
            .FirstOrDefault(x => string.Equals(x.OptionName.Trim(), optionName, StringComparison.OrdinalIgnoreCase))
            ?.Value
            .Trim();

    private async Task<string> ResolveProductIdAsync(string? requestedId, string slug, CancellationToken ct)
    {
        var id = NormalizeId(requestedId) ?? GenerateProductId(slug);
        if (await db.Products.AnyAsync(x => x.Id == id, ct))
            throw new ValidationException("Validation failed", new Dictionary<string, string[]>
            {
                [nameof(CreateProductRequest.Id)] = ["Product id already exists."]
            });
        return id;
    }

    private static bool MatchesVariant(CreateVariantRequest request, Variant variant)
    {
        var requestKey = VariantKey(request);
        var variantKey = string.Join("|", variant.OptionValues
            .OrderBy(x => x.OptionName, StringComparer.OrdinalIgnoreCase)
            .Select(x => $"{x.OptionName}:{x.Value}"));
        return string.Equals(requestKey, variantKey, StringComparison.OrdinalIgnoreCase);
    }

    private static string ResolveVariantId(string? requestedId, string productId, CreateVariantRequest request)
        => NormalizeId(requestedId) ?? GenerateVariantId(productId, VariantKey(request));

    private string GenerateProductId(string slug)
        => $"{tenant.Signature}-{NormalizeId(slug) ?? Guid.NewGuid().ToString("N")[..10]}";

    private static string GenerateVariantId(string productId, string key)
        => $"{productId}-{NormalizeId(key) ?? Guid.NewGuid().ToString("N")[..8]}";

    private static string VariantKey(CreateVariantRequest request)
        => request.OptionValues.Count == 0
            ? "variant"
            : string.Join("-", request.OptionValues
                .OrderBy(x => x.OptionName, StringComparer.OrdinalIgnoreCase)
                .Select(x => $"{x.OptionName.Trim().First()}-{x.Value.Trim()}"));

    private static string NormalizeMediaKey(string value)
    {
        var trimmed = value.Trim();
        if (Uri.TryCreate(trimmed, UriKind.Absolute, out var uri))
            return uri.AbsolutePath.TrimStart('/');
        return trimmed.TrimStart('/');
    }

    private static void ValidateMedias(CreateProductRequest request, Dictionary<string, string[]> errors)
    {
        var mp4Keys = request.MediaKeys
            .Concat(request.Medias.Select(x => x.Url))
            .Concat(string.IsNullOrWhiteSpace(request.ImageUrl) ? [] : [request.ImageUrl])
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(NormalizeMediaKey)
            .Where(IsMp4)
            .ToList();

        if (mp4Keys.Count > 1)
            errors[nameof(request.MediaKeys)] = ["Only one mp4 media key is allowed per product."];
    }

    private static List<ProductMedia> OrderMedias(List<MediaInput> medias)
    {
        var mp4 = medias.FirstOrDefault(x => IsMp4(x.Key));
        var ordered = new List<MediaInput>();
        if (mp4 is not null)
            ordered.Add(mp4);

        ordered.AddRange(medias
            .Where(x => !IsMp4(x.Key))
            .OrderBy(x => x.DisplayOrder));

        return ordered
            .Select((x, index) => new ProductMedia { Key = x.Key, DisplayOrder = index })
            .ToList();
    }

    private static string? ResolveProductImageKey(IReadOnlyCollection<ProductMedia> medias, string? fallbackImageUrl)
    {
        var imageKey = medias
            .OrderBy(x => x.DisplayOrder)
            .Select(x => x.Key)
            .FirstOrDefault(IsImage);

        if (imageKey is not null)
            return imageKey;

        return string.IsNullOrWhiteSpace(fallbackImageUrl) ? null : NormalizeMediaKey(fallbackImageUrl);
    }

    private static bool IsMp4(string key) =>
        string.Equals(Path.GetExtension(key), ".mp4", StringComparison.OrdinalIgnoreCase);

    private static bool IsImage(string key)
    {
        var extension = Path.GetExtension(key).ToLowerInvariant();
        return extension is ".jpg" or ".jpeg" or ".png" or ".gif" or ".webp" or ".svg";
    }

    private sealed record MediaInput(string Key, float DisplayOrder);

    private static string? NormalizeId(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return null;
        var normalized = value.Trim().ToLowerInvariant();
        normalized = string.Concat(normalized.Select(ch => char.IsLetterOrDigit(ch) ? ch : '-'));
        while (normalized.Contains("--", StringComparison.Ordinal))
            normalized = normalized.Replace("--", "-", StringComparison.Ordinal);
        normalized = normalized.Trim('-');
        return string.IsNullOrWhiteSpace(normalized) ? null : normalized;
    }
}
