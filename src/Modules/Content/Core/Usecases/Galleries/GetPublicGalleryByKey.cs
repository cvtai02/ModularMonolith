using Content.DTOs.Galleries;
using Microsoft.EntityFrameworkCore;

namespace Content.Core.Usecases.Galleries;

[UsecaseInject]
public class GetPublicGalleryByKey(ContentDbContext db)
{
    public async Task<GalleryResponse?> ExecuteAsync(string key, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(key))
            return null;

        var normalizedKey = GalleryValidation.NormalizeKey(key);
        var gallery = await db.Galleries
            .AsNoTracking()
            .ActiveOnly()
            .Include(x => x.Items.Where(i => !i.IsDeleted))
            .FirstOrDefaultAsync(x => x.Key == normalizedKey && x.IsPublic, ct);

        return gallery is null ? null : GalleryMapper.ToResponse(gallery);
    }
}
