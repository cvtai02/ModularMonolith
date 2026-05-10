using Microsoft.EntityFrameworkCore;
using ProductCatalog.Core.Entities;
using ProductCatalog.DTOs.Products;
using SharedKernel.Abstractions.Services;
using SharedKernel.Exceptions;
using SharedKernel.Extensions;

namespace ProductCatalog.Core.Usecases.Products;

[UsecaseInject]
public class UpdateProduct(ProductCatalogDbContext db, IFileManager fileManager)
{
    public async Task<ProductResponse?> ExecuteAsync(string id, UpdateProductRequest request, CancellationToken ct)
    {
        var product = await db.Products
            .Include(x => x.ShippingInfo)
            .Include(x => x.Options).ThenInclude(x => x.OptionValues)
            .Include(x => x.Variants).ThenInclude(x => x.OptionValues)
            .Include(x => x.Variants).ThenInclude(x => x.ShippingInfo)
            .Include(x => x.Variants).ThenInclude(x => x.Metric)
            .Include(x => x.Metric)
            .FirstOrDefaultAsync(x => x.Id == id, ct);
        if (product is null) return null;

        var name = request.Name.Trim();
        var slug = name.ToSlug();

        await ValidateRequest(request, id, product, slug, ct);

        var category = await db.Categories.FirstAsync(x => x.Id == request.CategoryId, ct);

        product.Name = name;
        product.Slug = slug;
        product.Description = request.Description.Trim();
        product.CategoryId = category.Id;
        product.Category = category;
        product.Status = request.Status;
        product.ApplyPricing(request.Price, request.Currency, request.CompareAtPrice, request.CostPrice, request.ChargeTax);
        product.SetInventoryPolicy(request.TrackInventory, request.AllowBackorder);

        if (product.ShippingInfo is null)
        {
            product.ShippingInfo = new ProductShipping { ProductId = product.Id };
            db.ProductShippings.Add(product.ShippingInfo);
        }
        product.ShippingInfo.ApplyShipping(request.PhysicalProduct, request.Weight, request.Width, request.Height, request.Length);

        await ReplaceMediasAsync(product, request, ct);
        ApplyOptionValues(product, request);
        ApplyVariantUpdates(product, request);

        foreach (var variant in product.Variants.Where(x => x.UseProductPricing))
            variant.ApplyProductPricing(product);

        var productMetric = EnsureProductMetric(product);
        productMetric.Stock = product.Variants.Sum(x => x.Metric?.Stock ?? 0);
        ApplyPriceRange(product);

        await db.SaveChangesAsync(ct);

        var updated = await db.Products
            .AsNoTracking()
            .Include(x => x.Category)
            .Include(x => x.ShippingInfo)
            .Include(x => x.Medias)
            .Include(x => x.Options).ThenInclude(x => x.OptionValues)
            .Include(x => x.Variants).ThenInclude(x => x.OptionValues)
            .Include(x => x.Variants).ThenInclude(x => x.ShippingInfo)
            .Include(x => x.Variants).ThenInclude(x => x.Metric)
            .Include(x => x.Metric)
            .FirstAsync(x => x.Id == id, ct);

        return ProductMapper.ToResponse(updated, fileManager);
    }

    private ProductMetric EnsureProductMetric(Product product)
    {
        if (product.Metric is null)
        {
            product.Metric = new ProductMetric { ProductId = product.Id };
            db.ProductMetrics.Add(product.Metric);
        }

        return product.Metric;
    }

    private static void ApplyPriceRange(Product product)
    {
        var prices = product.Variants.Select(x => x.Price)
            .DefaultIfEmpty(product.Price)
            .ToList();

        product.Metric.LowestPrice = prices.Min();
        product.Metric.HighestPrice = prices.Max();
    }

    private async Task ValidateRequest(UpdateProductRequest request, string productId, Product product, string slug, CancellationToken ct)
    {
        var errors = new Dictionary<string, string[]>();

        if (!await db.Categories.AnyAsync(x => x.Id == request.CategoryId, ct))
            errors[nameof(request.CategoryId)] = ["Category does not exist."];

        if (await db.Products.AnyAsync(x => x.Slug == slug && x.Id != productId, ct))
            errors["slug"] = ["A product with a similar name already exists. Try a different name."];

        if (request.CompareAtPrice > 0 && request.CompareAtPrice < request.Price)
            errors[nameof(request.CompareAtPrice)] = ["Compare-at price must be greater than or equal to price."];

        ValidateOptions(request, product, errors);

        if (request.Variants.Count > 0)
            ValidateVariants(request, product, errors);

        ValidateMedias(request, errors);

        if (errors.Count > 0)
            throw new ValidationException("Validation failed", errors);
    }

    private static void ValidateOptions(UpdateProductRequest request, Product product, Dictionary<string, string[]> errors)
    {
        var existingByName = product.Options.ToDictionary(x => x.Name, StringComparer.OrdinalIgnoreCase);
        var requestByName = request.Options.ToDictionary(x => x.Name.Trim(), StringComparer.OrdinalIgnoreCase);

        var unknownOptions = requestByName.Keys.Except(existingByName.Keys, StringComparer.OrdinalIgnoreCase).ToList();
        if (unknownOptions.Count > 0)
        {
            errors[nameof(request.Options)] = [$"Options cannot be added or renamed on update: {string.Join(", ", unknownOptions)}."];
            return;
        }

        var missingOptions = existingByName.Keys.Except(requestByName.Keys, StringComparer.OrdinalIgnoreCase).ToList();
        if (missingOptions.Count > 0)
        {
            errors[nameof(request.Options)] = [$"Existing options cannot be removed on update: {string.Join(", ", missingOptions)}."];
            return;
        }

        foreach (var option in product.Options)
        {
            var normalizedRequestedValues = requestByName[option.Name].Values
                .Select(x => x.Trim())
                .Where(x => !string.IsNullOrWhiteSpace(x))
                .ToList();

            if (normalizedRequestedValues.Count != normalizedRequestedValues.Distinct(StringComparer.OrdinalIgnoreCase).Count())
            {
                errors[nameof(request.Options)] = [$"Option '{option.Name}' values must be unique."];
                return;
            }

            var requestedValues = normalizedRequestedValues.ToHashSet(StringComparer.OrdinalIgnoreCase);
            var existingValues = option.OptionValues.Select(x => x.Value).ToHashSet(StringComparer.OrdinalIgnoreCase);
            var removedValues = existingValues.Except(requestedValues, StringComparer.OrdinalIgnoreCase).ToList();
            if (removedValues.Count > 0)
            {
                errors[nameof(request.Options)] = [$"Option values cannot be removed on update: {string.Join(", ", removedValues)}."];
                return;
            }
        }
    }

    private static void ValidateVariants(UpdateProductRequest request, Product product, Dictionary<string, string[]> errors)
    {
        var existingById = product.Variants.ToDictionary(x => x.Id, StringComparer.OrdinalIgnoreCase);
        var requestedIds = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var optionValueLookup = BuildOptionValueLookup(request);
        var variantKeys = product.Variants
            .Select(VariantKey)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        foreach (var variantRequest in request.Variants)
        {
            var variantId = NormalizeId(variantRequest.Id);
            if (variantId is not null && !requestedIds.Add(variantId))
            {
                errors[nameof(request.Variants)] = ["Duplicate variant ids are not allowed."];
                return;
            }

            if (variantId is not null && existingById.TryGetValue(variantId, out var variant))
            {
                if (variantRequest.OptionValues.Count > 0 && !MatchesExistingOptionValues(variantRequest, variant))
                {
                    errors[nameof(request.Variants)] = ["Variant option values cannot be edited on product update."];
                    return;
                }
            }
            else
            {
                if (request.Options.Count > 0 && variantRequest.OptionValues.Count != request.Options.Count)
                {
                    errors[nameof(request.Variants)] = ["Each new variant must provide a value for every option."];
                    return;
                }

                foreach (var optionValue in variantRequest.OptionValues)
                {
                    var optionName = optionValue.OptionName.Trim();
                    var value = optionValue.Value.Trim();
                    if (!optionValueLookup.TryGetValue(optionName, out var allowedValues) ||
                        !allowedValues.Contains(value))
                    {
                        errors[nameof(request.Variants)] = ["New variant option values must reference defined product option values."];
                        return;
                    }
                }

                var variantKey = VariantKey(variantRequest);
                if (!variantKeys.Add(variantKey))
                {
                    errors[nameof(request.Variants)] = ["Duplicate variant combinations are not allowed."];
                    return;
                }
            }

            var variantPrice = variantRequest.UseProductPricing
                ? request.Price
                : variantRequest.Price ?? (variantId is not null && existingById.TryGetValue(variantId, out var pricedVariant)
                    ? pricedVariant.Price
                    : request.Price);
            var variantCompareAtPrice = variantRequest.UseProductPricing
                ? request.CompareAtPrice
                : variantRequest.CompareAtPrice ?? (variantId is not null && existingById.TryGetValue(variantId, out var comparedVariant)
                    ? comparedVariant.CompareAtPrice
                    : request.CompareAtPrice) ?? 0;
            if (variantCompareAtPrice > 0 && variantCompareAtPrice < variantPrice)
            {
                errors[nameof(request.Variants)] = ["Variant compare-at price must be greater than or equal to price."];
                return;
            }
        }
    }

    private static Dictionary<string, HashSet<string>> BuildOptionValueLookup(UpdateProductRequest request)
        => request.Options.ToDictionary(
            x => x.Name.Trim(),
            x => x.Values
                .Select(v => v.Trim())
                .Where(v => !string.IsNullOrWhiteSpace(v))
                .ToHashSet(StringComparer.OrdinalIgnoreCase),
            StringComparer.OrdinalIgnoreCase);

    private async Task ReplaceMediasAsync(Product product, UpdateProductRequest request, CancellationToken ct)
    {
        await db.ProductMedias.Where(x => x.ProductId == product.Id).ExecuteDeleteAsync(ct);
        var medias = BuildMedias(request);
        foreach (var media in medias)
            media.ProductId = product.Id;
        db.ProductMedias.AddRange(medias);
        var productImageKey = ResolveProductImageKey(medias, request.ImageUrl);
        product.ImageUrl = productImageKey is null ? null : fileManager.BuildPublicUrl(productImageKey)
            ?? request.ImageUrl.Trim();
    }

    private static void ApplyOptionValues(Product product, UpdateProductRequest request)
    {
        var requestByName = request.Options.ToDictionary(x => x.Name.Trim(), StringComparer.OrdinalIgnoreCase);
        foreach (var option in product.Options)
        {
            var existingByValue = option.OptionValues.ToDictionary(x => x.Value, StringComparer.OrdinalIgnoreCase);
            var requestedValues = requestByName[option.Name].Values
                .Select(x => x.Trim())
                .Where(x => !string.IsNullOrWhiteSpace(x))
                .ToList();

            for (var index = 0; index < requestedValues.Count; index++)
            {
                var value = requestedValues[index];
                if (existingByValue.TryGetValue(value, out var existing))
                {
                    existing.DisplayOrder = index;
                    continue;
                }

                option.OptionValues.Add(new OptionValue
                {
                    Value = value,
                    DisplayOrder = index
                });
            }
        }
    }

    private void ApplyVariantUpdates(Product product, UpdateProductRequest request)
    {
        var existingById = product.Variants.ToDictionary(x => x.Id, StringComparer.OrdinalIgnoreCase);
        var imageKeyByFirstOptionValue = BuildImageKeyByFirstOptionValue(product, request, existingById);

        foreach (var variantRequest in request.Variants)
        {
            var variantId = NormalizeId(variantRequest.Id);
            if (variantId is null || !existingById.TryGetValue(variantId, out var variant))
            {
                var newVariant = CreateVariant(product, request, variantRequest, imageKeyByFirstOptionValue);
                product.Variants.Add(newVariant);
                continue;
            }

            ApplyVariantRequest(product, request, variant, variantRequest, imageKeyByFirstOptionValue);
        }
    }

    private static Variant CreateVariant(
        Product product,
        UpdateProductRequest request,
        CreateVariantRequest variantRequest,
        IReadOnlyDictionary<string, string?> imageKeyByFirstOptionValue)
    {
        var variant = new Variant
        {
            Id = ResolveVariantId(variantRequest.Id, product.Id, variantRequest),
            ProductId = product.Id,
            OptionValues = variantRequest.OptionValues.Select(optionValue =>
            {
                var option = product.Options.First(x =>
                    string.Equals(x.Name.Trim(), optionValue.OptionName.Trim(), StringComparison.OrdinalIgnoreCase));
                return new VariantOptionValue
                {
                    OptionId = option.Id,
                    OptionName = option.Name,
                    Value = optionValue.Value.Trim()
                };
            }).ToList(),
            Metric = new VariantMetric { Stock = variantRequest.Quantity },
            ShippingInfo = new VariantShipping()
        };
        variant.Metric.VariantId = variant.Id;
        variant.ShippingInfo.VariantId = variant.Id;

        ApplyVariantRequest(product, request, variant, variantRequest, imageKeyByFirstOptionValue);
        return variant;
    }

    private static void ApplyVariantRequest(
        Product product,
        UpdateProductRequest request,
        Variant variant,
        CreateVariantRequest variantRequest,
        IReadOnlyDictionary<string, string?> imageKeyByFirstOptionValue)
    {
        if (TryGetSharedImageKey(variant, product, imageKeyByFirstOptionValue, out var sharedImageKey))
        {
            variant.ImageKey = sharedImageKey;
        }
        else if (variantRequest.ImageKey is not null)
        {
            variant.ImageKey = string.IsNullOrWhiteSpace(variantRequest.ImageKey)
                ? null
                : NormalizeMediaKey(variantRequest.ImageKey);
        }

        if (variantRequest.UseProductPricing)
        {
            variant.ApplyProductPricing(product);
        }
        else
        {
            variant.ApplyVariantPricing(
                variantRequest.Price ?? variant.Price,
                variantRequest.CompareAtPrice ?? variant.CompareAtPrice,
                variantRequest.CostPrice ?? variant.CostPrice,
                variantRequest.ChargeTax ?? variant.ChargeTax);
        }

        variant.SetInventoryPolicy(
            variantRequest.TrackInventory ?? variant.TrackInventory,
            variantRequest.AllowBackorder ?? variant.AllowBackorder);

        if (variant.Metric is null)
            variant.Metric = new VariantMetric { VariantId = variant.Id };
        variant.Metric.Stock = variantRequest.Quantity;

        if (variant.ShippingInfo is null)
            variant.ShippingInfo = new VariantShipping { VariantId = variant.Id };

        if (variantRequest.UseProductShipping)
        {
            if (product.ShippingInfo is not null)
                variant.ShippingInfo.ApplyProductShipping(product.ShippingInfo);
        }
        else
        {
            variant.ShippingInfo.ApplyVariantShipping(
                variantRequest.PhysicalProduct ?? product.ShippingInfo?.Physical ?? request.PhysicalProduct,
                variantRequest.Weight ?? variant.ShippingInfo.Weight,
                variantRequest.Width ?? variant.ShippingInfo.Width,
                variantRequest.Height ?? variant.ShippingInfo.Height,
                variantRequest.Length ?? variant.ShippingInfo.Length);
        }
    }

    private static Dictionary<string, string?> BuildImageKeyByFirstOptionValue(
        Product product,
        UpdateProductRequest request,
        IReadOnlyDictionary<string, Variant> existingById)
    {
        var firstOptionName = GetFirstOptionName(product);
        if (firstOptionName is null)
            return [];

        var explicitImageKeyByValue = new Dictionary<string, string?>(StringComparer.OrdinalIgnoreCase);
        foreach (var variantRequest in request.Variants)
        {
            var variantId = NormalizeId(variantRequest.Id);
            if (variantId is null || variantRequest.ImageKey is null || !existingById.TryGetValue(variantId, out var variant))
                continue;

            var firstOptionValue = GetOptionValue(variant, firstOptionName);
            if (firstOptionValue is null || explicitImageKeyByValue.ContainsKey(firstOptionValue))
                continue;

            explicitImageKeyByValue[firstOptionValue] = string.IsNullOrWhiteSpace(variantRequest.ImageKey)
                ? null
                : NormalizeMediaKey(variantRequest.ImageKey);
        }

        var imageKeyByValue = new Dictionary<string, string?>(StringComparer.OrdinalIgnoreCase);
        foreach (var group in product.Variants
                     .Select(x => new { Variant = x, FirstOptionValue = GetOptionValue(x, firstOptionName) })
                     .Where(x => x.FirstOptionValue is not null)
                     .GroupBy(x => x.FirstOptionValue!, StringComparer.OrdinalIgnoreCase))
        {
            imageKeyByValue[group.Key] = explicitImageKeyByValue.TryGetValue(group.Key, out var explicitImageKey)
                ? explicitImageKey
                : group.Select(x => x.Variant.ImageKey).FirstOrDefault(x => !string.IsNullOrWhiteSpace(x));
        }

        return imageKeyByValue;
    }

    private static bool TryGetSharedImageKey(
        Variant variant,
        Product product,
        IReadOnlyDictionary<string, string?> imageKeyByFirstOptionValue,
        out string? imageKey)
    {
        imageKey = null;
        var firstOptionName = GetFirstOptionName(product);
        var firstOptionValue = firstOptionName is null ? null : GetOptionValue(variant, firstOptionName);
        return firstOptionValue is not null
            && imageKeyByFirstOptionValue.TryGetValue(firstOptionValue, out imageKey);
    }

    private static string? GetFirstOptionName(Product product)
        => product.Options
            .OrderBy(x => x.DisplayOrder)
            .ThenBy(x => x.Name, StringComparer.OrdinalIgnoreCase)
            .Select(x => x.Name.Trim())
            .FirstOrDefault(x => !string.IsNullOrWhiteSpace(x));

    private static string? GetOptionValue(Variant variant, string optionName)
        => variant.OptionValues
            .FirstOrDefault(x => string.Equals(x.OptionName.Trim(), optionName, StringComparison.OrdinalIgnoreCase))
            ?.Value
            .Trim();

    private static List<ProductMedia> BuildMedias(UpdateProductRequest request)
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

    private static string NormalizeMediaKey(string value)
    {
        var trimmed = value.Trim();
        if (Uri.TryCreate(trimmed, UriKind.Absolute, out var uri))
            return uri.AbsolutePath.TrimStart('/');
        return trimmed.TrimStart('/');
    }

    private static void ValidateMedias(UpdateProductRequest request, Dictionary<string, string[]> errors)
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

    private static string ResolveVariantId(string? requestedId, string productId, CreateVariantRequest request)
        => NormalizeId(requestedId) ?? GenerateVariantId(productId, VariantKey(request));

    private static string GenerateVariantId(string productId, string key)
        => $"{productId}-{NormalizeId(key) ?? Guid.NewGuid().ToString("N")[..8]}";

    private static string VariantKey(CreateVariantRequest request)
        => request.OptionValues.Count == 0
            ? "variant"
            : string.Join("-", request.OptionValues
                .OrderBy(x => x.OptionName, StringComparer.OrdinalIgnoreCase)
                .Select(x => $"{x.OptionName.Trim().First()}-{x.Value.Trim()}"));

    private static string VariantKey(Variant variant)
        => variant.OptionValues.Count == 0
            ? "variant"
            : string.Join("-", variant.OptionValues
                .OrderBy(x => x.OptionName, StringComparer.OrdinalIgnoreCase)
                .Select(x => $"{x.OptionName.Trim().First()}-{x.Value.Trim()}"));

    private static bool MatchesExistingOptionValues(CreateVariantRequest request, Variant variant)
    {
        var requestValues = request.OptionValues
            .Select(x => $"{x.OptionName.Trim()}:{x.Value.Trim()}")
            .OrderBy(x => x, StringComparer.OrdinalIgnoreCase);
        var existingValues = variant.OptionValues
            .Select(x => $"{x.OptionName}:{x.Value}")
            .OrderBy(x => x, StringComparer.OrdinalIgnoreCase);
        return requestValues.SequenceEqual(existingValues, StringComparer.OrdinalIgnoreCase);
    }

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
