using System.ComponentModel.DataAnnotations;
using Order.Core.Entities;

namespace Order.Core.DTOs.Orders;

public class ListOrdersRequest
{
    [Range(1, int.MaxValue)]
    public int PageNumber { get; set; } = 1;

    [Range(1, 200)]
    public int PageSize { get; set; } = 20;

    public OrderStatus? Status { get; set; }

    public string? Search { get; set; }
}
