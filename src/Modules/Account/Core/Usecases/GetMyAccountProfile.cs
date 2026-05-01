using Account.DTOs.AccountProfiles;
using Account.Core.Entities;

namespace Account.Core.Usecases;

public class GetMyAccountProfile(AccountProfileResolver resolver)
{
    public async Task<AccountProfileResponse> ExecuteAsync(AccountType accountType, CancellationToken ct)
    {
        var profile = await resolver.GetOrCreateCurrentAsync(accountType, ct);
        return AccountMapper.ToProfileResponse(profile);
    }
}
