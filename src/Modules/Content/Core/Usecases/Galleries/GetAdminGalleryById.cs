using Content.DTOs.Galleries;
using Microsoft.EntityFrameworkCore;

namespace Content.Core.Usecases.Galleries;

[UsecaseInject]
public class GetAdminGalleryById(ContentDbContext db)
{
    public async Task<GalleryResponse?> ExecuteAsync(int id, CancellationToken ct)
    {
        var gallery = await db.Galleries
            .AsNoTracking()
            .ActiveOnly()
            .Include(x => x.Items.Where(i => !i.IsDeleted))
            .FirstOrDefaultAsync(x => x.Id == id, ct);

        return gallery is null ? null : GalleryMapper.ToResponse(gallery);
    }
}
