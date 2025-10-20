namespace SharedKernel.Abstractions.Services;

public interface ICacheService
{
    Task<T?> GetAsync<T>(string key);

    Task SetAsync<T>(string key, T value, TimeSpan? ttl = null);

    Task RemoveAsync(string key);

    Task<bool> ExistsAsync(string key);
}