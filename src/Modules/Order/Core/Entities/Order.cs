using SharedKernel.DTOs;

namespace Order.Core.Entities;

public class Order : AuditableEntity
{
    public int Id { get; set; }
    public string Code { get; private set; } = string.Empty;
    public string? CustomerId { get; set; }
    public OrderStatus Status { get; private set; } = OrderStatus.Draft;
    public string CurrencyCode { get; private set; } = "USD";
    public decimal TotalAmount { get; private set; }
    public int? InventoryReservationId { get; private set; }
    public string? RejectionReason { get; private set; }
    public Address? ShippingAddress { get; private set; }
    public ICollection<OrderLine> Lines { get; private set; } = [];

    public void SetShippingAddress(Address address)
    {
        ArgumentNullException.ThrowIfNull(address);
        ShippingAddress = address;
    }

    public void SetCode(string code)
    {
        Code = RequireText(code, nameof(code), 64);
    }

    public void SetCurrency(string currencyCode)
    {
        CurrencyCode = RequireText(currencyCode, nameof(currencyCode), 3).ToUpperInvariant();
    }

    public void SetStatus(OrderStatus status)
    {
        if (Status == status)
        {
            return;
        }

        List<OrderStatus> allowed = Status switch
        {
            OrderStatus.Draft => [OrderStatus.PendingInventory, OrderStatus.Cancelled],
            OrderStatus.PendingInventory => [OrderStatus.Placed, OrderStatus.Rejected, OrderStatus.Cancelled],
            OrderStatus.Placed => [OrderStatus.Paid, OrderStatus.Cancelled],
            OrderStatus.Paid => [OrderStatus.Shipped, OrderStatus.Cancelled],
            OrderStatus.Rejected => [],
            OrderStatus.Shipped => [],
            OrderStatus.Cancelled => [],
            _ => []
        };

        if (!allowed.Contains(status))
        {
            throw new InvalidOperationException($"Cannot change order status from {Status} to {status}.");
        }

        Status = status;
    }

    public void SetInventoryReservation(int reservationId)
    {
        if (reservationId <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(reservationId), "ReservationId must be greater than zero.");
        }

        InventoryReservationId = reservationId;
        RejectionReason = null;
    }

    public void SetRejectionReason(string reason)
    {
        RejectionReason = string.IsNullOrWhiteSpace(reason) ? null : reason.Trim();
    }

    public OrderLine AddLine(
        int productId,
        int variantId,
        string productName,
        string variantName,
        string? imageUrl,
        decimal unitPrice,
        int quantity)
    {
        var line = new OrderLine(productId, variantId, productName, variantName, imageUrl, unitPrice, quantity);
        Lines.Add(line);
        RecalculateTotalAmount();
        return line;
    }

    public void RemoveLine(OrderLine line)
    {
        ArgumentNullException.ThrowIfNull(line);

        if (Lines.Remove(line))
        {
            RecalculateTotalAmount();
        }
    }

    public void RecalculateTotalAmount()
    {
        TotalAmount = Lines.Sum(line => line.Subtotal);
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

public enum OrderStatus
{
    Draft,
    PendingInventory,
    Placed,
    Paid,
    Rejected,
    Cancelled,
    Shipped
}
