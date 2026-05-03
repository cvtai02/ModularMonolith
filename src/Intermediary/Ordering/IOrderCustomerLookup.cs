namespace Intermediary.Ordering;

public interface IOrderCustomerLookup
{
    Task<OrderCustomerInfo?> GetCustomerForOrderAsync(int accountProfileId, CancellationToken cancellationToken = default);
}

public sealed record OrderCustomerInfo(
    int AccountProfileId,
    string IdentityUserId,
    bool IsCustomer,
    bool IsActive);
