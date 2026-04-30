namespace Payment.Core.DTOs;

public class CreateCheckoutRequest
{
    public string? Provider { get; set; } = "Manual";
    public string? ReturnUrl { get; set; }
    public string? CancelUrl { get; set; }
}
