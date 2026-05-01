using Account.DTOs.AccountAddresses;
using Account.Core.Entities;

namespace Account.Core.Usecases;

public class ListMyAccountAddresses(AccountProfileResolver resolver)
{
    public async Task<List<AccountAddressResponse>> ExecuteAsync(AccountType accountType, CancellationToken ct)
    {
        var profile = await resolver.GetOrCreateCurrentAsync(accountType, ct);
        return profile.Addresses
            .Where(x => !x.IsDeleted)
            .OrderByDescending(x => x.IsDefaultShipping)
            .ThenByDescending(x => x.IsDefaultBilling)
            .ThenBy(x => x.Id)
            .Select(AccountMapper.ToAddressResponse)
            .ToList();
    }
}
