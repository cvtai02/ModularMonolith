using Content.Core.DTOs.Menus;
using Content.Core.Entities;

namespace Content.Core.Usecases.Menus;

internal static class MenuMapper
{
    internal static MenuResponse ToResponse(Menu menu) => new()
    {
        Name = menu.Name,
        Description = menu.Description,
        Url = menu.Url,
        ParentName = menu.Parent?.Name,
        SubmenuNames = menu.Submenus.Select(x => x.Name).OrderBy(x => x).ToList()
    };
}
