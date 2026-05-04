# User Order Notifications Frontend Handoff

## Completed

- Installed `@microsoft/signalr` in nekomin.
- `app/lib/order-hub.ts` — `OrderNotification` type, hub URL, `notificationKey` dedup helper, `notificationMessage` copy per event type.
- `app/lib/auth.ts` — stub `getAccessToken()` returning `null`; replace with real token retrieval once auth is implemented.
- `app/hooks/use-my-orders-hub.ts` — session-wide hook; connects with auth token, calls `JoinMyOrders`/`LeaveMyOrders`, deduplicates via `notificationKey`, exposes `{ notifications, clear }`.
- `app/hooks/use-order-detail-hub.ts` — order-specific hook for detail pages; calls `JoinOrder(orderId)`/`LeaveOrder(orderId)`, fires `onNotification` callback for query refresh.
- `app/components/notification-center.tsx` — bell icon with unread badge, dropdown list of notifications with human-readable messages and timestamps, "Clear all" action.
- `app/layout.tsx` — sticky header with `<NotificationCenter />` added session-wide.

**Auth gap:** `getAccessToken` in `app/lib/auth.ts` must return the authenticated user's bearer token. Until then, the hub never connects and the bell stays silent.

## Goal

Let authenticated users receive realtime notifications about their own order lifecycle changes.

Move this file to `requirements/frontend-handoff/done/` after frontend implementation.

## Hub

Use the existing Order SignalR hub:

```text
/hubs/orders
```

Auth is required. Connect with the same authenticated user token used for user order APIs.

## Hub Methods

Use user-level subscription for a general notification center, account area, or active session-wide listener:

```ts
connection.invoke("JoinMyOrders");
connection.invoke("LeaveMyOrders");
```

Use order-specific subscription when viewing a single order detail page:

```ts
connection.invoke("JoinOrder", orderId);
connection.invoke("LeaveOrder", orderId);
```

`JoinOrder(orderId)` only succeeds when the authenticated user owns that order. The frontend should treat failures as "order is not available".

## Server Events

Existing event kept for compatibility:

```ts
connection.on("OrderPlaced", (message) => {
  // order-specific placed notification
});
```

New generic event:

```ts
connection.on("OrderNotification", (message) => {
  // placed, rejected, or paid notification
});
```

The generic event is sent to the order-specific group and to the authenticated customer's user-level group when the order has a customer id.

If a screen subscribes to both `JoinMyOrders()` and `JoinOrder(orderId)`, it may receive the same `OrderNotification` twice. Dedupe by `type`, `orderId`, `status`, and `occurredAt` if both subscriptions are active.

## Notification Payload

Backend payload class:

- `src/Modules/Order/Core/Notifications/OrderNotification.cs`

Frontend-facing shape:

```ts
type OrderNotification = {
  type: "OrderPlaced" | "OrderRejected" | "OrderPaid" | string;
  orderId: number;
  orderCode: string;
  status: string;
  reservationId?: number | null;
  rejectionReason?: string | null;
  occurredAt: string;
};
```

Current `type` values:

- `OrderPlaced`
- `OrderRejected`
- `OrderPaid`

## UX Notes

For `OrderPlaced`, show that the order was accepted and inventory was reserved.

For `OrderRejected`, show the rejection reason when present.

For `OrderPaid`, show that payment completed successfully.

Refresh the relevant order detail or order list after receiving a notification if the UI needs full line/shipping/payment details.
