using Content.Core.Constants;
using Content.Core.DTOs.FileObjects;
using SharedKernel.Abstractions.Services;
using SharedKernel.Exceptions;
using SharedKernel.Extensions;

namespace Content.Core.Usecases.FileObjects;

public class GetPresignedUpload(IFileManager fileManager, ICacheService cache)
{
    private const int MaxBatchSize = 20;
    private static readonly HashSet<string> AllowedCategories = [.. FileCategory.List];
    private static readonly HashSet<string> AllowedContentTypes =
    [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "video/mp4",
        "application/pdf"
    ];

    private static readonly Dictionary<string, long> MaxSizeByCategory = new()
    {
        [FileCategory.Avatar] = 5 * 1024 * 1024,
        [FileCategory.Product] = 10 * 1024 * 1024,
        [FileCategory.Review] = 20 * 1024 * 1024,
        [FileCategory.Content] = 20 * 1024 * 1024
    };

    public async Task<PresignedUploadBulkUrlResponse> ExecuteAsync(
        GetPresignedUploadBulkUrlRequest request,
        CancellationToken cancellationToken)
    {
        ValidateRequest(request);

        var expiresIn = TimeSpan.FromMinutes(request.ExpiryMinutes);
        var expiresAt = DateTimeOffset.UtcNow.Add(expiresIn);
        var intents = request.Files.Select(file => CreateIntent(file, expiresAt)).ToList();

        var urls = await fileManager.GetPresignedUploadBulkUrlAsync(
            intents.Select(intent => new PresignedUploadParameters
            {
                Key = intent.Key,
                Category = intent.Category,
                ContentType = intent.ContentType,
                Ext = Path.GetExtension(intent.Name)
            }),
            expiresIn,
            cancellationToken);

        foreach (var intent in intents)
        {
            await cache.SetAsync(GetCacheKey(intent.UploadId), intent, expiresIn);
        }

        return new PresignedUploadBulkUrlResponse
        {
            Files = intents.Zip(urls, (intent, url) => new PresignedUploadUrlResponse
            {
                UploadId = intent.UploadId,
                Key = intent.Key,
                UploadUrl = url,
                PublicUrl = fileManager.BuildPublicUrl(intent.Key)!,
                Method = "PUT",
                Headers = new Dictionary<string, string>
                {
                    ["Content-Type"] = intent.ContentType
                },
                ExpiresAt = expiresAt
            }).ToList()
        };
    }

    public static string GetCacheKey(string uploadId) => $"content:file-upload-intent:{uploadId}";

    private static UploadIntent CreateIntent(CreatePresignedUploadFileRequest file, DateTimeOffset expiresAt)
    {
        var category = file.Category.Trim();
        var safeFileName = ToSafeFileName(file.FileName);
        var uploadId = UlidGenerator.NewUlid(DateTime.UtcNow).ToLowerInvariant();

        return new UploadIntent
        {
            UploadId = uploadId,
            Key = $"{category}/{uploadId}/{safeFileName}",
            Category = category,
            Name = safeFileName,
            ContentType = file.ContentType.Trim().ToLowerInvariant(),
            Size = file.Size,
            ExpiresAt = expiresAt
        };
    }

    private static void ValidateRequest(GetPresignedUploadBulkUrlRequest request)
    {
        var errors = new Dictionary<string, string[]>();

        if (request.Files.Count == 0)
            errors[nameof(request.Files)] = ["At least one file is required."];

        if (request.Files.Count > MaxBatchSize)
            errors[nameof(request.Files)] = [$"No more than {MaxBatchSize} files are allowed per request."];

        for (var i = 0; i < request.Files.Count; i++)
        {
            ValidateFile(request.Files[i], i, errors);
        }

        if (errors.Count > 0)
            throw new ValidationException("Validation failed", errors);
    }

    private static void ValidateFile(
        CreatePresignedUploadFileRequest file,
        int index,
        Dictionary<string, string[]> errors)
    {
        var category = file.Category.Trim();
        var contentType = file.ContentType.Trim().ToLowerInvariant();
        var fileNameKey = $"{nameof(GetPresignedUploadBulkUrlRequest.Files)}[{index}].{nameof(file.FileName)}";

        if (!AllowedCategories.Contains(category))
        {
            errors[$"{nameof(GetPresignedUploadBulkUrlRequest.Files)}[{index}].{nameof(file.Category)}"] =
                [$"Unsupported category '{file.Category}'."];
        }

        if (!AllowedContentTypes.Contains(contentType))
        {
            errors[$"{nameof(GetPresignedUploadBulkUrlRequest.Files)}[{index}].{nameof(file.ContentType)}"] =
                [$"Unsupported content type '{file.ContentType}'."];
        }

        if (file.Size <= 0)
        {
            errors[$"{nameof(GetPresignedUploadBulkUrlRequest.Files)}[{index}].{nameof(file.Size)}"] =
                ["File size must be greater than 0."];
        }
        else if (MaxSizeByCategory.TryGetValue(category, out var maxSize) && file.Size > maxSize)
        {
            errors[$"{nameof(GetPresignedUploadBulkUrlRequest.Files)}[{index}].{nameof(file.Size)}"] =
                [$"File size exceeds the {maxSize} byte limit for category '{category}'."];
        }

        try
        {
            ToSafeFileName(file.FileName);
        }
        catch (ArgumentException ex)
        {
            errors[fileNameKey] = [ex.Message];
        }
    }

    private static string ToSafeFileName(string fileName)
    {
        var trimmed = fileName.Trim();
        var leafName = Path.GetFileName(trimmed);

        if (string.IsNullOrWhiteSpace(leafName) || leafName is "." or ".." || leafName != trimmed)
            throw new ArgumentException("File name must be a safe leaf file name.");

        var safe = new string(leafName.Select(ch =>
            char.IsAsciiLetterOrDigit(ch) || ch is '.' or '_' or '-' ? ch :
            char.IsWhiteSpace(ch) ? '-' :
            '\0').Where(ch => ch != '\0').ToArray());

        safe = string.Join('-', safe.Split('-', StringSplitOptions.RemoveEmptyEntries));

        if (string.IsNullOrWhiteSpace(safe) || string.IsNullOrWhiteSpace(Path.GetExtension(safe)))
            throw new ArgumentException("File name must include a safe base name and extension.");

        return safe;
    }
}
