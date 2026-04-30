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
