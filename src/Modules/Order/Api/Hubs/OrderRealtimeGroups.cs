namespace Order.Api.Hubs;

public static class OrderRealtimeGroups
{
    public static string Order(string orderCode) => $"order:{orderCode}";
    public static string Customer(string customerId) => $"customer-orders:{customerId}";
}
