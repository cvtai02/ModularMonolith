# Claude Handoff: Payment Method Strategy

## Summary

Payment supports payment methods through backend strategies. For now, the only supported method is `CashOnDelivery`.

## Frontend Contract

- Import aliases from `src/clients/shared/api/api-types.ts`.
- Use `GET /api/Payment/methods` to render available payment methods.
- Send `CashOnDelivery` as `provider` when creating checkout, or omit `provider` to use the backend default.

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
