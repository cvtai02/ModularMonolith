namespace SharedKernel.Abstractions.Contracts;

/// <summary>
/// Indicates that the implementing entity will be cached.
/// </summary>
public interface ICache
{
    string GetCacheKey();
}