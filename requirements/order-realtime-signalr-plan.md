# Order Realtime SignalR Summary Flow

## Summary
Use SignalR to notify authenticated users when their submitted order becomes placed.

## Flow
- Client creates an order through `POST /api/Order/orders`.
- Client connects to `/hubs/orders`.
- Client invokes `JoinOrder(orderId)` after creating or opening the order.
- Inventory reservation completes asynchronously.
- Order transitions to `Placed`.
- Backend emits `OrderPlaced` to the order group.
- Client updates the checkout/order detail UI without waiting for the next poll.

## Client Behavior
- Keep polling as a fallback.
- Use realtime event as a fast confirmation path.
- Do not rely on SignalR as the only source of truth.

## Contract Pointers
- API docs: `src/Modules/Order/Api/api.md`
- Order DTOs: `src/Modules/Order/DTOs/Orders`
- Shared aliases: `src/clients/shared/api/order-types.ts`

## Claude Completion Note

After implementing this requirement, move this file to `requirements/done/`.
