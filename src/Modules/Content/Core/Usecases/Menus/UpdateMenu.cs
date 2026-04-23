using Content.Core.DTOs.Menus;
using Microsoft.EntityFrameworkCore;
using SharedKernel.Exceptions;

namespace Content.Core.Usecases.Menus;

public class UpdateMenu(ContentDbContext db)
{
    public async Task<MenuResponse?> ExecuteAsync(string name, UpdateMenuRequest request, CancellationToken ct)
    {
        var menu = await db.Menus
            .Include(x => x.Submenus)
            .FirstOrDefaultAsync(x => x.Name == name, ct);

        if (menu is null) return null;

        var parentName = string.IsNullOrWhiteSpace(request.ParentName) ? null : request.ParentName.Trim();
        if (parentName == name)
            throw new ValidationException("Validation failed", new Dictionary<string, string[]>
            {
                [nameof(request.ParentName)] = ["Menu cannot be its own parent."]
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

        menu.Description = request.Description.Trim();
        menu.Url = request.Url.Trim();
        menu.ParentId = parentId;
        await db.SaveChangesAsync(ct);

        var updated = await db.Menus
            .AsNoTracking()
            .Include(x => x.Parent)
            .Include(x => x.Submenus)
            .FirstAsync(x => x.Id == menu.Id, ct);

        return MenuMapper.ToResponse(updated);
    }
}
