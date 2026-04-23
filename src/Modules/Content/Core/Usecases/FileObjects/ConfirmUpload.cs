using Content.Core.DTOs.FileObjects;
using Content.Core.Entities;
using SharedKernel.Abstractions.Services;
using SharedKernel.Exceptions;

namespace Content.Core.Usecases.FileObjects;

public class ConfirmUpload(ContentDbContext db, IFileManager fileManager)
{
    public async Task<List<UploadResponse>> ExecuteAsync(
        ConfirmUploadRequest request,
        CancellationToken cancellationToken)
    {
        if (request.Files.Count == 0)
            throw new ValidationException("Validation failed", new Dictionary<string, string[]>
            {
                [nameof(request.Files)] = ["At least one file is required."]
            });

        var fileObjects = request.Files.Select(f => new FileObject
        {
            Key = f.Key,
            Category = f.Category,
            ContentType = f.ContentType,
            Name = f.Name,
            Size = f.Size
        }).ToList();

        db.Files.AddRange(fileObjects);
        await db.SaveChangesAsync(cancellationToken);

        return fileObjects.Select(f => new UploadResponse
        {
            Key = f.Key,
            PublicUrl = fileManager.BuildPublicUrl(f.Key)
        }).ToList();
    }
}
