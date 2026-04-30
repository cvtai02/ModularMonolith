namespace Order.Core.Entities;

public class OrderLine : AuditableEntity
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public int ProductId { get; private set; }
    public int VariantId { get; private set; }
    public string ProductName { get; private set; } = string.Empty;
    public string VariantName { get; private set; } = string.Empty;
    public string ImageUrl { get; private set; }
    public decimal UnitPrice { get; private set; }
    public int Quantity { get; private set; }
    public decimal Subtotal { get; private set; }
    public Order Order { get; } = null!;

    public OrderLine()
    {
    }

    public OrderLine(
        int productId,
        int variantId,
        string productName,
        string variantName,
        string imageUrl,
        decimal unitPrice,
        int quantity)
    {
        SetSnapshot(productId, variantId, productName, variantName, imageUrl);
        UpdatePricing(unitPrice, quantity);
    }

    public void SetSnapshot(int productId, int variantId, string productName, string variantName, string imageUrl)
    {
        if (productId <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(productId), "ProductId must be greater than zero.");
        }

        if (variantId <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(variantId), "VariantId must be greater than zero.");
        }

        ProductId = productId;
        VariantId = variantId;
        ProductName = RequireText(productName, nameof(productName), 256);
        VariantName = RequireText(variantName, nameof(variantName), 256);
        ImageUrl = imageUrl.Trim();
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
