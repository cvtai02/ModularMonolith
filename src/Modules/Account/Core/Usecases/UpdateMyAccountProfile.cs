using Account.DTOs.AccountProfiles;
using Account.Core.Entities;

namespace Account.Core.Usecases;

public class UpdateMyAccountProfile(AccountProfileResolver resolver, AccountDbContext db)
{
    public async Task<AccountProfileResponse> ExecuteAsync(
        UpdateAccountProfileRequest request,
        AccountType accountType,
        CancellationToken ct)
    {
        var profile = await resolver.GetOrCreateCurrentAsync(accountType, ct);
        AccountProfileWriter.Apply(profile, request);
        await db.SaveChangesAsync(ct);
        return AccountMapper.ToProfileResponse(profile);
    }
}
