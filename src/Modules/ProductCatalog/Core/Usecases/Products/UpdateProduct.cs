using Microsoft.EntityFrameworkCore;
using ProductCatalog.Core.DTOs.Products;
using ProductCatalog.Core.Entities;
using SharedKernel.Abstractions.Services;
using SharedKernel.Exceptions;
using SharedKernel.Extensions;

namespace ProductCatalog.Core.Usecases.Products;

public class UpdateProduct(ProductCatalogDbContext db, IFileManager fileManager)
{
    public async Task<ProductResponse?> ExecuteAsync(int id, CreateProductRequest request, CancellationToken ct)
    {
        var product = await db.Products.FirstOrDefaultAsync(x => x.Id == id, ct);
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
        product.ImageUrl = request.ImageUrl.Trim();
        product.Price = request.Price;
        product.Currency = request.Currency;
        product.CompareAtPrice = request.CompareAtPrice;
        product.CostPrice = request.CostPrice;
        product.ChargeTax = request.ChargeTax;
        product.TrackInventory = request.TrackInventory;
        product.AllowBackorder = request.AllowBackorder;
        product.Status = request.Status;

        await using var transaction = await db.Database.BeginTransactionAsync(ct);

        var variantIds = await db.Variants.Where(v => v.ProductId == id).Select(v => v.Id).ToListAsync(ct);
        var optionIds = await db.Options.Where(o => o.ProductId == id).Select(o => o.Id).ToListAsync(ct);

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
            return new VariantShipping
            {
                VariantId = variant.Id,
                UseProductShipping = useProductShipping,
                Physical = useProductShipping ? request.PhysicalProduct : (variantInput?.PhysicalProduct ?? request.PhysicalProduct),
                Weight = useProductShipping ? request.Weight : (variantInput?.Weight ?? request.Weight),
                Width = useProductShipping ? request.Width : (variantInput?.Width ?? request.Width),
                Height = useProductShipping ? request.Height : (variantInput?.Height ?? request.Height),
                Length = useProductShipping ? request.Length : (variantInput?.Length ?? request.Length),
            };
        }).ToList();

        if (shippingInfos.Count > 0)
            db.VariantShippings.AddRange(shippingInfos);

        await db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        var updated = await db.Products
            .AsNoTracking()
            .Include(x => x.Category)
            .Include(x => x.Medias)
            .Include(x => x.Options).ThenInclude(x => x.OptionValues)
            .Include(x => x.Variants).ThenInclude(x => x.OptionValues)
            .Include(x => x.Variants).ThenInclude(x => x.ShippingInfo)
            .Include(x => x.Metric)
            .FirstAsync(x => x.Id == id, ct);

        return ProductMapper.ToResponse(updated, fileManager);
    }

    private async Task ValidateRequest(CreateProductRequest request, int productId, string slug, CancellationToken ct)
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

    private static List<Option> BuildOptions(CreateProductRequest request, int productId) =>
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
                    ImageKey = string.IsNullOrWhiteSpace(product.ImageUrl) ? null : NormalizeMediaKey(product.ImageUrl),
                    UseProductPricing = true,
                    TrackInventory = request.TrackInventory,
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
            ImageKey = string.IsNullOrWhiteSpace(variant.ImageKey) ? NormalizeMediaKey(product.ImageUrl) : NormalizeMediaKey(variant.ImageKey),
            UseProductPricing = variant.UseProductPricing,
            TrackInventory = variant.TrackInventory ?? request.TrackInventory,
            AllowBackorder = variant.AllowBackorder ?? request.AllowBackorder,
            Price = variant.UseProductPricing ? request.Price : (variant.Price ?? request.Price),
            CompareAtPrice = variant.UseProductPricing ? request.CompareAtPrice : (variant.CompareAtPrice ?? request.CompareAtPrice),
            CostPrice = variant.UseProductPricing ? request.CostPrice : (variant.CostPrice ?? request.CostPrice),
            ChargeTax = variant.UseProductPricing ? request.ChargeTax : (variant.ChargeTax ?? request.ChargeTax),
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
