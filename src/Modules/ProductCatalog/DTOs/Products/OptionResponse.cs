namespace ProductCatalog.DTOs.Products;

public class OptionResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
    public List<string> Values { get; set; } = [];
}
