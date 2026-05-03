# Admin Place Order For Customer Frontend Handoff

## Completion Summary

Create order page at `/orders/new` with customer picker (searches via `listAdminProfiles`), product/variant picker with expandable product rows and inline quantity controls (using `listProduct`), running total display, and full shipping address form. Submits via `adminCreateOrder` and navigates to the new order detail on success. Completed 2026-05-03.

---

Claude owns the admin frontend implementation for this feature.

## Goal

Add UI support for tenant admins to place an order for an existing customer.

After frontend implementation, move this file to `requirements/frontend-handoff/done/` with a short completion summary.

## API Client

Use the Order client contract:

- `src/clients/shared/api/contracts/order.ts`

Client methods to use:

- `adminCreateOrder(input)` for placing an order for a selected customer.

Use the Account client contract for customer selection:

- `src/clients/shared/api/contracts/account.ts`

Client methods to use:

- `listAdminAccountProfiles(query)` for customer search/listing.
- `getAdminAccountProfileById(id)` if the UI needs selected customer detail.

Use the Product Catalog client contract for product/variant selection:

- `src/clients/shared/api/contracts/productcatalog.ts`

Client methods to use:

- `listProduct(query)` for finding products and variants.

## Request And Response Shapes

`AdminCreateOrderRequest`:

- `customerProfileId: number`
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

- `customerProfileId` must refer to an existing active customer profile.
- Staff/admin profiles cannot be used as the customer.
- Customer profile must be linked to an identity user.
- Order item variant IDs must be unique.
- Quantity must be greater than zero.
- Product variants must exist, be sellable, and match the selected currency.
- Shipping address required fields are validated by backend.
- Response is accepted immediately while inventory reservation continues through the existing order flow.

## Frontend UX

Admin create order page:

- Provide a customer picker with search.
- Only allow selecting customer profiles for the final submit.
- Provide a product/variant picker with quantities.
- Prevent duplicate variants locally.
- Show running totals based on selected variants and quantity when data is available.
- Provide a shipping address form.
- Submit through `adminCreateOrder(input)`.
- After success, navigate to or show the admin order detail for the returned order.
