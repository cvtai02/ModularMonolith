using SharedKernel.Abstractions.Contracts;

namespace Intermediary.Events.ProductCatalog;

public class ProductCreated : IntegrationEvent
{
    public string ProductId { get; set; } = string.Empty;
    public bool TrackInventory { get; set; }
    public bool AllowBackorder { get; set; }
    public int LowStockThreshold { get; set; }
    public IReadOnlyCollection<ProductCreatedVariant> Variants { get; set; } = [];
}

public class ProductCreatedVariant
{
    public string VariantId { get; set; } = string.Empty;
    public bool UseProductInventory { get; set; } = true;
    public bool TrackInventory { get; set; } = true;
    public bool AllowBackorder { get; set; }
    public int LowStockThreshold { get; set; }
    public int Quantity { get; set; }
}
