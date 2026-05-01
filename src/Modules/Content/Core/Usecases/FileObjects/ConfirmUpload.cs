using Content.DTOs.FileObjects;
using Content.Core.Entities;
using Microsoft.EntityFrameworkCore;
using SharedKernel.Abstractions.Services;
using SharedKernel.Exceptions;

namespace Content.Core.Usecases.FileObjects;

public class ConfirmUpload(ContentDbContext db, IFileManager fileManager, ICacheService cache)
{
    public async Task<ConfirmUploadResponse> ExecuteAsync(
        ConfirmUploadRequest request,
        CancellationToken cancellationToken)
    {
        ValidateRequest(request);

        var responses = new List<UploadResponse>();

        foreach (var file in request.Files)
        {
            var uploadId = file.UploadId.Trim();
            var key = file.Key.Trim().TrimStart('/');
            var intent = await cache.GetAsync<UploadIntent>(GetPresignedUpload.GetCacheKey(uploadId));

            if (intent is null)
                throw Validation(nameof(file.UploadId), $"Upload intent '{uploadId}' was not found or has expired.");

            if (!string.Equals(intent.Key, key, StringComparison.Ordinal))
                throw Validation(nameof(file.Key), "Upload key does not match the upload intent.");

            var existing = await db.Files.FirstOrDefaultAsync(x => x.Key == key, cancellationToken);
            if (existing is not null)
            {
                responses.Add(ToResponse(existing));
                await cache.RemoveAsync(GetPresignedUpload.GetCacheKey(uploadId));
                continue;
            }

            var metadata = await fileManager.GetObjectMetadataAsync(key, cancellationToken);
            if (metadata is null)
                throw Validation(nameof(file.Key), "Uploaded object was not found in storage.");

            if (!string.Equals(metadata.ContentType, intent.ContentType, StringComparison.OrdinalIgnoreCase))
                throw Validation(nameof(file.Key), "Uploaded object content type does not match the upload intent.");

            if (metadata.Size != intent.Size)
                throw Validation(nameof(file.Key), "Uploaded object size does not match the upload intent.");

            var fileObject = new FileObject
            {
                Key = intent.Key,
                Category = intent.Category,
                ContentType = intent.ContentType,
                Name = intent.Name,
                Size = intent.Size
            };

            db.Files.Add(fileObject);
            await db.SaveChangesAsync(cancellationToken);
            await cache.RemoveAsync(GetPresignedUpload.GetCacheKey(uploadId));

            responses.Add(ToResponse(fileObject));
        }

        return new ConfirmUploadResponse { Files = responses };
    }

    private static void ValidateRequest(ConfirmUploadRequest request)
    {
        var errors = new Dictionary<string, string[]>();

        if (request.Files.Count == 0)
            errors[nameof(request.Files)] = ["At least one file is required."];

        for (var i = 0; i < request.Files.Count; i++)
        {
            if (string.IsNullOrWhiteSpace(request.Files[i].UploadId))
                errors[$"{nameof(request.Files)}[{i}].{nameof(ConfirmUploadFileRequest.UploadId)}"] = ["Upload id is required."];

            if (string.IsNullOrWhiteSpace(request.Files[i].Key))
                errors[$"{nameof(request.Files)}[{i}].{nameof(ConfirmUploadFileRequest.Key)}"] = ["Key is required."];
        }

        if (errors.Count > 0)
            throw new ValidationException("Validation failed", errors);
    }

    private UploadResponse ToResponse(FileObject fileObject) => new()
    {
        Id = fileObject.Id,
        Key = fileObject.Key,
        Category = fileObject.Category,
        Name = fileObject.Name,
        ContentType = fileObject.ContentType,
        Size = fileObject.Size,
        PublicUrl = fileManager.BuildPublicUrl(fileObject.Key)!
    };

    private static ValidationException Validation(string key, string message)
        => new("Validation failed", new Dictionary<string, string[]> { [key] = [message] });
}
