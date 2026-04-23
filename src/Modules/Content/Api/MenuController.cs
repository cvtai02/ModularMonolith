using Content.Core.DTOs.Menus;
using Content.Core.Usecases.Menus;
using Microsoft.AspNetCore.Mvc;

namespace Content.Api;

[ApiController]
[Route($"api/{ModuleConstants.Key}/Menu")]
public class MenuController(
    GetAllMenus getAll,
    GetMenuByName getByName,
    CreateMenu createMenu,
    UpdateMenu updateMenu,
    DeleteMenu deleteMenu) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        => Ok(await getAll.ExecuteAsync(cancellationToken));

    [HttpGet("{name}")]
    public async Task<IActionResult> GetByName(string name, CancellationToken cancellationToken)
    {
        var result = await getByName.ExecuteAsync(name, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateMenuRequest request, CancellationToken cancellationToken)
    {
        var result = await createMenu.ExecuteAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetByName), new { name = result.Name }, result);
    }

    [HttpPut("{name}")]
    public async Task<IActionResult> Update(string name, [FromBody] UpdateMenuRequest request, CancellationToken cancellationToken)
    {
        var result = await updateMenu.ExecuteAsync(name, request, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpDelete("{name}")]
    public async Task<IActionResult> Delete(string name, CancellationToken cancellationToken)
    {
        var result = await deleteMenu.ExecuteAsync(name, cancellationToken);
        return result ? NoContent() : NotFound();
    }
}
