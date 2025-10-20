using Content.Core.DatabaseContext;
using Content.Core.DTOs.MetaObjects;
using Content.Core.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Content.Api;

[ApiController]
[Route($"api/{ModuleConstants.Key}/MetaObject")]
public class MetaObjectController(ContentDbContext db) : ControllerBase
{
    private readonly ContentDbContext _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var metaObjects = await _db.MetaObjects
            .AsNoTracking()
            .OrderBy(x => x.Namespace)
            .ThenBy(x => x.Key)
            .ToListAsync(cancellationToken);

        return Ok(metaObjects.Select(MapToResponse));
    }

    [HttpGet("{key}")]
    public async Task<IActionResult> GetByKey(string key, CancellationToken cancellationToken)
    {
        var metaObject = await _db.MetaObjects
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Key == key, cancellationToken);

        return metaObject is null ? NotFound() : Ok(MapToResponse(metaObject));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateMetaObjectRequest request, CancellationToken cancellationToken)
    {
        ContentValidation.ValidateRequest(request);
        var key = request.Key.Trim();
        var exists = await _db.MetaObjects.AnyAsync(x => x.Key == key, cancellationToken);
        if (exists)
        {
            return Conflict("Meta object already exists.");
        }

        var entity = new MetaObject
        {
            Key = key,
            Namespace = request.Namespace.Trim(),
            Value = request.Value.Trim(),
            Type = request.Type.Trim()
        };

        _db.MetaObjects.Add(entity);
        await _db.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(GetByKey), new { key = entity.Key }, MapToResponse(entity));
    }

    [HttpPut("{key}")]
    public async Task<IActionResult> Update(string key, [FromBody] UpdateMetaObjectRequest request, CancellationToken cancellationToken)
    {
        ContentValidation.ValidateRequest(request);
        var metaObject = await _db.MetaObjects.FirstOrDefaultAsync(x => x.Key == key, cancellationToken);
        if (metaObject is null)
        {
            return NotFound();
        }

        metaObject.Namespace = request.Namespace.Trim();
        metaObject.Value = request.Value.Trim();
        metaObject.Type = request.Type.Trim();

        await _db.SaveChangesAsync(cancellationToken);

        return Ok(MapToResponse(metaObject));
    }

    [HttpDelete("{key}")]
    public async Task<IActionResult> Delete(string key, CancellationToken cancellationToken)
    {
        var metaObject = await _db.MetaObjects.FirstOrDefaultAsync(x => x.Key == key, cancellationToken);
        if (metaObject is null)
        {
            return NotFound();
        }

        _db.MetaObjects.Remove(metaObject);
        await _db.SaveChangesAsync(cancellationToken);

        return NoContent();
    }

    private static MetaObjectResponse MapToResponse(MetaObject metaObject)
    {
        return new MetaObjectResponse
        {
            Key = metaObject.Key,
            Namespace = metaObject.Namespace,
            Value = metaObject.Value,
            Type = metaObject.Type
        };
    }
}
