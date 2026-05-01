using System.ComponentModel.DataAnnotations;

namespace Content.DTOs.FileObjects;

public class DeleteMediaFilesRequest
{
    [Required]
    public List<int> Ids { get; set; } = [];
}
