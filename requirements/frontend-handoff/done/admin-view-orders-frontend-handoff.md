# Admin View Orders Frontend Handoff

## Completion Summary

Orders list at `/orders` with search, status filter, pagination, and row navigation to detail. Order detail at `/orders/:id` shows summary, rejection reason banner, shipping address, and line items. Orders nav entry was already wired in the sidebar. Completed 2026-05-03.

---

Claude owns the admin frontend implementation for this feature.

## Goal

Add UI support for tenant admins to view orders.

After frontend implementation, move this file to `requirements/frontend-handoff/done/` with a short completion summary.

## API Client

Use the Order client contract:

- `src/clients/shared/api/contracts/order.ts`

Client methods to use:

- `listAdminOrders(query)` for the admin orders table.
- `getAdminOrderById(id)` for order detail.

## Request And Response Shapes

`ListAdminOrdersQuery`:

- `pageNumber?: number`
- `pageSize?: number`
- `status?: "Draft" | "PendingInventory" | "Placed" | "Paid" | "Rejected" | "Cancelled" | "Shipped" | null`
- `search?: string | null`

`ListAdminOrdersResponse`:

- `items: OrderSummaryResponse[]`
- `pageNumber: number`
- `totalPages: number`
- `totalCount: number`
- `hasPreviousPage: boolean`
- `hasNextPage: boolean`

`OrderSummaryResponse`:

- `id: number`
- `code: string`
- `customerId?: string | null`
- `status: "Draft" | "PendingInventory" | "Placed" | "Paid" | "Rejected" | "Cancelled" | "Shipped"`
- `currencyCode: string`
- `totalAmount: number`
- `rejectionReason?: string | null`
- `lineCount: number`
- `createdAt: string`

`OrderResponse`:

- `id: number`
- `code: string`
- `customerId?: string | null`
- `status: "Draft" | "PendingInventory" | "Placed" | "Paid" | "Rejected" | "Cancelled" | "Shipped"`
- `currencyCode: string`
- `totalAmount: number`
- `inventoryReservationId?: number | null`
- `rejectionReason?: string | null`
- `shippingAddress?: Address | null`
- `lines: OrderLineResponse[]`

`OrderLineResponse`:

- `id: number`
- `productId: number`
- `variantId: number`
- `productName: string`
- `variantName: string`
- `imageUrl: string`
- `unitPrice: number`
- `quantity: number`
- `subtotal: number`

## API Behavior

- Admin order list supports pagination.
- `status` filters the list when supplied.
- `search` matches order code or customer id.
- Blank search behaves like no search.
- Newest orders are returned first.
- Detail returns `404` when the order does not exist.

## Frontend UX

Admin orders table:

- Show order code, customer id, status, total, line count, created date, and rejection reason when present.
- Include search input.
- Include status filter.
- Include pagination controls.
- Link each row to detail.

Admin order detail:

- Show order summary, shipping address, inventory reservation id, status, totals, and line items.
- Display line item product image, product name, variant name, unit price, quantity, and subtotal.
- Show rejection reason prominently for rejected orders.
