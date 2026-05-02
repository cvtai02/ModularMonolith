namespace Inventory.DTOs.Inventory;

public class ImportVariantInventoryResponse
{
    public int TotalCount { get; set; }
    public int AppliedCount { get; set; }
    public int SkippedCount { get; set; }
    public int FailedCount { get; set; }
    public List<ImportVariantInventoryRowResponse> Rows { get; set; } = [];
}

public class ImportVariantInventoryRowResponse
{
    public int VariantId { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public int PreviousQuantity { get; set; }
    public int NewQuantity { get; set; }
}
