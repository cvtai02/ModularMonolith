using Account.DTOs.AccountProfiles;
using Microsoft.EntityFrameworkCore;

namespace Account.Core.Usecases;

public class UpdateAdminAccountProfile(AccountDbContext db)
{
    public async Task<AccountProfileResponse?> ExecuteAsync(
        int id,
        AdminUpdateAccountProfileRequest request,
        CancellationToken ct)
    {
        var profile = await db.Profiles
            .Include(x => x.Addresses)
            .FirstOrDefaultAsync(x => !x.IsDeleted && x.Id == id, ct);

        if (profile is null)
        {
            return null;
        }

        AccountProfileWriter.ApplyAdmin(profile, request);
        await db.SaveChangesAsync(ct);

        return AccountMapper.ToProfileResponse(profile);
    }
}
