using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using ProductCatalog.Core.DTOs.Categories;
using ProductCatalog.Core.Usecases.Categories;
using SharedKernel.DTOs;

namespace ProductCatalog.Api;

[ApiController]
[Route($"api/{ModuleConstants.Key}/categories")]
public class CategoryController(
    ListCategories listCategories,
    GetCategoryByName getCategoryByName,
    CreateCategory createCategory,
    UpdateCategory updateCategory,
    DeleteCategory deleteCategory) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PaginatedList<CategoryResponse>>> GetAll(
        [Range(1, int.MaxValue)]
        [FromQuery] int pageNumber = 1,
        [Range(1, 200)]
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        CancellationToken cancellationToken = default)
        => Ok(await listCategories.ExecuteAsync(pageNumber, pageSize, search, cancellationToken));

    [HttpGet("{name}")]
    public async Task<ActionResult<CategoryResponse>> GetByName(string name, CancellationToken cancellationToken)
    {
        var result = await getCategoryByName.ExecuteAsync(name, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<CategoryResponse>> Create(
        [FromBody] CreateCategoryRequest request, CancellationToken cancellationToken)
    {
        var result = await createCategory.ExecuteAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetByName), new { name = result.Name }, result);
    }

    [HttpPut("{name}")]
    public async Task<ActionResult<CategoryResponse>> Update(
        string name, [FromBody] UpdateCategoryRequest request, CancellationToken cancellationToken)
    {
        var result = await updateCategory.ExecuteAsync(name, request, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpDelete("{name}")]
    public async Task<IActionResult> Delete(string name, CancellationToken cancellationToken)
    {
        var result = await deleteCategory.ExecuteAsync(name, cancellationToken);
        return result ? NoContent() : NotFound();
    }
}
