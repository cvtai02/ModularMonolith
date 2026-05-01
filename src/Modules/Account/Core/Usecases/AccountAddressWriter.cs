using Account.DTOs.AccountAddresses;
using Account.Core.Entities;
using SharedKernel.Exceptions;

namespace Account.Core.Usecases;

public static class AccountAddressWriter
{
    public static void Apply(AccountAddress address, SaveAccountAddressRequest request)
    {
        Validate(request);

        address.OwnerName = Normalize(request.OwnerName);
        address.Type = Normalize(request.Type);
        address.PhoneNumber = Normalize(request.PhoneNumber);
        address.Email = Normalize(request.Email);
        address.Country = Normalize(request.Country);
        address.State = Normalize(request.State);
        address.City = Normalize(request.City);
        address.PostalCode = Normalize(request.PostalCode);
        address.Line1 = Normalize(request.Line1);
        address.Line2 = Normalize(request.Line2);
        address.IsDefaultShipping = request.IsDefaultShipping;
        address.IsDefaultBilling = request.IsDefaultBilling;
    }

    private static void Validate(SaveAccountAddressRequest request)
    {
        var errors = new Dictionary<string, string[]>();

        if (request is null)
        {
            errors["request"] = ["Request body is required."];
        }
        else
        {
            if (string.IsNullOrWhiteSpace(request.OwnerName))
                errors[nameof(request.OwnerName)] = ["Owner name is required."];

            if (string.IsNullOrWhiteSpace(request.PhoneNumber))
                errors[nameof(request.PhoneNumber)] = ["Phone number is required."];

            if (string.IsNullOrWhiteSpace(request.Country))
                errors[nameof(request.Country)] = ["Country is required."];

            if (string.IsNullOrWhiteSpace(request.Line1))
                errors[nameof(request.Line1)] = ["Address line 1 is required."];
        }

        if (errors.Count > 0)
        {
            throw new ValidationException("Validation failed", errors);
        }
    }

    private static string Normalize(string? value) => value?.Trim() ?? string.Empty;
}
