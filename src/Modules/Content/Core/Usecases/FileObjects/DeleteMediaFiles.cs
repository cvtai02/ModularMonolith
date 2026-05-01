using Content.DTOs.FileObjects;
using Intermediary.Media;
using Microsoft.EntityFrameworkCore;
using SharedKernel.Abstractions.Services;
using SharedKernel.Exceptions;

namespace Content.Core.Usecases.FileObjects;

public class DeleteMediaFiles(
    ContentDbContext db,
    IFileManager fileManager,
    IEnumerable<IMediaUsageChecker> usageCheckers)
{
    public async Task<bool> ExecuteAsync(DeleteMediaFilesRequest request, CancellationToken cancellationToken)
    {
        var ids = (request.Ids ?? [])
            .Where(id => id > 0)
            .Distinct()
            .ToList();

        if (ids.Count == 0)
            throw new ValidationException("Validation failed", new Dictionary<string, string[]>
            {
                [nameof(request.Ids)] = ["At least one media file id is required."]
            });

        var files = await db.Files
            .Where(x => ids.Contains(x.Id))
            .ToListAsync(cancellationToken);

        var foundIds = files.Select(x => x.Id).ToHashSet();
        var missingIds = ids.Where(id => !foundIds.Contains(id)).ToList();
        if (missingIds.Count > 0)
            throw new NotFoundException($"Media files were not found: {string.Join(", ", missingIds)}.");

        var keys = files.Select(x => x.Key).Distinct().ToList();
        var usedKeys = new HashSet<string>();
        foreach (var checker in usageCheckers)
        {
            var checkerUsedKeys = await checker.GetUsedKeysAsync(keys, cancellationToken);
            foreach (var key in checkerUsedKeys)
                usedKeys.Add(key);
        }

        if (usedKeys.Count > 0)
            throw new ValidationException("Validation failed", new Dictionary<string, string[]>
            {
                ["Ids"] = [$"Media files are still in use: {string.Join(", ", files.Where(x => usedKeys.Contains(x.Key)).Select(x => x.Id).Distinct())}."]
            });

        await fileManager.DeleteBulkAsync(keys, cancellationToken);

        db.Files.RemoveRange(files);
        await db.SaveChangesAsync(cancellationToken);

        return true;
    }
}
