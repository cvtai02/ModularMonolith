# Payment Method Strategy Summary Flow

## Summary
Payment supports provider strategies. Current supported provider is `CashOnDelivery`.

## Flow
- Client lists available methods with `GET /api/Payment/methods`.
- Client creates checkout with `POST /api/Payment/orders/{orderId}/checkout`.
- Client may omit provider to use backend default, or send `CashOnDelivery`.
- Backend resolves the provider strategy.
- Cash on delivery creates a pending payment transaction without redirect.
- Client can fetch transaction detail with `GET /api/Payment/transactions/{id}`.
- Webhook endpoint can update transaction status when providers require it.
- Successful payment publishes payment success for Order to mark placed orders as paid.

## Client Behavior
- Render methods from the API rather than hardcoding UI only.
- For `CashOnDelivery`, do not expect a checkout URL.
- Treat unsupported provider errors as validation errors.

## Contract Pointers
- API docs: `src/Modules/Payment/Api/api.md`
- DTOs: `src/Modules/Payment/DTOs`
- Shared aliases: `src/clients/shared/api/payment-types.ts`

## Claude Completion Note

After implementing this requirement, move this file to `requirements/done/`.
