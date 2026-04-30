using Account.Core.DTOs.AccountProfiles;
using Microsoft.EntityFrameworkCore;

namespace Account.Core.Usecases;

public class GetAdminAccountProfileById(AccountDbContext db)
{
    public async Task<AccountProfileResponse?> ExecuteAsync(int id, CancellationToken ct)
    {
        var profile = await db.Profiles
            .AsNoTracking()
            .Include(x => x.Addresses)
            .FirstOrDefaultAsync(x => !x.IsDeleted && x.Id == id, ct);

        return profile is null ? null : AccountMapper.ToProfileResponse(profile);
    }
}
