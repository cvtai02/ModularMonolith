using System.ComponentModel.DataAnnotations;

namespace Content.Api;

internal static class ContentValidation
{
    public static void ValidateRequest(object request)
    {
        var context = new ValidationContext(request);
        var results = new List<ValidationResult>();
        if (Validator.TryValidateObject(request, context, results, true))
        {
            return;
        }

        var errors = results
            .SelectMany(x => x.MemberNames.DefaultIfEmpty(string.Empty).Select(member => new
            {
                member,
                error = x.ErrorMessage ?? "Invalid value."
            }))
            .GroupBy(x => x.member)
            .ToDictionary(x => x.Key, x => x.Select(v => v.error).ToArray());

        throw new SharedKernel.Exceptions.ValidationException("Validation failed", errors);
    }
}
