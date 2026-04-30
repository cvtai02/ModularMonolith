using Account.Core.DTOs.AccountAddresses;
using Account.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace Account.Core.Usecases;

public class CreateMyAccountAddress(AccountProfileResolver resolver, AccountDbContext db)
{
    public async Task<AccountAddressResponse> ExecuteAsync(
        SaveAccountAddressRequest request,
        AccountType accountType,
        CancellationToken ct)
    {
        var profile = await resolver.GetOrCreateCurrentAsync(accountType, ct);
        var address = new AccountAddress
        {
            AccountProfileId = profile.Id
        };

        AccountAddressWriter.Apply(address, request);
        db.Addresses.Add(address);
        await ResetDefaultsAsync(address, ct);
        await db.SaveChangesAsync(ct);

        return AccountMapper.ToAddressResponse(address);
    }

    private async Task ResetDefaultsAsync(AccountAddress address, CancellationToken ct)
    {
        if (!address.IsDefaultShipping && !address.IsDefaultBilling)
        {
            return;
        }

        var addresses = db.Addresses
            .Where(x => !x.IsDeleted && x.AccountProfileId == address.AccountProfileId);

        await foreach (var existing in addresses.AsAsyncEnumerable().WithCancellation(ct))
        {
            if (address.IsDefaultShipping)
                existing.IsDefaultShipping = false;

            if (address.IsDefaultBilling)
                existing.IsDefaultBilling = false;
        }
    }
}
