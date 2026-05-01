# Payment API

Base route: `/api/Payment`

## Endpoints

- `GET /api/Payment/methods`
  - Authorization: public.
  - Lists supported payment methods.

- `POST /api/Payment/orders/{orderId}/checkout`
  - Authorization: authenticated user.
  - Creates or returns an active checkout transaction for a placed order.

- `GET /api/Payment/transactions/{id}`
  - Authorization: authenticated user.
  - Returns a non-deleted payment transaction.

- `POST /api/Payment/webhooks/{provider}`
  - Authorization: public provider callback.
  - Applies provider payment status updates.

## DTO References

- Payments: [CreateCheckoutRequest](../DTOs/CreateCheckoutRequest.cs), [PaymentMethodResponse](../DTOs/PaymentMethodResponse.cs), [PaymentTransactionResponse](../DTOs/PaymentTransactionResponse.cs), [PaymentWebhookRequest](../DTOs/PaymentWebhookRequest.cs)
