namespace Order.Api.Hubs;

public static class OrderRealtimeGroups
{
    public static string Order(int orderId) => $"order:{orderId}";
    public static string Customer(string customerId) => $"customer-orders:{customerId}";
}
