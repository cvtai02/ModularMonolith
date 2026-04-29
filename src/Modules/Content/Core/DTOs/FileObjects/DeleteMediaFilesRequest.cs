using System.ComponentModel.DataAnnotations;

namespace Content.Core.DTOs.FileObjects;

public class DeleteMediaFilesRequest
{
    [Required]
    public List<int> Ids { get; set; } = [];
}
