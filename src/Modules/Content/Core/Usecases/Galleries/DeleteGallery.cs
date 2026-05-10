using Microsoft.EntityFrameworkCore;

namespace Content.Core.Usecases.Galleries;

[UsecaseInject]
public class DeleteGallery(ContentDbContext db)
{
    public async Task<bool> ExecuteAsync(int id, CancellationToken ct)
    {
        var gallery = await db.Galleries
            .ActiveOnly()
            .Include(x => x.Items.Where(i => !i.IsDeleted))
            .FirstOrDefaultAsync(x => x.Id == id, ct);

        if (gallery is null)
            return false;

        gallery.IsDeleted = true;
        foreach (var item in gallery.Items)
            item.IsDeleted = true;

        await db.SaveChangesAsync(ct);
        return true;
    }
}
