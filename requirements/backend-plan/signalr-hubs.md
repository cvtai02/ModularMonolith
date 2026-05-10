# SignalR Hubs

## Auth Token

SignalR clients can pass the bearer access token as `access_token` query string for hub connections.

Code:

- `src/AppHost/Buildings/AddWebSevices.cs` - reads `access_token` for `/hubs/notifications` and `/hubs/orders`.

## Admin Notifications Hub

Endpoint:

```http
/hubs/notifications
```

Code:

- `src/Modules/Account/Module.cs` - maps `/hubs/notifications`.
- `src/Modules/Account/Api/Hubs/NotificationHub.cs` - hub class.
- `src/Modules/Account/Core/EventHandlers/AdminOrderPlacedHandler.cs` - sends notifications.
- `src/Modules/Account/Core/Notifications/AdminOrderPlacedNotification.cs` - payload shape.

Auth:

- Requires `TenantAdminUp`.
- Only tenant admins should connect.

Server Methods:

- None currently.
- The client only connects and listens for server-pushed events.

Client Events:

### `NotificationReceived`

Sent when an admin notification is created.

Current sender:

- `AdminOrderPlacedHandler` sends this after persisting a notification row.

Payload:

```ts
type AdminOrderPlacedNotification = {
  type: "OrderPlaced";
  orderCode: string;
  customerId?: string | null;
  totalAmount: number;
  currencyCode: string;
  reservationId?: number | null;
  status: string;
  createdAt: string;
};
```

What it does:

- Notifies connected admins that an order was placed.
- The backend also writes a persistent notification row before pushing this event.
- Frontend should update the admin notification inbox/badge and optionally show a toast.

## Order Realtime Hub

Endpoint:

```http
/hubs/orders
```

Code:

- `src/Modules/Order/Module.cs` - maps `/hubs/orders`.
- `src/Modules/Order/Api/Hubs/OrderHub.cs` - hub class and callable methods.
- `src/Modules/Order/Api/Hubs/OrderRealtimeGroups.cs` - SignalR group names.
- `src/Modules/Order/Core/Notifications/OrderRealtimeNotifier.cs` - sends order events.
- `src/Modules/Order/Core/Notifications/OrderPlacedNotification.cs` - `OrderPlaced` payload.
- `src/Modules/Order/Core/Notifications/OrderNotification.cs` - `OrderNotification` payload.

Auth:

- Requires authenticated user.

Server Methods:

### `JoinOrder(orderCode: string)`

Adds the connection to one specific order group.

Rules:

- `orderCode` is trimmed.
- User must be authenticated.
- The order must exist and belong to the authenticated user by `CustomerId`.
- If access fails, backend throws `HubException("Order is not available.")`.

Use when:

- Customer is viewing a specific order detail page and needs realtime updates for that order.

### `LeaveOrder(orderCode: string)`

Removes the connection from one specific order group.

Use when:

- Customer leaves the order detail page.

### `JoinMyOrders()`

Adds the connection to the authenticated customer's aggregate order group.

Use when:

- Customer is viewing an account order list or wants updates for all their own orders.

### `LeaveMyOrders()`

Removes the connection from the authenticated customer's aggregate order group.

Use when:

- Customer leaves the order list/account area.

Client Events:

### `OrderPlaced`

Sent to the specific order group when an order is placed.

Payload:

```ts
type OrderPlacedNotification = {
  orderCode: string;
  reservationId?: number | null;
  status: string;
};
```

What it does:

- Tells a client watching a single order that the order is placed.
- This is a narrower event than `OrderNotification`.

### `OrderNotification`

Sent to:

- Specific order group: `order:{orderCode}`
- Customer aggregate group: `customer-orders:{customerId}` when the order has a customer id.

Payload:

```ts
type OrderNotification = {
  type: "OrderPlaced" | "OrderRejected" | "OrderPaid" | string;
  orderCode: string;
  status: string;
  reservationId?: number | null;
  rejectionReason?: string | null;
  occurredAt: string;
};
```

What it does:

- Provides general order state changes to customers.
- Current notification types sent by backend:
  - `OrderPlaced`
  - `OrderRejected`
  - `OrderPaid`

Frontend usage:

- On order detail page: call `JoinOrder(orderCode)` and listen for `OrderPlaced` and `OrderNotification`.
- On customer order list: call `JoinMyOrders()` and listen for `OrderNotification`.
- Refresh or patch local order state when `orderCode` matches the visible order.
