using Account.Core.Entities;
using Intermediary.Ordering;
using Microsoft.EntityFrameworkCore;

namespace Account.Core.Services;

public class OrderCustomerLookup(AccountDbContext db) : IOrderCustomerLookup
{
    public async Task<OrderCustomerInfo?> GetCustomerForOrderAsync(
        int accountProfileId,
        CancellationToken cancellationToken = default)
    {
        var profile = await db.Profiles
            .AsNoTracking()
            .FirstOrDefaultAsync(x => !x.IsDeleted && x.Id == accountProfileId, cancellationToken);

        return profile is null
            ? null
            : new OrderCustomerInfo(
                profile.Id,
                profile.IdentityUserId,
                profile.Type == AccountType.Customer,
                profile.Status == AccountStatus.Active);
    }
}
