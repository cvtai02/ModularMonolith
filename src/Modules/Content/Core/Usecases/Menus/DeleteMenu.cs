using Content.Core.Entities;
using Microsoft.EntityFrameworkCore;
using SharedKernel.Exceptions;

namespace Content.Core.Usecases.Menus;

public class DeleteMenu(ContentDbContext db)
{
    public async Task<bool> ExecuteAsync(string name, CancellationToken ct)
    {
        var menu = await db.Menus.FirstOrDefaultAsync(x => x.Name == name, ct);
        if (menu is null) return false;

        if (await db.Menus.AnyAsync(x => x.ParentId == menu.Id, ct))
            throw new ValidationException("Validation failed", new Dictionary<string, string[]>
            {
                [nameof(Menu.ParentId)] = ["Remove child menus first."]
            });

        db.Menus.Remove(menu);
        await db.SaveChangesAsync(ct);
        return true;
    }
}
