namespace Intermediary.Media;

public interface IMediaUsageChecker
{
    Task<IReadOnlyCollection<string>> GetUsedKeysAsync(
        IReadOnlyCollection<string> keys,
        CancellationToken cancellationToken = default);
}
