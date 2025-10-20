namespace SharedKernel.Abstractions.Services;

public interface IUser
{
    string Id { get; }
    string? UserName { get; }
    string? Email { get; }
    string? FullName { get; }
    int? TenantId { get; }
}