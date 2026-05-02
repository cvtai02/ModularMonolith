using Content.DTOs.BlogPostCollections;
using SharedKernel.Exceptions;

namespace Content.Core.Usecases.BlogPostCollections;

public static class BlogPostCollectionValidation
{
    public static void Validate(CreateBlogPostCollectionRequest request)
    {
        if (request is null)
        {
            Throw("request", "Request body is required.");
        }

        var errors = ValidateShape(request!.Key, request.Title, request.BlogPostIds);
        ThrowIfInvalid(errors);
    }

    public static void Validate(UpdateBlogPostCollectionRequest request)
    {
        if (request is null)
        {
            Throw("request", "Request body is required.");
        }

        var errors = ValidateShape("existing-key", request!.Title, request.BlogPostIds);
        ThrowIfInvalid(errors);
    }

    public static string NormalizeKey(string value)
        => value.Trim().ToLowerInvariant();

    public static string NormalizeRequired(string value)
        => value.Trim();

    public static string NormalizeOptional(string? value)
        => value?.Trim() ?? string.Empty;

    private static Dictionary<string, string[]> ValidateShape(string? key, string? title, List<int>? blogPostIds)
    {
        var errors = new Dictionary<string, string[]>();

        if (string.IsNullOrWhiteSpace(key))
        {
            errors["Key"] = ["Key is required."];
        }
        else if (!IsStableKey(key))
        {
            errors["Key"] = ["Key can only contain letters, numbers, hyphens, and underscores."];
        }

        if (string.IsNullOrWhiteSpace(title))
        {
            errors["Title"] = ["Title is required."];
        }

        if (blogPostIds is null)
        {
            errors["BlogPostIds"] = ["Blog post ids are required."];
        }
        else if (blogPostIds.Any(x => x <= 0))
        {
            errors["BlogPostIds"] = ["Blog post ids must be positive."];
        }
        else if (blogPostIds.Count != blogPostIds.Distinct().Count())
        {
            errors["BlogPostIds"] = ["Blog post ids must be unique."];
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

    public static void ThrowIfInvalid(Dictionary<string, string[]> errors)
    {
        if (errors.Count > 0)
        {
            throw new ValidationException("Validation failed", errors);
        }
    }
}
