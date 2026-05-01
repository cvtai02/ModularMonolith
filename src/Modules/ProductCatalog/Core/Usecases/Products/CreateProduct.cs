using Microsoft.EntityFrameworkCore;
using Inventory;
using Inventory.Core.Entities;
using ProductCatalog.DTOs.Products;
using ProductCatalog.Core.Entities;
using SharedKernel.Abstractions.Services;
using SharedKernel.Exceptions;
using SharedKernel.Extensions;

namespace ProductCatalog.Core.Usecases.Products;

public class CreateProduct(ProductCatalogDbContext db, InventoryDbContext inventoryDb, IFileManager fileManager)
{
    public async Task<ProductResponse> ExecuteAsync(CreateProductRequest request, CancellationToken ct)
    {
        var name = request.Name.Trim();
        var slug = name.ToSlug();

        await ValidateRequest(request, name, slug, ct);

        var category = await db.Categories.FirstAsync(x => x.Id == request.CategoryId, ct);
        var medias = BuildMedias(request);

        var product = new Product
        {
            Name = name,
            Description = request.Description.Trim(),
            CategoryId = category.Id,
            Slug = slug,
            ImageUrl = medias.OrderBy(x => x.DisplayOrder).Select(x => fileManager.BuildPublicUrl(x.Key)).FirstOrDefault()
                ?? request.ImageUrl.Trim(),
            Status = request.Status,
            Category = category,
            ShippingInfo = BuildProductShipping(request),
            Medias = medias,
            Options = BuildOptions(request),
            Metric = new ProductMetric(),
        };
        product.ApplyPricing(request.Price, request.Currency, request.CompareAtPrice, request.CostPrice, request.ChargeTax);
        product.SetInventoryPolicy(request.TrackInventory, request.AllowBackorder);

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

        await InitializeInventory(product.Id, request, variants, ct);

        var created = await db.Products
            .AsNoTracking()
            .Include(x => x.Category)
            .Include(x => x.ShippingInfo)
            .Include(x => x.Medias)
            .Include(x => x.Options).ThenInclude(x => x.OptionValues)
            .Include(x => x.Variants).ThenInclude(x => x.OptionValues)
            .Include(x => x.Variants).ThenInclude(x => x.ShippingInfo)
            .Include(x => x.Metric)
            .FirstAsync(x => x.Id == product.Id, ct);

        var productInventory = await inventoryDb.ProductInventories
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.ProductId == product.Id, ct);
        var variantInventory = await GetVariantInventoryLookup(created.Variants.Select(x => x.Id), ct);

        return ProductMapper.ToResponse(created, fileManager, productInventory, variantInventory);
    }

    private async Task ValidateRequest(
        CreateProductRequest request, string name, string slug, CancellationToken ct)
    {
        var errors = new Dictionary<string, string[]>();

        if (!await db.Categories.AnyAsync(x => x.Id == request.CategoryId, ct))
            errors[nameof(request.CategoryId)] = ["Category does not exist."];

        if (await db.Products.AnyAsync(x => x.Slug == slug, ct))
            errors["slug"] = [$"A product with a similar name already exists. Try a different name."];

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
        var mediaKeys = request.MediaKeys
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select((key, index) => new ProductMedia { Key = NormalizeMediaKey(key), DisplayOrder = index });

        var medias = mediaKeys.Concat(request.Medias
            .Where(x => !string.IsNullOrWhiteSpace(x.Url))
            .Select(x => new ProductMedia { Key = NormalizeMediaKey(x.Url), DisplayOrder = x.DisplayOrder }))
            .OrderBy(x => x.DisplayOrder)
            .ToList();

        if (medias.Count == 0 && !string.IsNullOrWhiteSpace(request.ImageUrl))
            medias.Add(new ProductMedia { Key = NormalizeMediaKey(request.ImageUrl), DisplayOrder = 0 });

        return medias;
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
        IReadOnlyDictionary<string, Option> optionLookup)
    {
        if (request.Variants.Count == 0)
        {
            var variant = new Variant
            {
                ProductId = product.Id,
                ImageKey = string.IsNullOrWhiteSpace(request.ImageUrl) ? null : NormalizeMediaKey(request.ImageUrl)
            };
            variant.ApplyProductPricing(product);
            variant.SetInventoryPolicy(request.TrackInventory, request.AllowBackorder);
            return
            [
                variant
            ];
        }

        return request.Variants.Select(variantRequest =>
        {
            var variant = new Variant
            {
                ProductId = product.Id,
                ImageKey = string.IsNullOrWhiteSpace(variantRequest.ImageKey)
                    ? NormalizeMediaKey(product.ImageUrl)
                    : NormalizeMediaKey(variantRequest.ImageKey),
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

    private async Task InitializeInventory(
        int productId,
        CreateProductRequest request,
        IReadOnlyCollection<Variant> variants,
        CancellationToken ct)
    {
        var productInventory = new ProductInventory { ProductId = productId };
        productInventory.SetInventoryPolicy(request.TrackInventory, request.AllowBackorder, request.LowStockThreshold);
        inventoryDb.ProductInventories.Add(productInventory);

        foreach (var variant in variants)
        {
            var variantInput = request.Variants.FirstOrDefault(x => MatchesVariant(x, variant));
            var useProductInventory = variantInput?.UseProductInventory ?? true;
            var quantity = variantInput?.Quantity ?? request.Stock;

            var variantInventory = new VariantInventory
            {
                VariantId = variant.Id,
                Tracking = new VariantTracking
                {
                    VariantId = variant.Id,
                    OnHand = quantity,
                    Reserved = 0
                }
            };
            if (useProductInventory)
                variantInventory.ApplyProductInventory(productInventory);
            else
                variantInventory.ApplyVariantInventory(
                    variantInput?.TrackInventory ?? request.TrackInventory,
                    variantInput?.AllowBackorder ?? request.AllowBackorder,
                    variantInput?.LowStockThreshold ?? request.LowStockThreshold);

            inventoryDb.VariantInventories.Add(variantInventory);
        }

        await inventoryDb.SaveChangesAsync(ct);
    }

    private async Task<Dictionary<int, VariantInventory>> GetVariantInventoryLookup(
        IEnumerable<int> variantIds,
        CancellationToken ct)
    {
        var ids = variantIds.ToList();
        return await inventoryDb.VariantInventories
            .AsNoTracking()
            .Include(x => x.Tracking)
            .Where(x => ids.Contains(x.VariantId))
            .ToDictionaryAsync(x => x.VariantId, ct);
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
