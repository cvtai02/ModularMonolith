namespace Order.Core.Entities;

public class OrderLine : AuditableEntity
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public int VariantId { get; private set; }
    public string ProductName { get; private set; } = string.Empty;
    public decimal UnitPrice { get; private set; }
    public int Quantity { get; private set; }
    public decimal Subtotal { get; private set; }
    public Order Order { get; } = null!;

    public OrderLine()
    {
    }

    public OrderLine(int variantId, string productName, decimal unitPrice, int quantity)
    {
        SetVariant(variantId, productName);
        UpdatePricing(unitPrice, quantity);
    }

    public void SetVariant(int variantId, string productName)
    {
        if (variantId <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(variantId), "VariantId must be greater than zero.");
        }

        VariantId = variantId;
        ProductName = RequireText(productName, nameof(productName), 256);
    }

    public void UpdatePricing(decimal unitPrice, int quantity)
    {
        if (unitPrice < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(unitPrice), "Unit price cannot be negative.");
        }

        if (quantity <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(quantity), "Quantity must be greater than zero.");
        }

        UnitPrice = unitPrice;
        Quantity = quantity;
        Subtotal = unitPrice * quantity;
    }

    private static string RequireText(string value, string paramName, int maxLength)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(value, paramName);

        var normalized = value.Trim();
        if (normalized.Length > maxLength)
        {
            throw new ArgumentOutOfRangeException(paramName, $"Value cannot exceed {maxLength} characters.");
        }

        return normalized;
    }
}
