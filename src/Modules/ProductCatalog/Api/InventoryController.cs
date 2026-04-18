using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProductCatalog.Core.DTOs.Inventory;
using ProductCatalog.Core.Entities;
using SharedKernel.Exceptions;

namespace ProductCatalog.Api;

[ApiController]
[Route($"api/{ModuleConstants.Key}/inventory")]
public class InventoryController(ProductCatalogDbContext db) : ControllerBase
{
    private readonly ProductCatalogDbContext _db = db;

    [HttpGet("products")]
    public async Task<ActionResult<List<ProductInventoryResponse>>> GetAllProducts(CancellationToken cancellationToken)
    {
        var products = await _db.Products
            .AsNoTracking()
            .Include(x => x.Inventory)
            .OrderBy(x => x.Name)
            .ToListAsync(cancellationToken);

        return Ok(products.Select(MapToResponse));
    }

    [HttpGet("products/{productId:int}")]
    public async Task<ActionResult<ProductInventoryResponse>> GetProductInventory(int productId, CancellationToken cancellationToken)
    {
        var product = await _db.Products
            .AsNoTracking()
            .Include(x => x.Inventory)
            .FirstOrDefaultAsync(x => x.Id == productId, cancellationToken);

        if (product is null)
        {
            return NotFound();
        }

        return Ok(MapToResponse(product));
    }

    [HttpPut("products/{productId:int}")]
    public async Task<ActionResult<ProductInventoryResponse>> UpdateProductInventory(
        int productId,
        [FromBody] UpdateProductInventoryRequest request,
        CancellationToken cancellationToken)
    {
        var product = await _db.Products
            .Include(x => x.Inventory)
            .FirstOrDefaultAsync(x => x.Id == productId, cancellationToken);

        if (product is null)
        {
            return NotFound();
        }

        if (request.Reserved > request.Stock && !request.AllowBackorder)
        {
            throw new ValidationException(
                "Validation failed",
                new Dictionary<string, string[]>
                {
                    [nameof(request.Reserved)] = ["Reserved stock cannot exceed available stock unless backorders are allowed."]
                });
        }

        product.Inventory.Sku = request.Sku.Trim();
        product.Inventory.Barcode = request.Barcode.Trim();
        product.Inventory.Stock = request.Stock;
        product.Inventory.Sold = request.Sold;
        product.Inventory.TrackInventory = request.TrackInventory;
        product.Inventory.LowStockThreshold = request.LowStockThreshold;
        product.Inventory.AllowBackorder = request.AllowBackorder;
        product.Inventory.Reserved = request.Reserved;

        await _db.SaveChangesAsync(cancellationToken);
        return Ok(MapToResponse(product));
    }

    [HttpPost("products/{productId:int}/adjust")]
    public async Task<ActionResult<ProductInventoryResponse>> AdjustProductInventory(
        int productId,
        [FromBody] AdjustProductInventoryRequest request,
        CancellationToken cancellationToken)
    {
        var product = await _db.Products
            .Include(x => x.Inventory)
            .FirstOrDefaultAsync(x => x.Id == productId, cancellationToken);

        if (product is null)
        {
            return NotFound();
        }

        if (request.StockChange == 0 && request.SoldChange == 0 && request.ReservedChange == 0)
        {
            throw new ValidationException(
                "Validation failed",
                new Dictionary<string, string[]>
                {
                    [nameof(request.StockChange)] = ["At least one inventory adjustment must be provided."]
                });
        }

        var nextStock = product.Inventory.Stock + request.StockChange;
        var nextSold = product.Inventory.Sold + request.SoldChange;
        var nextReserved = product.Inventory.Reserved + request.ReservedChange;

        var errors = new Dictionary<string, string[]>();
        if (nextStock < 0)
        {
            errors[nameof(request.StockChange)] = ["Resulting stock cannot be negative."];
        }

        if (nextSold < 0)
        {
            errors[nameof(request.SoldChange)] = ["Resulting sold quantity cannot be negative."];
        }

        if (nextReserved < 0)
        {
            errors[nameof(request.ReservedChange)] = ["Resulting reserved quantity cannot be negative."];
        }

        if (errors.Count > 0)
        {
            throw new ValidationException("Validation failed", errors);
        }

        if (nextReserved > nextStock && !product.Inventory.AllowBackorder)
        {
            throw new ValidationException(
                "Validation failed",
                new Dictionary<string, string[]>
                {
                    [nameof(request.ReservedChange)] = ["Reserved stock cannot exceed available stock unless backorders are allowed."]
                });
        }

        product.Inventory.Stock = nextStock;
        product.Inventory.Sold = nextSold;
        product.Inventory.Reserved = nextReserved;

        await _db.SaveChangesAsync(cancellationToken);
        return Ok(MapToResponse(product));
    }

    private static ProductInventoryResponse MapToResponse(Product product)
    {
        var inventory = product.Inventory;
        return new ProductInventoryResponse
        {
            ProductId = product.Id,
            ProductName = product.Name,
            Sku = inventory.Sku,
            Barcode = inventory.Barcode,
            Stock = inventory.Stock,
            Sold = inventory.Sold,
            TrackInventory = inventory.TrackInventory,
            LowStockThreshold = inventory.LowStockThreshold,
            AllowBackorder = inventory.AllowBackorder,
            Reserved = inventory.Reserved,
            AvailableStock = inventory.Stock - inventory.Reserved
        };
    }
}
