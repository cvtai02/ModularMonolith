using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Order.DTOs.Orders;
using Order.Core.Usecases.Orders;
using SharedKernel.Authorization;
using SharedKernel.DTOs;

namespace Order.Api;

[ApiController]
[Route($"api/{ModuleConstants.Key}/orders")]
public class OrderController(
    CreateOrder createOrder,
    AdminCreateOrder adminCreateOrder,
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

    [Authorize(Policy = Policies.TenantAdminUp)]
    [HttpPost("admin")]
    public async Task<ActionResult<OrderResponse>> AdminCreate(
        [FromBody] AdminCreateOrderRequest request,
        CancellationToken cancellationToken)
    {
        var result = await adminCreateOrder.ExecuteAsync(request, cancellationToken);
        return AcceptedAtAction(nameof(GetAdminById), new { id = result.Id }, result);
    }

    [Authorize(Policy = Policies.TenantAdminUp)]
    [HttpGet("admin")]
    public async Task<ActionResult<PaginatedList<OrderSummaryResponse>>> GetAdmin(
        [FromQuery] ListOrdersRequest request,
        CancellationToken cancellationToken)
        => Ok(await listOrders.ExecuteAsync(request, cancellationToken));

    [Authorize(Policy = Policies.TenantAdminUp)]
    [HttpGet("admin/{id:int}")]
    public async Task<ActionResult<OrderResponse>> GetAdminById(int id, CancellationToken cancellationToken)
    {
        var result = await getOrderById.ExecuteAsync(id, cancellationToken);
        return result is null ? NotFound() : Ok(result);
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
