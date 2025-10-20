using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProductCatalog.Core.DatabaseContext;
using ProductCatalog.Core.DTOs.Products;
using ProductCatalog.Core.Entities;
using SharedKernel.DTOs;
using SharedKernel.Extensions;

namespace ProductCatalog.Api;

[ApiController]
[Route($"api/{ModuleConstants.Key}/products")]
public class ProductsController(ProductCatalogDbContext db) : ControllerBase
{
    private readonly ProductCatalogDbContext _db = db;

    [HttpGet]
    public async Task<ActionResult<PaginatedList<ProductResponse>>> GetProducts([FromQuery] ListProductsRequest request, CancellationToken cancellationToken)
    {
        var query = _db.Products
            .AsNoTracking()
            .Include(x => x.Metric)
            .Include(x => x.Inventory)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLower();
            query = query.Where(x =>
                x.Name.ToLower().Contains(search)
                || x.Slug.ToLower().Contains(search)
                || x.CategoryName.ToLower().Contains(search));
        }

        if (!string.IsNullOrWhiteSpace(request.CategoryName))
        {
            query = query.Where(x => x.CategoryName == request.CategoryName);
        }

        if (request.Status.HasValue)
        {
            query = query.Where(x => x.Status == request.Status.Value);
        }

        query = request.SortBy?.ToLower() switch
        {
            "name" => request.SortDirection?.ToLower() == "desc" ? query.OrderByDescending(x => x.Name) : query.OrderBy(x => x.Name),
            "price" => request.SortDirection?.ToLower() == "desc" ? query.OrderByDescending(x => x.Metric.Price) : query.OrderBy(x => x.Metric.Price),
            _ => request.SortDirection?.ToLower() == "asc" ? query.OrderBy(x => x.Id) : query.OrderByDescending(x => x.Id)
        };

        var paged = await query.ToPaginatedListAsync(request.PageNumber, request.PageSize, cancellationToken);
        return Ok(new PaginatedList<ProductResponse>(
            paged.Items.Select(MapToResponse).ToList(),
            paged.TotalCount,
            paged.PageNumber,
            request.PageSize));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProductResponse>> GetProductById(int id, CancellationToken cancellationToken)
    {
        var product = await _db.Products
            .AsNoTracking()
            .Include(x => x.Metric)
            .Include(x => x.Inventory)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (product is null)
        {
            return NotFound();
        }

        return Ok(MapToResponse(product));
    }

    [HttpPost]
    public async Task<ActionResult<ProductResponse>> CreateProduct([FromBody] CreateProductRequest request, CancellationToken cancellationToken)
    {
        ValidateRequest(request);
        await EnsureCategoryExists(request.CategoryName, cancellationToken);

        var product = new Product
        {
            Name = request.Name.Trim(),
            Description = request.Description.Trim(),
            CategoryName = request.CategoryName.Trim(),
            Slug = request.Slug.Trim(),
            ImageUrl = request.ImageUrl.Trim(),
            Status = request.Status,
            Metric = new ProductMetric
            {
                Price = request.Price,
                CompareAtPrice = request.CompareAtPrice,
                CostPrice = request.CostPrice,
                ChargeTax = request.ChargeTax,
                Stock = request.Stock,
                Sold = 0,
                RatingAvg = 0,
                RatingCount = 0,
                ViewCount = 0
            },
            Inventory = new ProductInventory
            {
                Sku = request.Sku.Trim(),
                Barcode = request.Barcode.Trim(),
                Stock = request.Stock,
                Sold = 0,
                TrackInventory = request.TrackInventory,
                LowStockThreshold = request.LowStockThreshold,
                AllowBackorder = request.AllowBackorder,
                Reserved = 0
            }
        };

        _db.Products.Add(product);
        await _db.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(GetProductById), new { id = product.Id }, MapToResponse(product));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ProductResponse>> UpdateProduct(int id, [FromBody] UpdateProductRequest request, CancellationToken cancellationToken)
    {
        ValidateRequest(request);
        await EnsureCategoryExists(request.CategoryName, cancellationToken);

        var product = await _db.Products
            .Include(x => x.Metric)
            .Include(x => x.Inventory)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (product is null)
        {
            return NotFound();
        }

        product.Name = request.Name.Trim();
        product.Description = request.Description.Trim();
        product.CategoryName = request.CategoryName.Trim();
        product.Slug = request.Slug.Trim();
        product.ImageUrl = request.ImageUrl.Trim();
        product.Status = request.Status;

        product.Metric.Price = request.Price;
        product.Metric.CompareAtPrice = request.CompareAtPrice;
        product.Metric.CostPrice = request.CostPrice;
        product.Metric.ChargeTax = request.ChargeTax;
        product.Metric.Stock = request.Stock;

        product.Inventory.Sku = request.Sku.Trim();
        product.Inventory.Barcode = request.Barcode.Trim();
        product.Inventory.Stock = request.Stock;
        product.Inventory.TrackInventory = request.TrackInventory;
        product.Inventory.LowStockThreshold = request.LowStockThreshold;
        product.Inventory.AllowBackorder = request.AllowBackorder;

        await _db.SaveChangesAsync(cancellationToken);
        return Ok(MapToResponse(product));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteProduct(int id, CancellationToken cancellationToken)
    {
        var product = await _db.Products.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (product is null)
        {
            return NotFound();
        }

        _db.Products.Remove(product);
        await _db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpGet("{id:int}/options")]
    public async Task<ActionResult<List<OptionResponse>>> GetOptions(int id, CancellationToken cancellationToken)
    {
        var options = await _db.Options
            .Include(x => x.OptionValues)
            .Where(x => x.ProductId == id)
            .ToListAsync(cancellationToken);

        return Ok(options.Select(o => new OptionResponse
        {
            Id = o.Id,
            Name = o.Name,
            DisplayOrder = o.DisplayOrder,
            Values = o.OptionValues.Select(v => v.Value).ToList()
        }));
    }

    [HttpPost("{id:int}/options")]
    public async Task<ActionResult<OptionResponse>> AddOption(int id, [FromBody] CreateOptionRequest request, CancellationToken cancellationToken)
    {
        var productExists = await _db.Products.AnyAsync(x => x.Id == id, cancellationToken);
        if (!productExists) return NotFound("Product not found.");

        var option = new Option
        {
            ProductId = id,
            Name = request.Name,
            DisplayOrder = request.DisplayOrder,
            OptionValues = request.Values.Select(v => new OptionValue { Value = v }).ToList()
        };

        _db.Options.Add(option);
        await _db.SaveChangesAsync(cancellationToken);

        return Ok(new OptionResponse
        {
            Id = option.Id,
            Name = option.Name,
            DisplayOrder = option.DisplayOrder,
            Values = option.OptionValues.Select(v => v.Value).ToList()
        });
    }

    [HttpDelete("{id:int}/options/{optionId:int}")]
    public async Task<IActionResult> DeleteOption(int id, int optionId, CancellationToken cancellationToken)
    {
        var option = await _db.Options.FirstOrDefaultAsync(x => x.ProductId == id && x.Id == optionId, cancellationToken);
        if (option == null) return NotFound();

        _db.Options.Remove(option);
        await _db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpGet("{id:int}/variants")]
    public async Task<ActionResult<List<VariantResponse>>> GetVariants(int id, CancellationToken cancellationToken)
    {
        var variants = await _db.Variants
            .Include(x => x.OptionValues)
            .Where(x => x.ProductId == id)
            .ToListAsync(cancellationToken);

        return Ok(variants.Select(v => new VariantResponse
        {
            Id = v.Id,
            Price = v.Price,
            OptionValues = v.OptionValues.Select(ov => new VariantOptionValueDto { OptionId = ov.OptionId, OptionName = ov.OptionName, Value = ov.Value }).ToList()
        }));
    }

    [HttpPost("{id:int}/variants")]
    public async Task<ActionResult<VariantResponse>> AddVariant(int id, [FromBody] CreateVariantRequest request, CancellationToken cancellationToken)
    {
        var productExists = await _db.Products.AnyAsync(x => x.Id == id, cancellationToken);
        if (!productExists) return NotFound("Product not found.");

        var variant = new Variant
        {
            ProductId = id,
            Price = request.Price,
            OptionValues = request.OptionValues.Select(ov => new VariantOptionValue { OptionId = ov.OptionId, OptionName = ov.OptionName, Value = ov.Value }).ToList()
        };

        _db.Variants.Add(variant);
        await _db.SaveChangesAsync(cancellationToken);

        return Ok(new VariantResponse
        {
            Id = variant.Id,
            Price = variant.Price,
            OptionValues = variant.OptionValues.Select(ov => new VariantOptionValueDto { OptionId = ov.OptionId, OptionName = ov.OptionName, Value = ov.Value }).ToList()
        });
    }

    [HttpDelete("{id:int}/variants/{variantId:int}")]
    public async Task<IActionResult> DeleteVariant(int id, int variantId, CancellationToken cancellationToken)
    {
        var variant = await _db.Variants.FirstOrDefaultAsync(x => x.ProductId == id && x.Id == variantId, cancellationToken);
        if (variant == null) return NotFound();

        _db.Variants.Remove(variant);
        await _db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    private static ProductResponse MapToResponse(Product product)
    {
        return new ProductResponse
        {
            Id = product.Id,
            Name = product.Name,
            Description = product.Description,
            CategoryName = product.CategoryName,
            Slug = product.Slug,
            ImageUrl = product.ImageUrl,
            Status = product.Status,
            Price = product.Metric.Price,
            CompareAtPrice = product.Metric.CompareAtPrice,
            CostPrice = product.Metric.CostPrice,
            ChargeTax = product.Metric.ChargeTax,
            Stock = product.Inventory.Stock,
            Sku = product.Inventory.Sku,
            Barcode = product.Inventory.Barcode,
            TrackInventory = product.Inventory.TrackInventory,
            LowStockThreshold = product.Inventory.LowStockThreshold,
            AllowBackorder = product.Inventory.AllowBackorder,
            Sold = product.Inventory.Sold,
            Reserved = product.Inventory.Reserved
        };
    }

    private async Task EnsureCategoryExists(string categoryName, CancellationToken cancellationToken)
    {
        var trimmedName = categoryName.Trim();
        var exists = await _db.Categories.AnyAsync(x => x.Name == trimmedName, cancellationToken);
        if (!exists)
        {
            throw new SharedKernel.Exceptions.ValidationException(
                "Validation failed",
                new Dictionary<string, string[]>
                {
                    [nameof(categoryName)] = ["Category does not exist."]
                });
        }
    }

    private static void ValidateRequest(object request)
    {
        var context = new ValidationContext(request);
        var results = new List<ValidationResult>();
        if (Validator.TryValidateObject(request, context, results, true))
        {
            return;
        }

        var errors = results
            .SelectMany(x => x.MemberNames.DefaultIfEmpty(string.Empty).Select(member => new { member, error = x.ErrorMessage ?? "Invalid value." }))
            .GroupBy(x => x.member)
            .ToDictionary(x => x.Key, x => x.Select(v => v.error).ToArray());

        throw new SharedKernel.Exceptions.ValidationException("Validation failed", errors);
    }
}

