using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProductCatalog.Core.DTOs.Categories;
using SharedKernel.Extensions;
using ProductCatalog.Core.Entities;

namespace ProductCatalog.Api;

[ApiController]
[Route($"api/{ModuleConstants.Key}/categories")]
public class CategoryController(ProductCatalogDbContext db) : ControllerBase
{
    private readonly ProductCatalogDbContext _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAllCategories(CancellationToken cancellationToken)
    {
        var categories = await _db.Categories.AsNoTracking().ToListAsync(cancellationToken);
        return Ok(categories.Select(MapToResponse));
    }

    [HttpGet("{name}")]
    public async Task<IActionResult> GetCategory(string name, CancellationToken cancellationToken)
    {
        var c = await _db.Categories.FirstOrDefaultAsync(x => x.Name == name, cancellationToken);
        
        if (c == null) return NotFound();

        return Ok(MapToResponse(c));
    }

    [HttpPost("add")]
    public async Task<IActionResult> AddCategory(CreateCategoryRequest request, CancellationToken cancellationToken)
    {
        var exists = await _db.Categories.AnyAsync(x => x.Name == request.Name, cancellationToken);
        if (exists) return Conflict("Category already exists.");

        var entity = new Category
        {
            Name = request.Name,
            Description = request.Description,
            Slug = request.Slug ?? request.Name.ToSlug(),
            Status = request.Status,
            ImageUrl = request.ImageUrl,
            ParentName = request.ParentName
        };

        _db.Categories.Add(entity);
        await _db.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(GetCategory), new { name = entity.Name }, MapToResponse(entity));
    }

    [HttpPut("{name}")]
    public async Task<IActionResult> UpdateCategory(string name, UpdateCategoryRequest request, CancellationToken cancellationToken)
    {
        var c = await _db.Categories.FirstOrDefaultAsync(x => x.Name == name, cancellationToken);
        if (c == null) return NotFound();

        c.Description = request.Description;
        c.ImageUrl = request.ImageUrl;
        c.Status = request.Status;
        c.ParentName = request.ParentName;
        c.Slug = request.Slug;

        await _db.SaveChangesAsync(cancellationToken);

        return Ok(MapToResponse(c));
    }

    [HttpDelete("{name}")]
    public async Task<IActionResult> DeleteCategory(string name, CancellationToken cancellationToken)
    {
        var c = await _db.Categories.FirstOrDefaultAsync(x => x.Name == name, cancellationToken);
        if (c == null) return NotFound();

        _db.Categories.Remove(c);
        await _db.SaveChangesAsync(cancellationToken);

        return NoContent();
    }

    private static CategoryResponse MapToResponse(Category c)
    {
        return new CategoryResponse
        {
            Name = c.Name,
            Description = c.Description,
            Slug = c.Slug,
            Status = c.Status,
            ImageUrl = c.ImageUrl,
            ParentName = c.ParentName
        };
    }
}
