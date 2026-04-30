namespace Payment.Core.DTOs;

public class CreateCheckoutRequest
{
    public string? Provider { get; set; } = "CashOnDelivery";
    public string? ReturnUrl { get; set; }
    public string? CancelUrl { get; set; }
}
