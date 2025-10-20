namespace ProductCatalog.Core.DTOs.Products;

public class VariantResponse
{
    public int Id { get; set; }
    public decimal Price { get; set; }
    public List<VariantOptionValueDto> OptionValues { get; set; } = [];
}
