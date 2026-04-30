# Claude Handoff: Payment Method Strategy

## Summary

Payment supports payment methods through backend strategies. For now, the only supported method is `CashOnDelivery`.

## Frontend Contract

- Import aliases from `src/clients/shared/api/api-types.ts`.
- Use `GET /api/Payment/methods` to render available payment methods.
- Send `CashOnDelivery` as `provider` when creating checkout, or omit `provider` to use the backend default.

## Request And Response Types

- `GET /api/Payment/methods`
  - Response: `ListPaymentMethodsResponse`.
- `POST /api/Payment/orders/{orderId}/checkout`
  - Path params: `CreatePaymentCheckoutParams`.
  - Request: `CreatePaymentCheckoutRequest`.
  - Response: `CreatePaymentCheckoutResponse`.
- `GET /api/Payment/transactions/{id}`
  - Path params: `GetPaymentTransactionParams`.
  - Response: `PaymentTransactionResponse`.
- `POST /api/Payment/webhooks/{provider}`
  - Path params: `PaymentWebhookParams`.
  - Request: `PaymentWebhookRequest`.
  - Response: `PaymentWebhookResponse`.

## Type Properties

`PaymentStatus` values:
- `Pending`
- `Succeeded`
- `Failed`
- `Cancelled`
- `Refunded`

`PaymentMethodResponse`:
- `code: string`
- `displayName: string`
- `requiresRedirect: boolean`

`ListPaymentMethodsResponse`:
- `PaymentMethodResponse[]`

`CreatePaymentCheckoutParams`:
- `orderId: number`

`CreatePaymentCheckoutRequest`:
- `provider?: string | null`
- `returnUrl?: string | null`
- `cancelUrl?: string | null`

`CreatePaymentCheckoutResponse` and `PaymentTransactionResponse`:
- `id: number`
- `orderId: number`
- `orderCode: string`
- `customerId?: string | null`
- `amount: number`
- `currencyCode: string`
- `provider: string`
- `providerPaymentId: string`
- `status: PaymentStatus`
- `checkoutUrl?: string | null`
- `failureReason?: string | null`
- `paidAt?: string | null`
- `cancelledAt?: string | null`
- `created: string`
- `lastModified: string`

`GetPaymentTransactionParams`:
- `id: number`

`PaymentWebhookParams`:
- `provider: string`

`PaymentWebhookRequest`:
- `providerPaymentId: string`
- `status: PaymentStatus`
- `failureReason?: string | null`
- `eventId?: string | null`
- `signature?: string | null`

`PaymentWebhookResponse`:
- same properties as `PaymentTransactionResponse`.

## Endpoints

- `GET /api/Payment/methods`
  - Public.
  - Returns `code`, `displayName`, and `requiresRedirect`.

- `POST /api/Payment/orders/{orderId}/checkout`
  - Authenticated user.
  - Body includes `provider`, optional `returnUrl`, optional `cancelUrl`.
  - Returns a payment transaction.

- `GET /api/Payment/transactions/{id}`
  - Authenticated user.
  - Returns a payment transaction.

- `POST /api/Payment/webhooks/{provider}`
  - Public provider callback.
  - Body includes `providerPaymentId`, `status`, optional `failureReason`, optional `eventId`, optional `signature`.

## Behavior Notes

- Unsupported provider codes return validation errors.
- Checkout is idempotent for the same order and provider while a transaction is `Pending` or `Succeeded`.
- `CashOnDelivery` creates a pending transaction without a checkout URL.
- Successful webhook updates publish `PaymentSucceeded`; the Order module marks placed orders as `Paid`.
