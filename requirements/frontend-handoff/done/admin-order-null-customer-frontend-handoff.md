# Admin Order Nullable Customer Frontend Handoff

## Completed

- `orders/create.tsx` — removed the `!customer` guard and toast error; send `customerProfileId: customer?.id ?? null`; customer section now shows an explicit "Guest order — no customer" dashed state with an inline "Select customer" link; "Remove" button clears a selected customer back to guest; page title changed to "Place Order".
- `orders/index.tsx` — null `customerId` renders as italic "Guest" instead of `—`.
- `orders/detail.tsx` — null `customerId` renders as italic "Guest"; label renamed from "Customer ID" to "Customer".

Claude owns the admin frontend implementation for this change.

## Goal

Allow tenant admins to create an order without selecting a customer. This creates a guest/unassigned order with `customerId: null`.

After frontend implementation, move this file to `requirements/frontend-handoff/done/` with a short completion summary.

## API Client

Use the Order client contract:

- `src/clients/shared/api/contracts/order.ts`

Client method:

- `adminCreateOrder(input)`

## Request And Response Shapes

Shared frontend type aliases:

- `AdminCreateOrderRequest` from `src/clients/shared/api/types/order.ts`
- `AdminCreateOrderResponse` from `src/clients/shared/api/types/order.ts`

`AdminCreateOrderRequest`:

- `customerProfileId?: number | null`
- `currencyCode?: string | null`
- `shippingAddress: Address`
- `items: { variantId: number; quantity: number }[]`

`Address`:

- `ownerName: string`
- `type: string`
- `phoneNumber: string`
- `email: string`
- `country: string`
- `state?: string | null`
- `city?: string | null`
- `postalCode?: string | null`
- `line1: string`
- `line2?: string | null`

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

## API Behavior

- `customerProfileId` may be omitted or sent as `null`.
- When `customerProfileId` is omitted or `null`, backend creates the order with `customerId: null`.
- When `customerProfileId` is provided, it must be greater than zero and refer to an existing active customer profile.
- When a customer is selected, staff/admin profiles cannot be used as the customer.
- When a customer is selected, the customer profile must be linked to an identity user.
- Existing order item, currency, and shipping address validation still applies.

## Frontend UX

- Keep the existing admin create order form.
- Add an explicit no-customer/guest/unassigned state to the customer picker.
- Allow submit with no selected customer by omitting `customerProfileId` or sending `customerProfileId: null`.
- If a customer is selected, continue sending the selected profile id as `customerProfileId`.
- Show returned orders with `customerId: null` as guest or unassigned instead of treating the value as an error.
