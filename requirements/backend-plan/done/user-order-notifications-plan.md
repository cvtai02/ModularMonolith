# User Order Notifications Backend Plan

## Goal

Authenticated users should receive realtime notifications about their own orders as order state changes.

The backend already has an order SignalR hub at `/hubs/orders`, an order-specific group join method, and an `OrderPlaced` notification when inventory reservation succeeds. This work should extend that order notification surface so users can receive useful order lifecycle notifications without exposing another customer's order events.

## API Capability

Use the existing Order module realtime boundary:

- hub: `/hubs/orders`
- auth: authenticated user

Keep the current order-specific subscription behavior:

- `JoinOrder(orderId)`
- `LeaveOrder(orderId)`

Add a user-level subscription behavior so a logged-in user can listen for all of their order notifications:

- join the authenticated user's order notification group
- leave the authenticated user's order notification group

Server notifications should be sent to:

- the order-specific group for users currently viewing one order
- the authenticated customer's user-level group when `Order.CustomerId` is known

## Notification Events

At minimum, users should be notified when:

- inventory is reserved and the order becomes `Placed`
- inventory reservation is rejected or expires and the order becomes `Rejected`
- payment succeeds and the order becomes `Paid`

Notification payloads should be frontend-friendly and consistent across events:

- notification type or event name
- order id
- order code
- status
- optional reservation id
- optional rejection reason
- timestamp

Existing `OrderPlaced` behavior should remain compatible where reasonable. If a new generic event is added, document both the old and new event names.

## Affected Backend Boundaries

Primary module:

- `src/Modules/Order/`

Expected backend updates:

- Order hub methods/groups under `src/Modules/Order/Api/Hubs/`
- notification payload DTO/class under `src/Modules/Order/Core/Notifications/`
- notifier methods under `src/Modules/Order/Core/Notifications/`
- event handlers that transition order status under `src/Modules/Order/Core/EventHandlers/`
- concise realtime summary in `src/Modules/Order/Api/api.md`

Shared API client changes are not expected unless the existing shared contract already documents hub integration. If frontend handoff needs TypeScript event shape, put it in the handoff document instead of editing frontend-owned files.

## Authorization And Privacy

Only authenticated users can connect to `/hubs/orders`.

`JoinOrder(orderId)` should continue to verify that the authenticated user's subject id matches `Order.CustomerId`.

The new user-level notification group should be based on the authenticated user's subject id from claims. A user should never be able to provide another user's id to join that user's group.

Admin order notifications should remain separate on the existing admin notification hub unless explicitly changed later.

## Validation Behavior

Hub methods should reject missing or invalid authenticated users.

Order-specific join should reject invalid order ids or inaccessible orders with the existing generic "order is not available" style message.

Notification emission should no-op when an order has no customer id.

## Frontend Handoff

Write a Claude-facing handoff under `requirements/frontend-handoff/`.

The handoff should include:

- hub URL
- auth requirement
- hub methods to call
- server event names
- notification payload shape
- when to use order-specific subscription vs user-level subscription
- instruction to move the handoff to `requirements/frontend-handoff/done/` after frontend implementation

## Migration Impact

No schema migration is expected. This should be realtime behavior over existing order fields.
