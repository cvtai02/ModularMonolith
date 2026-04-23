using System.ComponentModel.DataAnnotations;
using Order.Core.Entities;

namespace Order.Core.DTOs;

public class UpdateOrderStatusRequest
{
    [Required]
    public OrderStatus Status { get; set; }
}
