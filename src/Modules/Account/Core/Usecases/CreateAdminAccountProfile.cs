using Account.Core.Entities;
using Account.DTOs.AccountProfiles;
using Microsoft.EntityFrameworkCore;
using SharedKernel.Exceptions;

namespace Account.Core.Usecases;

public class CreateAdminAccountProfile(AccountDbContext db)
{
    public async Task<AccountProfileResponse> ExecuteAsync(
        AdminCreateAccountProfileRequest request,
        CancellationToken ct)
    {
        Validate(request);

        var identityUserId = await ResolveIdentityUserIdAsync(request.IdentityUserId, ct);
        var profile = new AccountProfile
        {
            IdentityUserId = identityUserId,
            Type = AccountType.Customer,
            Status = request.Status ?? AccountStatus.Active
        };

        AccountProfileWriter.Apply(profile, request);

        db.Profiles.Add(profile);
        await db.SaveChangesAsync(ct);

        return AccountMapper.ToProfileResponse(profile);
    }

    private async Task<string> ResolveIdentityUserIdAsync(string? value, CancellationToken ct)
    {
        var normalized = Normalize(value);
        if (!string.IsNullOrWhiteSpace(normalized))
        {
            if (await IdentityUserIdExistsAsync(normalized, ct))
            {
                Throw("IdentityUserId", "Identity user id is already assigned to another profile.");
            }

            return normalized;
        }

        string generated;
        do
        {
            generated = $"manual-customer:{Guid.NewGuid():N}";
        }
        while (await IdentityUserIdExistsAsync(generated, ct));

        return generated;
    }

    private async Task<bool> IdentityUserIdExistsAsync(string identityUserId, CancellationToken ct)
        => await db.Profiles
            .AnyAsync(x => !x.IsDeleted && x.IdentityUserId == identityUserId, ct);

    private static void Validate(AdminCreateAccountProfileRequest request)
    {
        if (request is null)
        {
            throw new ValidationException("Validation failed", new Dictionary<string, string[]>
            {
                ["request"] = ["Request body is required."]
            });
        }

        if (string.IsNullOrWhiteSpace(request.Email))
        {
            Throw(nameof(request.Email), "Email is required.");
        }
    }

    private static string Normalize(string? value) => value?.Trim() ?? string.Empty;

    private static void Throw(string field, string message)
    {
        throw new ValidationException("Validation failed", new Dictionary<string, string[]>
        {
            [field] = [message]
        });
    }
}
