using Account.DTOs.AccountAddresses;
using Account.DTOs.AccountProfiles;
using Account.Core.Entities;

namespace Account.Core.Usecases;

public static class AccountMapper
{
    public static AccountProfileResponse ToProfileResponse(AccountProfile profile) => new()
    {
        Id = profile.Id,
        IdentityUserId = profile.IdentityUserId,
        Type = profile.Type,
        DisplayName = profile.DisplayName,
        Email = profile.Email,
        PhoneNumber = profile.PhoneNumber,
        AvatarUrl = profile.AvatarUrl,
        Status = profile.Status,
        Created = profile.Created,
        LastModified = profile.LastModified,
        Addresses = profile.Addresses
            .Where(x => !x.IsDeleted)
            .OrderByDescending(x => x.IsDefaultShipping)
            .ThenByDescending(x => x.IsDefaultBilling)
            .ThenBy(x => x.Id)
            .Select(ToAddressResponse)
            .ToList()
    };

    public static AccountAddressResponse ToAddressResponse(AccountAddress address) => new()
    {
        Id = address.Id,
        AccountProfileId = address.AccountProfileId,
        OwnerName = address.OwnerName,
        Type = address.Type,
        PhoneNumber = address.PhoneNumber,
        Email = address.Email,
        Country = address.Country,
        State = address.State,
        City = address.City,
        PostalCode = address.PostalCode,
        Line1 = address.Line1,
        Line2 = address.Line2,
        IsDefaultShipping = address.IsDefaultShipping,
        IsDefaultBilling = address.IsDefaultBilling
    };
}
