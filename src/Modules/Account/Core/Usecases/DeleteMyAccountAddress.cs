using Account.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace Account.Core.Usecases;

public class DeleteMyAccountAddress(AccountProfileResolver resolver, AccountDbContext db)
{
    public async Task<bool> ExecuteAsync(int addressId, AccountType accountType, CancellationToken ct)
    {
        var profile = await resolver.GetOrCreateCurrentAsync(accountType, ct);
        var address = await db.Addresses
            .FirstOrDefaultAsync(x => !x.IsDeleted && x.Id == addressId && x.AccountProfileId == profile.Id, ct);

        if (address is null)
        {
            return false;
        }

        address.IsDeleted = true;
        await db.SaveChangesAsync(ct);
        return true;
    }
}
