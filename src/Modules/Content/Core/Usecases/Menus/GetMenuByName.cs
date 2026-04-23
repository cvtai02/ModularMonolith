using Content.Core.DTOs.Menus;
using Microsoft.EntityFrameworkCore;

namespace Content.Core.Usecases.Menus;

public class GetMenuByName(ContentDbContext db)
{
    public async Task<MenuResponse?> ExecuteAsync(string name, CancellationToken ct)
    {
        var menu = await db.Menus
            .AsNoTracking()
            .Include(x => x.Parent)
            .Include(x => x.Submenus)
            .FirstOrDefaultAsync(x => x.Name == name, ct);

        return menu is null ? null : MenuMapper.ToResponse(menu);
    }
}
