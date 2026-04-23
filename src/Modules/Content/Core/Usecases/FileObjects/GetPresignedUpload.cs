using Content.Core.Constants;
using Content.Core.DTOs.FileObjects;
using SharedKernel.Abstractions.Services;
using SharedKernel.Exceptions;
using SharedKernel.Extensions;

namespace Content.Core.Usecases.FileObjects;

public class GetPresignedUpload(IFileManager fileManager)
{
    private static readonly HashSet<string> AllowedCategories = [.. FileCategory.List];

    public async Task<List<PresignedUploadUrlResponse>> ExecuteAsync(
        GetPresignedUploadBulkUrlRequest request,
        CancellationToken cancellationToken)
    {
        if (request.Files.Count == 0)
            throw new ValidationException("Validation failed", new Dictionary<string, string[]>
            {
                [nameof(request.Files)] = ["At least one file is required."]
            });

        var resolvedFiles = request.Files.Select((file, index) =>
        {
            ValidateCategory(file.Category, $"{nameof(request.Files)}[{index}].{nameof(file.Category)}");
            var key = ResolveKey(file.Key, file.Category, file.Ext);
            return new
            {
                Key = key,
                Parameter = new PresignedUploadParameters
                {
                    Key = key,
                    Category = file.Category.Trim(),
                    ContentType = file.ContentType,
                    Ext = NormalizeExtension(file.Ext)
                }
            };
        }).ToList();

        var urls = await fileManager.GetPresignedUploadBulkUrlAsync(
            [.. resolvedFiles.Select(x => x.Parameter)],
            TimeSpan.FromMinutes(request.ExpiryMinutes),
            cancellationToken);

        return resolvedFiles.Zip(urls, (file, url) => new PresignedUploadUrlResponse
        {
            Key = file.Key,
            UploadUrl = url,
            PublicUrl = fileManager.BuildPublicUrl(file.Key)
        }).ToList();
    }

    private static void ValidateCategory(string category, string key)
    {
        if (!AllowedCategories.Contains(category.Trim()))
            throw new ValidationException("Validation failed", new Dictionary<string, string[]>
            {
                [key] = [$"Unsupported category '{category}'."]
            });
    }

    private static string ResolveKey(string? key, string category, string ext)
    {
        if (!string.IsNullOrWhiteSpace(key))
            return key.Trim().TrimStart('/');

        var now = DateTime.UtcNow;
        var ulid = UlidGenerator.NewUlid(now).ToLowerInvariant();
        return $"{category}/{ulid}{NormalizeExtension(ext)}";
    }

    private static string NormalizeExtension(string ext)
    {
        var trimmed = ext.Trim();
        return trimmed.StartsWith('.') ? trimmed : $".{trimmed}";
    }
}
