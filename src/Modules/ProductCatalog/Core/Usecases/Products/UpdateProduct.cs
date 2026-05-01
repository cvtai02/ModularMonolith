using Microsoft.EntityFrameworkCore;
using Inventory;
using Inventory.Core.Entities;
using ProductCatalog.DTOs.Products;
using ProductCatalog.Core.Entities;
using SharedKernel.Abstractions.Services;
using SharedKernel.Exceptions;
using SharedKernel.Extensions;

namespace ProductCatalog.Core.Usecases.Products;

public class UpdateProduct(ProductCatalogDbContext db, InventoryDbContext inventoryDb, IFileManager fileManager)
{
    public async Task<ProductResponse?> ExecuteAsync(int id, UpdateProductRequest request, CancellationToken ct)
    {
        var product = await db.Products
            .Include(x => x.ShippingInfo)
            .FirstOrDefaultAsync(x => x.Id == id, ct);
        if (product is null) return null;

        var name = request.Name.Trim();
        var slug = name.ToSlug();

        await ValidateRequest(request, id, slug, ct);

        var category = await db.Categories.FirstAsync(x => x.Id == request.CategoryId, ct);

        product.Name = name;
        product.Slug = slug;
        product.Description = request.Description.Trim();
        product.CategoryId = category.Id;
        product.Category = category;
        var medias = BuildMedias(request);
        product.ImageUrl = medias.OrderBy(x => x.DisplayOrder).Select(x => fileManager.BuildPublicUrl(x.Key)).FirstOrDefault()
            ?? request.ImageUrl.Trim();
        product.ApplyPricing(request.Price, request.Currency, request.CompareAtPrice, request.CostPrice, request.ChargeTax);
        product.SetInventoryPolicy(request.TrackInventory, request.AllowBackorder);
        product.Status = request.Status;
        if (product.ShippingInfo is null)
        {
            product.ShippingInfo = new ProductShipping { ProductId = product.Id };
            db.ProductShippings.Add(product.ShippingInfo);
        }

        product.ShippingInfo.ApplyShipping(request.PhysicalProduct, request.Weight, request.Width, request.Height, request.Length);

        await using var transaction = await db.Database.BeginTransactionAsync(ct);

        var variantIds = await db.Variants.Where(v => v.ProductId == id).Select(v => v.Id).ToListAsync(ct);
        var optionIds = await db.Options.Where(o => o.ProductId == id).Select(o => o.Id).ToListAsync(ct);

        await db.ProductMedias.Where(x => x.ProductId == id).ExecuteDeleteAsync(ct);

        if (variantIds.Count > 0)
        {
            await db.VariantShippings.Where(x => variantIds.Contains(x.VariantId)).ExecuteDeleteAsync(ct);
            await db.VariantOptionValues.Where(x => variantIds.Contains(x.VariantId)).ExecuteDeleteAsync(ct);
            await db.VariantMetrics.Where(x => variantIds.Contains(x.VariantId)).ExecuteDeleteAsync(ct);
            await db.Variants.Where(x => variantIds.Contains(x.Id)).ExecuteDeleteAsync(ct);
        }

        if (optionIds.Count > 0)
        {
            await db.OptionValues.Where(x => optionIds.Contains(x.OptionId)).ExecuteDeleteAsync(ct);
            await db.Options.Where(x => optionIds.Contains(x.Id)).ExecuteDeleteAsync(ct);
        }

        await db.SaveChangesAsync(ct);

        foreach (var media in medias)
            media.ProductId = product.Id;
        db.ProductMedias.AddRange(medias);

        var newOptions = BuildOptions(request, product.Id);
        db.Options.AddRange(newOptions);
        await db.SaveChangesAsync(ct);

        var optionLookup = await db.Options
            .Where(x => x.ProductId == product.Id)
            .ToDictionaryAsync(x => x.Name, x => x, StringComparer.OrdinalIgnoreCase, ct);

        var newVariants = BuildVariants(request, product, optionLookup);
        db.Variants.AddRange(newVariants);
        await db.SaveChangesAsync(ct);

        var shippingInfos = newVariants.Select(variant =>
        {
            var variantInput = request.Variants.FirstOrDefault(x => MatchesVariant(x, variant));
            var useProductShipping = variantInput?.UseProductShipping ?? true;
            var shipping = new VariantShipping { VariantId = variant.Id };
            if (useProductShipping)
                shipping.ApplyProductShipping(product.ShippingInfo);
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

        await ReplaceInventory(product.Id, request, variantIds, newVariants, ct);

        var updated = await db.Products
            .AsNoTracking()
            .Include(x => x.Category)
            .Include(x => x.ShippingInfo)
            .Include(x => x.Medias)
            .Include(x => x.Options).ThenInclude(x => x.OptionValues)
            .Include(x => x.Variants).ThenInclude(x => x.OptionValues)
            .Include(x => x.Variants).ThenInclude(x => x.ShippingInfo)
            .Include(x => x.Metric)
            .FirstAsync(x => x.Id == id, ct);

        var productInventory = await inventoryDb.ProductInventories
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.ProductId == id, ct);
        var variantInventory = await GetVariantInventoryLookup(updated.Variants.Select(x => x.Id), ct);

        return ProductMapper.ToResponse(updated, fileManager, productInventory, variantInventory);
    }

    private async Task ValidateRequest(UpdateProductRequest request, int productId, string slug, CancellationToken ct)
    {
        var errors = new Dictionary<string, string[]>();

        if (!await db.Categories.AnyAsync(x => x.Id == request.CategoryId, ct))
            errors[nameof(request.CategoryId)] = ["Category does not exist."];

        if (await db.Products.AnyAsync(x => x.Slug == slug && x.Id != productId, ct))
            errors["slug"] = ["A product with a similar name already exists. Try a different name."];

        if (request.Options.Count > 2)
            errors[nameof(request.Options)] = ["A product can have at most 2 options."];

        var optionNames = request.Options
            .Select(x => x.Name.Trim())
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .ToList();

        if (optionNames.Count != optionNames.Distinct(StringComparer.OrdinalIgnoreCase).Count())
            errors[nameof(request.Options)] = ["Option names must be unique."];

        if (request.Options.Count > 0 && request.Variants.Count == 0)
            errors[nameof(request.Variants)] = ["Variants are required when product options are provided."];

        if (request.Options.Count == 0 && request.Variants.Count > 1)
            errors[nameof(request.Variants)] = ["Products without options can only have one default variant."];

        if (request.CompareAtPrice > 0 && request.CompareAtPrice < request.Price)
            errors[nameof(request.CompareAtPrice)] = ["Compare-at price must be greater than or equal to price."];

        if (errors.Count > 0)
            throw new ValidationException("Validation failed", errors);
    }

    private static List<Option> BuildOptions(UpdateProductRequest request, int productId) =>
        request.Options.Select(option => new Option
        {
            ProductId = productId,
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
        UpdateProductRequest request,
        Product product,
        IReadOnlyDictionary<string, Option> optionLookup)
    {
        if (request.Variants.Count == 0)
        {
            var variant = new Variant
            {
                ProductId = product.Id,
                ImageKey = string.IsNullOrWhiteSpace(product.ImageUrl) ? null : NormalizeMediaKey(product.ImageUrl)
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

    private async Task ReplaceInventory(
        int productId,
        UpdateProductRequest request,
        IReadOnlyCollection<int> oldVariantIds,
        IReadOnlyCollection<Variant> newVariants,
        CancellationToken ct)
    {
        if (oldVariantIds.Count > 0)
        {
            await inventoryDb.VariantTrackings
                .Where(x => oldVariantIds.Contains(x.VariantId))
                .ExecuteDeleteAsync(ct);
            await inventoryDb.VariantInventories
                .Where(x => oldVariantIds.Contains(x.VariantId))
                .ExecuteDeleteAsync(ct);
        }

        var productInventory = await inventoryDb.ProductInventories
            .FirstOrDefaultAsync(x => x.ProductId == productId, ct);

        if (productInventory is null)
        {
            productInventory = new ProductInventory { ProductId = productId };
            inventoryDb.ProductInventories.Add(productInventory);
        }

        productInventory.SetInventoryPolicy(request.TrackInventory, request.AllowBackorder, request.LowStockThreshold);

        foreach (var variant in newVariants)
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

    private static List<ProductMedia> BuildMedias(UpdateProductRequest request)
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
}
