# Admin Notification Inbox Frontend Handoff

## Scope

Admin should have a persistent notification inbox backed by the Account module, plus realtime append via SignalR.

## API Type Aliases

The shared client has been manually updated in `src/clients/shared/api/clients/account.ts`, `src/clients/shared/api/contracts/account.ts`, and `src/clients/shared/api/types/account.ts`.

No generated `src/clients/shared/api/lib/openapi-types.ts` aliases exist yet for the new notification endpoints until OpenAPI clients are regenerated.

## Endpoints

### List Notifications

```text
GET /api/Account/admin/notifications
```

Auth:

```text
TenantAdminUp
```

Query:

```ts
type ListNotificationsRequest = {
  pageNumber?: number;
  pageSize?: number;
  isRead?: boolean | null;
  type?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  search?: string | null;
};
```

Response:

```ts
type PaginatedNotificationResponse = {
  items: NotificationResponse[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};
```

### Mark One Read

```text
PATCH /api/Account/admin/notifications/{id}/read
```

Path:

```ts
type MarkNotificationReadPath = {
  id: number;
};
```

Response:

```ts
type NotificationResponse = {
  id: number;
  recipientUserId: string | null;
  recipientRole: string | null;
  type: string;
  title: string;
  message: string | null;
  entityType: string | null;
  entityId: string | null;
  payloadJson: string;
  isRead: boolean;
  readAt: string | null;
  readByUserId: string | null;
  created: string;
};
```

### Mark Recent Unread Read

```text
PATCH /api/Account/admin/notifications/read
```

Response:

```ts
type PaginatedNotificationResponse = {
  items: NotificationResponse[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};
```

## Realtime

Keep using:

```text
/hubs/notifications
```

Listen for:

```text
NotificationReceived
```

Realtime payload:

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

## UI Behavior

- On admin app start, fetch unread notifications with `GET /api/Account/admin/notifications?isRead=false&pageSize=20`.
- Connect to `/hubs/notifications` with SignalR `accessTokenFactory`.
- When `NotificationReceived` arrives, prepend it to visible notifications or refetch the first page.
- Use `orderCode` from realtime payload or `entityId` from persisted notifications to link to the admin order detail page.
- `payloadJson` contains the original realtime payload serialized as JSON.
- `reservationId` can be `null`; never require it to render.
- Mark one notification read when the user opens/clicks it.
- Use mark-all-read for a "clear unread" action.
