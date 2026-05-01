# Order Products API Handoff

## Backend Contract

Order checkout is direct item checkout. The client sends selected variants and quantities to `POST /api/Order/orders`; the backend validates the variants through ProductCatalog, snapshots price/product data, creates a `PendingInventory` order, and publishes `OrderSubmitted`. Inventory reserves stock from that event and publishes either `InventoryReserved` or `ReservationRejected`.

## Request And Response Types

- Import aliases from `src/clients/shared/api/api-types.ts`.
- `POST /api/Order/orders`
  - Request: `CreateOrderRequest`.
  - Response: `CreateOrderResponse`.
- `GET /api/Order/orders/{id}`
  - Path params: `GetOrderParams`.
  - Response: `OrderResponse`.
- `GET /api/Order/orders`
  - Query: `ListOrdersQuery`.
  - Response: `ListOrdersResponse`.

## Type Properties

`CurrencyCode` values currently used by checkout:
- `VND`
- `USD`

`OrderStatus` values:
- `Draft`
- `PendingInventory`
- `Placed`
- `Paid`
- `Rejected`
- `Cancelled`
- `Shipped`

DTO-backed order types:
- `Address`: [Address.cs](../src/SharedKernel/DTOs/Address.cs)
- `CreateOrderRequest` and `CreateOrderItemRequest`: [CreateOrderRequest.cs](../src/Modules/Order/DTOs/Orders/CreateOrderRequest.cs)
- `CreateOrderResponse`, `OrderResponse`, and `OrderLineResponse`: [OrderResponse.cs](../src/Modules/Order/DTOs/Orders/OrderResponse.cs)

`GetOrderParams`:
- `id: number`

`ListOrdersQuery`:
- `pageNumber?: number`
- `pageSize?: number`
- `status?: OrderStatus | null`
- `search?: string | null`

`ListOrdersResponse`:
- `items: OrderSummaryResponse[]`
- `pageNumber: number`
- `totalPages: number`
- `totalCount: number`
- `hasPreviousPage: boolean`
- `hasNextPage: boolean`

`OrderSummaryResponse`: [OrderSummaryResponse.cs](../src/Modules/Order/DTOs/Orders/OrderSummaryResponse.cs)

### Endpoints

- `POST /api/Order/orders`
  - Request: `{ currencyCode?: "VND" | "USD", shippingAddress, items: [{ variantId, quantity }] }`
  - Response: `202 Accepted` with pending order detail: `id`, `code`, `customerId`, `status`, `currencyCode`, `totalAmount`, `shippingAddress`, `lines`.
- `GET /api/Order/orders/{id}`
  - Response: `200 OK` order detail, or `404` when not found for the current tenant.
- `GET /api/Order/orders`
  - Query: `pageNumber`, `pageSize`, optional `status`, optional `search`.
  - Response: paged order summaries.

## Validation Behavior

- `items` is required, must contain `1..50` rows, and duplicate `variantId` values are rejected.
- Each `quantity` must be greater than `0`.
- `shippingAddress.ownerName`, `phoneNumber`, `country`, and `line1` are required.
- Unknown variants, inactive/unlisted product variants, unsupported currency, and currency mismatch return validation errors before inventory events are published.
- Inventory rejects checkout when tracked stock is insufficient and backorder is not allowed.
- V1 reserves and commits inventory through integration events, but does not create payment records or payment intents.

## Event Flow

- Order publishes `OrderSubmitted` after saving the pending order.
- Inventory handles `OrderSubmitted` and publishes `InventoryReserved` or `ReservationRejected`.
- Order handles `InventoryReserved`, moves the order to `Placed`, and publishes `OrderPlaced`.
- Inventory handles `OrderPlaced`, commits reserved stock, and publishes `ReservationCommited`.
- Order handles `ReservationRejected` and moves the order to `Rejected`.

## Claude Client Notes

- Use `src/clients/shared/api/order-types.ts` after API types are regenerated.
- Build checkout from selected variant ids and quantities; do not send product names or prices because the backend snapshots them.
- Treat `202 Accepted` as checkout submitted, not final confirmation.
- Poll `GET /api/Order/orders/{id}` until the order status is `Placed` or `Rejected`.
- Show confirmation from the order detail when status is `Placed`: order `code`, `totalAmount`, `currencyCode`, `shippingAddress`, and `lines`.
- Show inventory rejection errors from `rejectionReason` when status is `Rejected`.
- Keep payment UI and inventory reservation messaging out of v1.

## Backend Migration Note

Order line snapshots add `ProductId`, `VariantName`, and `ImageUrl` fields to `OrderLine`. Order adds `PendingInventory`/`Rejected` statuses plus inventory reservation and rejection fields. A backend migration must be generated when dotnet commands are allowed; Codex did not run dotnet build, test, run, or migration commands.
## Claude Completion Note

After implementing this requirement, move this file to `requirements/done/`.