using System.ComponentModel.DataAnnotations;

namespace Content.Core.DTOs.FileObjects;

public class ListMediaFilesRequest
{
    [Range(1, int.MaxValue)]
    public int PageNumber { get; set; } = 1;

    [Range(1, 200)]
    public int PageSize { get; set; } = 20;

    public string? Search { get; set; }

    public string? Category { get; set; }

    public string? ContentType { get; set; }

    public long? MinSize { get; set; }

    public long? MaxSize { get; set; }

    public DateTimeOffset? CreatedFrom { get; set; }

    public DateTimeOffset? CreatedTo { get; set; }

    public string? SortBy { get; set; }

    public string? SortDirection { get; set; }
}
