using Content.DTOs.Galleries;
using SharedKernel.Exceptions;

namespace Content.Core.Usecases.Galleries;

public static class GalleryValidation
{
    public static void Validate(CreateGalleryRequest request)
    {
        if (request is null)
            Throw("request", "Request body is required.");

        var errors = ValidateShape(request!.Key, request.Name, request.Items);
        ThrowIfInvalid(errors);
    }

    public static void Validate(UpdateGalleryRequest request)
    {
        if (request is null)
            Throw("request", "Request body is required.");

        var errors = ValidateShape("existing-key", request!.Name, request.Items);
        ThrowIfInvalid(errors);
    }

    public static string NormalizeKey(string value)
        => value.Trim().ToLowerInvariant();

    public static string NormalizeRequired(string value)
        => value.Trim();

    public static string NormalizeOptional(string? value)
        => value?.Trim() ?? string.Empty;

    private static Dictionary<string, string[]> ValidateShape(string? key, string? name, List<SaveGalleryItemRequest>? items)
    {
        var errors = new Dictionary<string, string[]>();

        if (string.IsNullOrWhiteSpace(key))
            errors["Key"] = ["Key is required."];
        else if (!IsStableKey(key))
            errors["Key"] = ["Key can only contain letters, numbers, hyphens, and underscores."];

        if (string.IsNullOrWhiteSpace(name))
            errors["Name"] = ["Name is required."];

        if (items is null)
        {
            errors["Items"] = ["Gallery items are required."];
        }
        else
        {
            var invalidImageKeys = items
                .Where(x => string.IsNullOrWhiteSpace(x.ImageKey))
                .ToList();

            if (invalidImageKeys.Count > 0)
                errors["Items"] = ["Each gallery item must include an image key."];

            var displayOrders = items.Select(x => x.DisplayOrder).ToList();
            if (displayOrders.Count != displayOrders.Distinct().Count())
                errors["DisplayOrder"] = ["Gallery item display orders must be unique."];
        }

        return errors;
    }

    private static bool IsStableKey(string value)
        => value.Trim().All(x =>
            (x >= 'a' && x <= 'z') ||
            (x >= 'A' && x <= 'Z') ||
            (x >= '0' && x <= '9') ||
            x == '-' ||
            x == '_');

    public static void Throw(string key, string message)
        => throw new ValidationException("Validation failed", new Dictionary<string, string[]> { [key] = [message] });

    private static void ThrowIfInvalid(Dictionary<string, string[]> errors)
    {
        if (errors.Count > 0)
            throw new ValidationException("Validation failed", errors);
    }
}
