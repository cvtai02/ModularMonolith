using Intermediary.Events.Order;
using Intermediary.Ordering;
using Order.DTOs.Orders;
using SharedKernel.Abstractions.Services;
using SharedKernel.DTOs;
using SharedKernel.Enums;
using SharedKernel.Exceptions;

namespace Order.Core.Usecases.Orders;

public class CreateOrder(
    OrderDbContext db,
    IOrderProductLookup productLookup,
    IUser user,
    IEventBus eventBus)
{
    private const int MaxLineCount = 50;

    public async Task<OrderResponse> ExecuteAsync(CreateOrderRequest request, CancellationToken ct)
    {
        if (request is null)
            throw new ValidationException("Validation failed", new Dictionary<string, string[]>
            {
                ["request"] = ["Request body is required."]
            });

        request.Items ??= [];
        var currencyCode = NormalizeCurrency(request.CurrencyCode);
        ValidateRequestShape(request, currencyCode);

        var requestedVariantIds = request.Items.Select(x => x.VariantId).Distinct().ToList();
        var variants = await productLookup.GetVariantsForOrderAsync(requestedVariantIds, ct);
        var variantById = variants.ToDictionary(x => x.VariantId);

        ValidateProductData(request, currencyCode, variantById);

        var order = new Entities.Order
        {
            CustomerId = string.IsNullOrWhiteSpace(user.Id) ? null : user.Id
        };
        order.SetCode(GenerateOrderCode());
        order.SetCurrency(currencyCode);
        order.SetShippingAddress(NormalizeAddress(request.ShippingAddress!));

        foreach (var item in request.Items)
        {
            var variant = variantById[item.VariantId];
            order.AddLine(
                variant.ProductId,
                variant.VariantId,
                variant.ProductName,
                variant.VariantName,
                variant.ImageUrl,
                variant.UnitPrice,
                item.Quantity);
        }

        order.SetStatus(Entities.OrderStatus.PendingInventory);
        db.Orders.Add(order);
        await db.SaveChangesAsync(ct);

        var response = OrderMapper.ToResponse(order);
        await eventBus.Publish(new OrderSubmitted
        {
            OrderId = order.Id,
            OrderCode = order.Code,
            CurrencyCode = order.CurrencyCode,
            Items = order.Lines
                .Select(x => new OrderSubmittedItem
                {
                    VariantId = x.VariantId,
                    Quantity = x.Quantity
                })
                .ToList()
        }, ct);

        return response;
    }

    private static void ValidateRequestShape(CreateOrderRequest request, string currencyCode)
    {
        var errors = new Dictionary<string, string[]>();

        if (!Enum.TryParse<Currency>(currencyCode, ignoreCase: true, out _))
            errors[nameof(request.CurrencyCode)] = ["Currency is not supported."];

        if (request.Items.Count == 0)
            errors[nameof(request.Items)] = ["Order must contain at least one item."];

        if (request.Items.Count > MaxLineCount)
            errors[nameof(request.Items)] = [$"Order cannot contain more than {MaxLineCount} items."];

        var itemErrors = new List<string>();
        var invalidQuantityIds = request.Items
            .Where(x => x.Quantity <= 0)
            .Select(x => x.VariantId)
            .ToList();
        if (invalidQuantityIds.Count > 0)
            itemErrors.Add($"Quantity must be greater than zero for variant ids: {string.Join(", ", invalidQuantityIds)}.");

        var duplicateVariantIds = request.Items
            .GroupBy(x => x.VariantId)
            .Where(x => x.Count() > 1)
            .Select(x => x.Key)
            .ToList();
        if (duplicateVariantIds.Count > 0)
            itemErrors.Add($"Duplicate variant ids are not allowed: {string.Join(", ", duplicateVariantIds)}.");

        if (itemErrors.Count > 0)
            errors[nameof(request.Items)] = itemErrors.ToArray();

        if (request.ShippingAddress is null)
            errors[nameof(request.ShippingAddress)] = ["Shipping address is required."];
        else
        {
            var addressErrors = ValidateAddress(request.ShippingAddress);
            foreach (var error in addressErrors)
                errors[error.Key] = error.Value;
        }

        if (errors.Count > 0) throw new ValidationException("Validation failed", errors);
    }

    private static void ValidateProductData(
        CreateOrderRequest request,
        string currencyCode,
        IReadOnlyDictionary<int, OrderProductVariantInfo> variantById)
    {
        var errors = new Dictionary<string, string[]>();
        var itemErrors = new List<string>();
        var missingVariantIds = request.Items
            .Select(x => x.VariantId)
            .Where(x => !variantById.ContainsKey(x))
            .ToList();
        if (missingVariantIds.Count > 0)
            itemErrors.Add($"Variant ids do not exist: {string.Join(", ", missingVariantIds)}.");

        var inactiveVariantIds = request.Items
            .Select(x => x.VariantId)
            .Where(x => variantById.TryGetValue(x, out var variant) && !variant.IsProductActive)
            .ToList();
        if (inactiveVariantIds.Count > 0)
            itemErrors.Add($"Variant ids are not sellable because their products are inactive: {string.Join(", ", inactiveVariantIds)}.");

        if (itemErrors.Count > 0)
            errors[nameof(request.Items)] = itemErrors.ToArray();

        var currencyMismatchIds = request.Items
            .Select(x => x.VariantId)
            .Where(x => variantById.TryGetValue(x, out var variant) &&
                        !string.Equals(variant.CurrencyCode, currencyCode, StringComparison.OrdinalIgnoreCase))
            .ToList();
        if (currencyMismatchIds.Count > 0)
            errors[nameof(request.CurrencyCode)] = [$"Currency does not match variant ids: {string.Join(", ", currencyMismatchIds)}."];

        if (errors.Count > 0) throw new ValidationException("Validation failed", errors);
    }

    private static Dictionary<string, string[]> ValidateAddress(Address address)
    {
        var errors = new Dictionary<string, string[]>();

        if (string.IsNullOrWhiteSpace(address.OwnerName))
            errors[$"{nameof(CreateOrderRequest.ShippingAddress)}.{nameof(Address.OwnerName)}"] = ["Owner name is required."];

        if (string.IsNullOrWhiteSpace(address.PhoneNumber))
            errors[$"{nameof(CreateOrderRequest.ShippingAddress)}.{nameof(Address.PhoneNumber)}"] = ["Phone number is required."];

        if (string.IsNullOrWhiteSpace(address.Country))
            errors[$"{nameof(CreateOrderRequest.ShippingAddress)}.{nameof(Address.Country)}"] = ["Country is required."];

        if (string.IsNullOrWhiteSpace(address.Line1))
            errors[$"{nameof(CreateOrderRequest.ShippingAddress)}.{nameof(Address.Line1)}"] = ["Address line 1 is required."];

        return errors;
    }

    private static Address NormalizeAddress(Address address) => new()
    {
        OwnerName = address.OwnerName?.Trim() ?? string.Empty,
        Type = address.Type?.Trim() ?? string.Empty,
        PhoneNumber = address.PhoneNumber?.Trim() ?? string.Empty,
        Email = address.Email?.Trim() ?? string.Empty,
        Country = address.Country?.Trim() ?? string.Empty,
        State = address.State?.Trim(),
        City = address.City?.Trim(),
        PostalCode = address.PostalCode?.Trim(),
        Line1 = address.Line1?.Trim() ?? string.Empty,
        Line2 = address.Line2?.Trim()
    };

    private static string NormalizeCurrency(string? currencyCode) =>
        string.IsNullOrWhiteSpace(currencyCode) ? Currency.VND.ToString() : currencyCode.Trim().ToUpperInvariant();

    private static string GenerateOrderCode()
    {
        var suffix = Guid.NewGuid().ToString("N")[..10].ToUpperInvariant();
        return $"ORD-{DateTime.UtcNow:yyyyMMdd}-{suffix}";
    }
}
