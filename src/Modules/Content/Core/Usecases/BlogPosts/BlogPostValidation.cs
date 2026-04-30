using Content.Core.DTOs.BlogPosts;
using SharedKernel.Exceptions;

namespace Content.Core.Usecases.BlogPosts;

public static class BlogPostValidation
{
    public static void Validate(CreateBlogPostRequest request)
    {
        if (request is null)
        {
            throw new ValidationException("Validation failed", new Dictionary<string, string[]>
            {
                ["request"] = ["Request body is required."]
            });
        }

        var errors = ValidateShape(request.Title, request.Content);
        ThrowIfInvalid(errors);
    }

    public static void Validate(UpdateBlogPostRequest request)
    {
        if (request is null)
        {
            throw new ValidationException("Validation failed", new Dictionary<string, string[]>
            {
                ["request"] = ["Request body is required."]
            });
        }

        var errors = ValidateShape(request.Title, request.Content);
        ThrowIfInvalid(errors);
    }

    public static string NormalizeRequired(string value) => value.Trim();

    public static string NormalizeOptional(string? value) => value?.Trim() ?? string.Empty;

    private static Dictionary<string, string[]> ValidateShape(string? title, string? content)
    {
        var errors = new Dictionary<string, string[]>();

        if (string.IsNullOrWhiteSpace(title))
        {
            errors["Title"] = ["Title is required."];
        }

        if (string.IsNullOrWhiteSpace(content))
        {
            errors["Content"] = ["Content is required."];
        }

        return errors;
    }

    private static void ThrowIfInvalid(Dictionary<string, string[]> errors)
    {
        if (errors.Count > 0)
        {
            throw new ValidationException("Validation failed", errors);
        }
    }
}
