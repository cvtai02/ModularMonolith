namespace SharedKernel.Abstractions.Services;

public interface ICrudService<T, TKey>
{
    Task<List<T>> GetAsync(CancellationToken cancellationToken = default);

    Task<T> GetByIdAsync(TKey id, CancellationToken cancellationToken = default);

    Task AddOrUpdateAsync(T entity, CancellationToken cancellationToken = default);

    Task AddAsync(T entity, CancellationToken cancellationToken = default);

    Task UpdateAsync(T entity, CancellationToken cancellationToken = default);

    Task DeleteAsync(T entity, CancellationToken cancellationToken = default);
}