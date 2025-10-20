using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProductCatalog.Core.DatabaseContext;
using ProductCatalog.Core.DTOs.Collections;
using ProductCatalog.Core.Entities;
using SharedKernel.Extensions;
using CollectionEntity = ProductCatalog.Core.Entities.Collection;

namespace ProductCatalog.Api;

[ApiController]
[Route($"api/{ModuleConstants.Key}/collections")]
public class CollectionController(ProductCatalogDbContext db) : ControllerBase
{
    private readonly ProductCatalogDbContext _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAllCollections(CancellationToken cancellationToken)
    {
        var collections = await _db.Collections.AsNoTracking().ToListAsync(cancellationToken);
        return Ok(collections.Select(MapToResponse));
    }

    [HttpGet("{title}")]
    public async Task<IActionResult> GetCollection(string title, CancellationToken cancellationToken)
    {
        var c = await _db.Collections.FirstOrDefaultAsync(x => x.Title == title, cancellationToken);
        if (c == null) return NotFound();
        return Ok(MapToResponse(c));
    }

    [HttpPost]
    public async Task<IActionResult> CreateCollection(CreateCollectionRequest request, CancellationToken cancellationToken)
    {
        var exists = await _db.Collections.AnyAsync(x => x.Title == request.Title, cancellationToken);
        if (exists) return Conflict("Collection already exists.");

        var entity = new CollectionEntity
        {
            Title = request.Title,
            Description = request.Description,
            Slug = string.IsNullOrWhiteSpace(request.Slug) ? request.Title.ToSlug() : request.Slug,
            Image = request.Image
        };

        _db.Collections.Add(entity);
        await _db.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(GetCollection), new { title = entity.Title }, MapToResponse(entity));
    }

    [HttpPut("{title}")]
    public async Task<IActionResult> UpdateCollection(string title, UpdateCollectionRequest request, CancellationToken cancellationToken)
    {
        var c = await _db.Collections.FirstOrDefaultAsync(x => x.Title == title, cancellationToken);
        if (c == null) return NotFound();

        c.Description = request.Description;
        c.Slug = request.Slug;
        c.Image = request.Image;

        await _db.SaveChangesAsync(cancellationToken);
        return Ok(MapToResponse(c));
    }

    [HttpDelete("{title}")]
    public async Task<IActionResult> DeleteCollection(string title, CancellationToken cancellationToken)
    {
        var c = await _db.Collections.FirstOrDefaultAsync(x => x.Title == title, cancellationToken);
        if (c == null) return NotFound();

        _db.Collections.Remove(c);
        await _db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpPost("{title}/products/{productId:int}")]
    public async Task<IActionResult> AddProductToCollection(string title, int productId, CancellationToken cancellationToken)
    {
        var collectionExists = await _db.Collections.AnyAsync(x => x.Title == title, cancellationToken);
        if (!collectionExists) return NotFound("Collection not found.");

        var productExists = await _db.Products.AnyAsync(x => x.Id == productId, cancellationToken);
        if (!productExists) return NotFound("Product not found.");

        var cpExists = await _db.CollectionProducts.AnyAsync(x => x.CollectionTitle == title && x.ProductId == productId, cancellationToken);
        if (cpExists) return Ok(); // Already added

        _db.CollectionProducts.Add(new CollectionProduct { CollectionTitle = title, ProductId = productId });
        await _db.SaveChangesAsync(cancellationToken);
        return Ok();
    }

    [HttpDelete("{title}/products/{productId:int}")]
    public async Task<IActionResult> RemoveProductFromCollection(string title, int productId, CancellationToken cancellationToken)
    {
        var cp = await _db.CollectionProducts.FirstOrDefaultAsync(x => x.CollectionTitle == title && x.ProductId == productId, cancellationToken);
        if (cp == null) return NotFound();

        _db.CollectionProducts.Remove(cp);
        await _db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    private static CollectionResponse MapToResponse(CollectionEntity c)
    {
        return new CollectionResponse
        {
            Title = c.Title,
            Description = c.Description,
            Slug = c.Slug,
            Image = c.Image
        };
    }
}
