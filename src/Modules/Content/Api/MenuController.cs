using Content.Core.DTOs.Menus;
using Content.Core.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SharedKernel.Exceptions;

namespace Content.Api;

[ApiController]
[Route($"api/{ModuleConstants.Key}/Menu")]
public class MenuController(ContentDbContext db) : ControllerBase
{
    private readonly ContentDbContext _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var menus = await _db.Menus
            .AsNoTracking()
            .Include(x => x.Submenus)
            .OrderBy(x => x.Name)
            .ToListAsync(cancellationToken);

        return Ok(menus.Select(MapToResponse));
    }

    [HttpGet("{name}")]
    public async Task<IActionResult> GetByName(string name, CancellationToken cancellationToken)
    {
        var menu = await _db.Menus
            .AsNoTracking()
            .Include(x => x.Submenus)
            .FirstOrDefaultAsync(x => x.Name == name, cancellationToken);

        return menu is null ? NotFound() : Ok(MapToResponse(menu));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateMenuRequest request, CancellationToken cancellationToken)
    {
        var name = request.Name.Trim();
        var parentName = string.IsNullOrWhiteSpace(request.ParentName) ? null : request.ParentName.Trim();

        if (parentName == name)
        {
            throw new ValidationException(
                "Validation failed",
                new Dictionary<string, string[]>
                {
                    [nameof(request.ParentName)] = ["Menu cannot be its own parent."]
                });
        }

        var exists = await _db.Menus.AnyAsync(x => x.Name == name, cancellationToken);
        if (exists)
        {
            throw new ValidationException(
                "Validation failed",
                new Dictionary<string, string[]>
                {
                    [nameof(request.Name)] = ["Menu already exists."]
                });
        }

        if (parentName is not null)
        {
            var parentExists = await _db.Menus.AnyAsync(x => x.Name == parentName, cancellationToken);
            if (!parentExists)
            {
                throw new ValidationException(
                    "Validation failed",
                    new Dictionary<string, string[]>
                    {
                        [nameof(request.ParentName)] = ["Parent menu does not exist."]
                    });
            }
        }

        var entity = new Menu
        {
            Name = name,
            Description = request.Description.Trim(),
            Url = request.Url.Trim(),
            ParentName = parentName
        };

        _db.Menus.Add(entity);
        await _db.SaveChangesAsync(cancellationToken);

        var created = await _db.Menus
            .AsNoTracking()
            .Include(x => x.Submenus)
            .FirstAsync(x => x.Name == entity.Name, cancellationToken);

        return CreatedAtAction(nameof(GetByName), new { name = entity.Name }, MapToResponse(created));
    }

    [HttpPut("{name}")]
    public async Task<IActionResult> Update(string name, [FromBody] UpdateMenuRequest request, CancellationToken cancellationToken)
    {
        var menu = await _db.Menus
            .Include(x => x.Submenus)
            .FirstOrDefaultAsync(x => x.Name == name, cancellationToken);

        if (menu is null)
        {
            return NotFound();
        }

        var parentName = string.IsNullOrWhiteSpace(request.ParentName) ? null : request.ParentName.Trim();
        if (parentName == name)
        {
            throw new ValidationException(
                "Validation failed",
                new Dictionary<string, string[]>
                {
                    [nameof(request.ParentName)] = ["Menu cannot be its own parent."]
                });
        }

        if (parentName is not null)
        {
            var parentExists = await _db.Menus.AnyAsync(x => x.Name == parentName, cancellationToken);
            if (!parentExists)
            {
                throw new ValidationException(
                    "Validation failed",
                    new Dictionary<string, string[]>
                    {
                        [nameof(request.ParentName)] = ["Parent menu does not exist."]
                    });
            }
        }

        menu.Description = request.Description.Trim();
        menu.Url = request.Url.Trim();
        menu.ParentName = parentName;

        await _db.SaveChangesAsync(cancellationToken);

        return Ok(MapToResponse(menu));
    }

    [HttpDelete("{name}")]
    public async Task<IActionResult> Delete(string name, CancellationToken cancellationToken)
    {
        var menu = await _db.Menus
            .FirstOrDefaultAsync(x => x.Name == name, cancellationToken);

        if (menu is null)
        {
            return NotFound();
        }

        var hasChildren = await _db.Menus.AnyAsync(x => x.ParentName == name, cancellationToken);
        if (hasChildren)
        {
            throw new ValidationException(
                "Validation failed",
                new Dictionary<string, string[]>
                {
                    [nameof(Menu.ParentName)] = ["Remove child menus first."]
                });
        }

        _db.Menus.Remove(menu);
        await _db.SaveChangesAsync(cancellationToken);

        return NoContent();
    }

    private static MenuResponse MapToResponse(Menu menu)
    {
        return new MenuResponse
        {
            Name = menu.Name,
            Description = menu.Description,
            Url = menu.Url,
            ParentName = menu.ParentName,
            SubmenuNames = menu.Submenus.Select(x => x.Name).OrderBy(x => x).ToList()
        };
    }
}
