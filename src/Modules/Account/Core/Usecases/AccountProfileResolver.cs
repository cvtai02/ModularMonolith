using Account.Core.Entities;
using Microsoft.EntityFrameworkCore;
using SharedKernel.Abstractions.Services;
using SharedKernel.Exceptions;

namespace Account.Core.Usecases;

public class AccountProfileResolver(AccountDbContext db, IUser user)
{
    public async Task<AccountProfile> GetOrCreateCurrentAsync(AccountType accountType, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(user.Id))
        {
            throw new ValidationException("Validation failed", new Dictionary<string, string[]>
            {
                ["user"] = ["Authenticated user id is required."]
            });
        }

        var profile = await db.Profiles
            .Include(x => x.Addresses)
            .FirstOrDefaultAsync(x => !x.IsDeleted && x.IdentityUserId == user.Id, ct);

        if (profile is not null)
        {
            return profile;
        }

        profile = new AccountProfile
        {
            IdentityUserId = user.Id,
            Type = accountType,
            DisplayName = user.FullName ?? user.UserName ?? string.Empty,
            Email = user.Email ?? string.Empty,
            Status = AccountStatus.Active
        };

        db.Profiles.Add(profile);
        await db.SaveChangesAsync(ct);

        return profile;
    }
}
