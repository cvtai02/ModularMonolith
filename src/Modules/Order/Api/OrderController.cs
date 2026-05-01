using Microsoft.AspNetCore.Mvc;
using Order.DTOs.Orders;
using Order.Core.Usecases.Orders;
using SharedKernel.DTOs;

namespace Order.Api;

[ApiController]
[Route($"api/{ModuleConstants.Key}/orders")]
public class OrderController(
    CreateOrder createOrder,
    GetOrderById getOrderById,
    ListOrders listOrders) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<OrderResponse>> Create(
        [FromBody] CreateOrderRequest request,
        CancellationToken cancellationToken)
    {
        var result = await createOrder.ExecuteAsync(request, cancellationToken);
        return AcceptedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<OrderResponse>> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await getOrderById.ExecuteAsync(id, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpGet]
    public async Task<ActionResult<PaginatedList<OrderSummaryResponse>>> GetAll(
        [FromQuery] ListOrdersRequest request,
        CancellationToken cancellationToken)
        => Ok(await listOrders.ExecuteAsync(request, cancellationToken));
}
