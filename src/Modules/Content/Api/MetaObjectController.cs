using Content.Core.DTOs.MetaObjects;
using Content.Core.Usecases.MetaObjects;
using Microsoft.AspNetCore.Mvc;

namespace Content.Api;

[ApiController]
[Route($"api/{ModuleConstants.Key}/MetaObject")]
public class MetaObjectController(
    GetAllMetaObjects getAll,
    GetMetaObjectByKey getByKey,
    CreateMetaObject create,
    UpdateMetaObject update,
    DeleteMetaObject delete) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        => Ok(await getAll.ExecuteAsync(cancellationToken));

    [HttpGet("{key}")]
    public async Task<IActionResult> GetByKey(string key, CancellationToken cancellationToken)
    {
        var result = await getByKey.ExecuteAsync(key, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateMetaObjectRequest request, CancellationToken cancellationToken)
    {
        var result = await create.ExecuteAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetByKey), new { key = result.Key }, result);
    }

    [HttpPut("{key}")]
    public async Task<IActionResult> Update(string key, [FromBody] UpdateMetaObjectRequest request, CancellationToken cancellationToken)
    {
        var result = await update.ExecuteAsync(key, request, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpDelete("{key}")]
    public async Task<IActionResult> Delete(string key, CancellationToken cancellationToken)
    {
        var result = await delete.ExecuteAsync(key, cancellationToken);
        return result ? NoContent() : NotFound();
    }
}
