using Account.DTOs.AccountAddresses;
using Account.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace Account.Core.Usecases;

public class UpdateMyAccountAddress(AccountProfileResolver resolver, AccountDbContext db)
{
    public async Task<AccountAddressResponse?> ExecuteAsync(
        int addressId,
        SaveAccountAddressRequest request,
        AccountType accountType,
        CancellationToken ct)
    {
        var profile = await resolver.GetOrCreateCurrentAsync(accountType, ct);
        var address = await db.Addresses
            .FirstOrDefaultAsync(x => !x.IsDeleted && x.Id == addressId && x.AccountProfileId == profile.Id, ct);

        if (address is null)
        {
            return null;
        }

        AccountAddressWriter.Apply(address, request);
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
            .Where(x => !x.IsDeleted && x.AccountProfileId == address.AccountProfileId && x.Id != address.Id);

        await foreach (var existing in addresses.AsAsyncEnumerable().WithCancellation(ct))
        {
            if (address.IsDefaultShipping)
                existing.IsDefaultShipping = false;

            if (address.IsDefaultBilling)
                existing.IsDefaultBilling = false;
        }
    }
}
