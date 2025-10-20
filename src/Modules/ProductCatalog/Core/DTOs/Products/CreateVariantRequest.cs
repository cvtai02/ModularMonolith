namespace ProductCatalog.Core.DTOs.Products;

public class CreateVariantRequest
{
    public decimal Price { get; set; }
    public List<VariantOptionValueDto> OptionValues { get; set; } = [];
}

public class VariantOptionValueDto
{
    public int OptionId { get; set; }
    public string OptionName { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
}
