namespace Payment.DTOs;

public class PaymentMethodResponse
{
    public string Code { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public bool RequiresRedirect { get; set; }
}
