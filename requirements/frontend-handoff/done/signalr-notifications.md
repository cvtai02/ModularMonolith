# SignalR Notifications Frontend Handoff

## Scope

Use SignalR for realtime order notifications in the admin app and customer order views.

No OpenAPI type aliases exist for SignalR hub messages in `src/clients/shared/api/api-types.ts`; the payload contracts below come from backend hub notification DTOs.

## Connection

Backend hub base paths:

- Admin notifications: `/hubs/notifications`
- Customer/order notifications: `/hubs/orders`

The backend accepts Identity bearer access tokens from the SignalR query string for these hub paths. Use SignalR `accessTokenFactory` so the browser client sends:

```ts
new HubConnectionBuilder()
  .withUrl(`${apiBaseUrl}/hubs/notifications`, {
    accessTokenFactory: () => accessToken,
  })
  .withAutomaticReconnect()
  .build();
```

Do not manually append `?access_token=` unless the SignalR client wrapper cannot use `accessTokenFactory`.

## Admin Notifications Hub

Hub path:

```text
/hubs/notifications
```

Auth:

```text
TenantAdminUp
```

Listen for server event:

```text
NotificationReceived
```

Payload:

```ts
type AdminOrderPlacedNotification = {
  type: "OrderPlaced";
  orderCode: string;
  customerId: string | null;
  totalAmount: number;
  currencyCode: string;
  reservationId: number | null;
  status: string;
  createdAt: string;
};
```

Behavior:

- Show an admin notification/toast when `type === "OrderPlaced"`.
- Use `orderCode` to link to the admin order detail page.
- `reservationId` can be `null`; do not require it in UI.
- `status` is the current backend order status, usually `Placed` for CashOnDelivery.

## Customer Order Hub

Hub path:

```text
/hubs/orders
```

Auth:

```text
Authenticated user
```

Client methods:

```ts
connection.invoke("JoinOrder", orderCode);
connection.invoke("LeaveOrder", orderCode);
connection.invoke("JoinMyOrders");
connection.invoke("LeaveMyOrders");
```

`JoinOrder(orderCode)` only succeeds when the authenticated user owns that order.

Listen for server event:

```text
OrderPlaced
```

Payload:

```ts
type OrderPlacedNotification = {
  orderCode: string;
  reservationId: number | null;
  status: string;
};
```

Listen for server event:

```text
OrderNotification
```

Payload:

```ts
type OrderNotification = {
  type: string;
  orderCode: string;
  status: string;
  reservationId: number | null;
  rejectionReason: string | null;
  occurredAt: string;
};
```

Known `OrderNotification.type` values:

- `OrderPlaced`
- `OrderRejected`
- `OrderPaid`

Behavior:

- On order detail pages, connect to `/hubs/orders`, call `JoinOrder(orderCode)`, and update the visible order status when `OrderNotification.orderCode` matches the page order.
- On account/order-list pages, call `JoinMyOrders()` and refresh or patch the matching order row when a notification arrives.
- For `OrderRejected`, show `rejectionReason` when present.
- Treat `reservationId` as optional.

## Reconnect

Use automatic reconnect. After reconnecting:

- Admin hub: no group join is needed.
- Order hub: re-run `JoinOrder(orderCode)` or `JoinMyOrders()` because SignalR group membership is per connection.

## Current Backend Flow Notes

- Inventory reservation no longer means the order is placed.
- Admin `NotificationReceived` is sent after payment succeeds and the order reaches the placed/paid stage.
- CashOnDelivery checkout creates a succeeded payment transaction and marks the order `Placed`.
- Sepay exists as a payment method but checkout/webhook currently throw `NotImplementedException`.
