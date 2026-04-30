using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Payment.Core.DTOs;
using Payment.Core.Usecases;
using SharedKernel.Authorization;

namespace Payment.Api;

[ApiController]
[Route($"api/{ModuleConstants.Key}")]
public class PaymentController(
    ListPaymentMethods listPaymentMethods,
    CreateOrderCheckout createOrderCheckout,
    GetPaymentTransactionById getPaymentTransactionById,
    HandlePaymentWebhook handlePaymentWebhook) : ControllerBase
{
    [AllowAnonymous]
    [HttpGet("methods")]
    public ActionResult<IReadOnlyList<PaymentMethodResponse>> GetMethods()
        => Ok(listPaymentMethods.Execute());

    [Authorize(Policy = Policies.AuthenticatedUserUp)]
    [HttpPost("orders/{orderId:int}/checkout")]
    public async Task<ActionResult<PaymentTransactionResponse>> CreateCheckout(
        int orderId,
        [FromBody] CreateCheckoutRequest request,
        CancellationToken cancellationToken)
        => Ok(await createOrderCheckout.ExecuteAsync(orderId, request, cancellationToken));

    [Authorize(Policy = Policies.AuthenticatedUserUp)]
    [HttpGet("transactions/{id:int}")]
    public async Task<ActionResult<PaymentTransactionResponse>> GetTransaction(
        int id,
        CancellationToken cancellationToken)
    {
        var result = await getPaymentTransactionById.ExecuteAsync(id, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [AllowAnonymous]
    [HttpPost("webhooks/{provider}")]
    public async Task<ActionResult<PaymentTransactionResponse>> Webhook(
        string provider,
        [FromBody] PaymentWebhookRequest request,
        CancellationToken cancellationToken)
    {
        var result = await handlePaymentWebhook.ExecuteAsync(provider, request, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }
}
