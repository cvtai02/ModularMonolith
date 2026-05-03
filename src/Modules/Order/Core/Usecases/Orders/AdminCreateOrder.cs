using Intermediary.Ordering;
using Order.DTOs.Orders;
using SharedKernel.Exceptions;

namespace Order.Core.Usecases.Orders;

public class AdminCreateOrder(
    IOrderCustomerLookup customerLookup,
    CreateOrder createOrder)
{
    public async Task<OrderResponse> ExecuteAsync(AdminCreateOrderRequest request, CancellationToken ct)
    {
        if (request is null)
        {
            throw new ValidationException("Validation failed", new Dictionary<string, string[]>
            {
                ["request"] = ["Request body is required."]
            });
        }

        if (request.CustomerProfileId <= 0)
        {
            throw new ValidationException("Validation failed", new Dictionary<string, string[]>
            {
                [nameof(request.CustomerProfileId)] = ["Customer profile id must be greater than zero."]
            });
        }

        var customer = await customerLookup.GetCustomerForOrderAsync(request.CustomerProfileId, ct);
        if (customer is null)
        {
            throw new ValidationException("Validation failed", new Dictionary<string, string[]>
            {
                [nameof(request.CustomerProfileId)] = ["Customer profile was not found."]
            });
        }

        if (!customer.IsCustomer)
        {
            throw new ValidationException("Validation failed", new Dictionary<string, string[]>
            {
                [nameof(request.CustomerProfileId)] = ["Selected profile is not a customer."]
            });
        }

        if (!customer.IsActive)
        {
            throw new ValidationException("Validation failed", new Dictionary<string, string[]>
            {
                [nameof(request.CustomerProfileId)] = ["Selected customer profile is not active."]
            });
        }

        if (string.IsNullOrWhiteSpace(customer.IdentityUserId))
        {
            throw new ValidationException("Validation failed", new Dictionary<string, string[]>
            {
                [nameof(request.CustomerProfileId)] = ["Selected customer profile is not linked to an identity user."]
            });
        }

        return await createOrder.ExecuteForCustomerAsync(request, customer.IdentityUserId, ct);
    }
}
