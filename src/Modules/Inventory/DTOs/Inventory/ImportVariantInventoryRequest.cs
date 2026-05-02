using System.ComponentModel.DataAnnotations;

namespace Inventory.DTOs.Inventory;

public class ImportVariantInventoryRequest
{
    [MaxLength(200)]
    public string? ReferenceId { get; set; }

    [MaxLength(1000)]
    public string? Note { get; set; }

    public List<ImportVariantInventoryRowRequest> Rows { get; set; } = [];
}

public class ImportVariantInventoryRowRequest
{
    [Required]
    public int VariantId { get; set; }

    [Range(0, int.MaxValue)]
    public int Quantity { get; set; }
}
