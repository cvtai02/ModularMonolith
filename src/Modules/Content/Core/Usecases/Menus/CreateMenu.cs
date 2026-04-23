using Content.Core.DTOs.Menus;
using Content.Core.Entities;
using Microsoft.EntityFrameworkCore;
using SharedKernel.Exceptions;

namespace Content.Core.Usecases.Menus;

public class CreateMenu(ContentDbContext db)
{
    public async Task<MenuResponse> ExecuteAsync(CreateMenuRequest request, CancellationToken ct)
    {
        var name = request.Name.Trim();
        var parentName = string.IsNullOrWhiteSpace(request.ParentName) ? null : request.ParentName.Trim();

        if (parentName == name)
            throw new ValidationException("Validation failed", new Dictionary<string, string[]>
            {
                [nameof(request.ParentName)] = ["Menu cannot be its own parent."]
            });

        if (await db.Menus.AnyAsync(x => x.Name == name, ct))
            throw new ValidationException("Validation failed", new Dictionary<string, string[]>
            {
                [nameof(request.Name)] = ["Menu already exists."]
            });

        int? parentId = null;
        if (parentName is not null)
        {
            var parent = await db.Menus.FirstOrDefaultAsync(x => x.Name == parentName, ct);
            if (parent is null)
                throw new ValidationException("Validation failed", new Dictionary<string, string[]>
                {
                    [nameof(request.ParentName)] = ["Parent menu does not exist."]
                });
            parentId = parent.Id;
        }

        var entity = new Menu
        {
            Name = name,
            Description = request.Description.Trim(),
            Url = request.Url.Trim(),
            ParentId = parentId
        };

        db.Menus.Add(entity);
        await db.SaveChangesAsync(ct);

        var created = await db.Menus
            .AsNoTracking()
            .Include(x => x.Parent)
            .Include(x => x.Submenus)
            .FirstAsync(x => x.Id == entity.Id, ct);

        return MenuMapper.ToResponse(created);
    }
}
