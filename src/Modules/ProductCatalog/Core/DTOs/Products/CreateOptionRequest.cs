using System.ComponentModel.DataAnnotations;
namespace ProductCatalog.Core.DTOs.Products;

public class CreateOptionRequest
{
    [Required, MaxLength(100)] public string Name { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
    public List<string> Values { get; set; } = [];
}
