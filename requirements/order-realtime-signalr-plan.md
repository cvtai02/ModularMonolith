# Order Realtime SignalR Plan

## Summary
Add a backend SignalR path that notifies authenticated users when their newly created order becomes `Placed` after inventory reservation succeeds.

## Backend Contract
- Hub: `/hubs/orders`
- Auth: required
- Client invokes `JoinOrder(orderId: number)` after order creation.
- Server emits `OrderPlaced` when inventory is reserved and the order status changes to `Placed`.
- The backend only lets an authenticated user join an order group when `Orders.CustomerId` matches the current user id.
- Guest orders currently have no SignalR subscription path.

## Request And Response Types
- Order creation uses `CreateOrderRequest` and `CreateOrderResponse` from `src/clients/shared/api/api-types.ts`.
- Order polling uses `GetOrderParams` and `OrderResponse`.
- SignalR `JoinOrder` has no generated HTTP type alias; its argument is `orderId: number`.
- SignalR `OrderPlaced` has no generated HTTP response alias; use the payload shape below.

## Type Properties
- `CreateOrderRequest`: [CreateOrderRequest.cs](../src/Modules/Order/DTOs/Orders/CreateOrderRequest.cs)
- `CreateOrderResponse`: [OrderResponse.cs](../src/Modules/Order/DTOs/Orders/OrderResponse.cs)
- `GetOrderParams`: `{ id: number }`.
- `OrderResponse`: [OrderResponse.cs](../src/Modules/Order/DTOs/Orders/OrderResponse.cs)
- `JoinOrder(orderId: number)`: client invokes with the created order id.
- `OrderPlaced` SignalR payload:
  - `orderId: number`
  - `orderCode: string`
  - `reservationId: number`
  - `status: "Placed"`

## OrderPlaced Payload
```json
{
  "orderId": 1,
  "orderCode": "ORD-20260430-ABCDEFGHIJ",
  "reservationId": 10,
  "status": "Placed"
}
```

## Claude Frontend Handoff
When `POST api/Order/orders` returns, connect to `/hubs/orders` with the current user's auth token, invoke `JoinOrder` with the returned order id, and listen for `OrderPlaced`.
## Claude Completion Note

After implementing this requirement, move this file to `requirements/done/`.