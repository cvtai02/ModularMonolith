using Content.Core.DTOs.Menus;
using Microsoft.EntityFrameworkCore;

namespace Content.Core.Usecases.Menus;

public class GetAllMenus(ContentDbContext db)
{
    public async Task<List<MenuResponse>> ExecuteAsync(CancellationToken ct)
    {
        var menus = await db.Menus
            .AsNoTracking()
            .Include(x => x.Parent)
            .Include(x => x.Submenus)
            .OrderBy(x => x.Name)
            .ToListAsync(ct);

        return menus.Select(MenuMapper.ToResponse).ToList();
    }
}
