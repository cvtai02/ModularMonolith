using Account.Core.DTOs.AccountProfiles;
using Account.Core.Entities;
using SharedKernel.Exceptions;

namespace Account.Core.Usecases;

public static class AccountProfileWriter
{
    public static void Apply(AccountProfile profile, UpdateAccountProfileRequest request)
    {
        if (request is null)
        {
            throw new ValidationException("Validation failed", new Dictionary<string, string[]>
            {
                ["request"] = ["Request body is required."]
            });
        }

        profile.DisplayName = Normalize(request.DisplayName);
        profile.Email = Normalize(request.Email);
        profile.PhoneNumber = Normalize(request.PhoneNumber);
        profile.AvatarUrl = Normalize(request.AvatarUrl);
    }

    public static void ApplyAdmin(AccountProfile profile, AdminUpdateAccountProfileRequest request)
    {
        Apply(profile, request);

        if (request.Type.HasValue)
        {
            profile.Type = request.Type.Value;
        }

        if (request.Status.HasValue)
        {
            profile.Status = request.Status.Value;
        }
    }

    private static string Normalize(string? value) => value?.Trim() ?? string.Empty;
}
