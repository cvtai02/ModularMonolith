using Microsoft.Extensions.Caching.Memory;
using SharedKernel.Abstractions.Services;

namespace Infrastructure.Cache;

public class MemoryCacheService : ICacheService
{
    private readonly IMemoryCache _cache;

    public MemoryCacheService(IMemoryCache cache)
    {
        _cache = cache;
    }

    public Task<T?> GetAsync<T>(string key)
        => Task.FromResult(_cache.Get<T>(key));

    public Task SetAsync<T>(string key, T value, TimeSpan? ttl = null)
    {
        _cache.Set(key, value, ttl ?? TimeSpan.FromMinutes(5));
        return Task.CompletedTask;
    }

    public Task RemoveAsync(string key)
    {
        _cache.Remove(key);
        return Task.CompletedTask;
    }

    public Task<bool> ExistsAsync(string key)
        => Task.FromResult(_cache.TryGetValue(key, out _));
}