using Content.Core.DTOs.ContentFiles;
using Content.Core.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SharedKernel.Exceptions;

namespace Content.Api;

[ApiController]
[Route($"api/{ModuleConstants.Key}/Files")]
public class ContentFileController(ContentDbContext db) : ControllerBase
{
    private readonly ContentDbContext _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var files = await _db.Files
            .AsNoTracking()
            .OrderBy(x => x.Name)
            .ToListAsync(cancellationToken);

        return Ok(files.Select(MapToResponse));
    }

    [HttpGet("{name}")]
    public async Task<IActionResult> GetByName(string name, CancellationToken cancellationToken)
    {
        var file = await _db.Files
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Name == name, cancellationToken);

        return file is null ? NotFound() : Ok(MapToResponse(file));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateContentFileRequest request, CancellationToken cancellationToken)
    {
        var name = request.Name.Trim();
        var exists = await _db.Files.AnyAsync(x => x.Name == name, cancellationToken);
        if (exists)
        {
            throw new ValidationException(
                "Validation failed",
                new Dictionary<string, string[]>
                {
                    [nameof(request.Name)] = ["Content file already exists."]
                });
        }

        var entity = new ContentFile
        {
            Name = name,
            Url = request.Url.Trim(),
            ContentType = request.ContentType.Trim(),
            Size = request.Size
        };

        _db.Files.Add(entity);
        await _db.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(GetByName), new { name = entity.Name }, MapToResponse(entity));
    }

    [HttpPut("{name}")]
    public async Task<IActionResult> Update(string name, [FromBody] UpdateContentFileRequest request, CancellationToken cancellationToken)
    {
        var file = await _db.Files.FirstOrDefaultAsync(x => x.Name == name, cancellationToken);
        if (file is null)
        {
            return NotFound();
        }

        file.Url = request.Url.Trim();
        file.ContentType = request.ContentType.Trim();
        file.Size = request.Size;

        await _db.SaveChangesAsync(cancellationToken);

        return Ok(MapToResponse(file));
    }

    [HttpDelete("{name}")]
    public async Task<IActionResult> Delete(string name, CancellationToken cancellationToken)
    {
        var file = await _db.Files.FirstOrDefaultAsync(x => x.Name == name, cancellationToken);
        if (file is null)
        {
            return NotFound();
        }

        _db.Files.Remove(file);
        await _db.SaveChangesAsync(cancellationToken);

        return NoContent();
    }

    private static ContentFileResponse MapToResponse(ContentFile file)
    {
        return new ContentFileResponse
        {
            Name = file.Name,
            Url = file.Url,
            ContentType = file.ContentType,
            Size = file.Size
        };
    }
}
