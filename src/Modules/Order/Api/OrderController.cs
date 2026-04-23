using Microsoft.AspNetCore.Mvc;
using Order.Core.DTOs;
using Order.Core.Entities;
using Order.Core.Usecases.Orders;
using SharedKernel.DTOs;

namespace Order.Api;

[ApiController]
[Route($"api/{ModuleConstants.Key}/orders")]
public class OrderController(
    ListOrders listOrders,
    GetOrderById getOrderById,
    CreateOrder createOrder,
    UpdateOrderStatus updateOrderStatus,
    DeleteOrder deleteOrder) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PaginatedList<OrderResponse>>> GetAll(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] OrderStatus? status = null,
        CancellationToken cancellationToken = default)
        => Ok(await listOrders.ExecuteAsync(pageNumber, pageSize, search, status, cancellationToken));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<OrderResponse>> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await getOrderById.ExecuteAsync(id, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<OrderResponse>> Create(
        [FromBody] CreateOrderRequest request, CancellationToken cancellationToken)
    {
        var result = await createOrder.ExecuteAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPatch("{id:int}/status")]
    public async Task<ActionResult<OrderResponse>> UpdateStatus(
        int id, [FromBody] UpdateOrderStatusRequest request, CancellationToken cancellationToken)
    {
        var result = await updateOrderStatus.ExecuteAsync(id, request, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var result = await deleteOrder.ExecuteAsync(id, cancellationToken);
        return result is null ? NotFound() : NoContent();
    }
}
