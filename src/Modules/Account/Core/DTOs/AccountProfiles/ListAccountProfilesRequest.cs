using System.ComponentModel.DataAnnotations;
using Account.Core.Entities;

namespace Account.Core.DTOs.AccountProfiles;

public class ListAccountProfilesRequest
{
    [Range(1, int.MaxValue)]
    public int PageNumber { get; set; } = 1;

    [Range(1, 200)]
    public int PageSize { get; set; } = 20;

    public string? Search { get; set; }
    public AccountType? Type { get; set; }
    public AccountStatus? Status { get; set; }
    public string? SortBy { get; set; }
    public string? SortDirection { get; set; }
}
