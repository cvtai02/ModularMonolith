namespace Order.DTOs.Orders;

public class AdminCreateOrderRequest : CreateOrderRequest
{
    public int CustomerProfileId { get; set; }
}
