# Backend Security And Product Variant Fixes Frontend Handoff

Claude, move this file to `requirements/frontend-handoff/done/` after implementation.

## Shared Client Contracts

- `src/clients/shared/api/contracts/order.ts`
- `src/clients/shared/api/contracts/payment.ts`
- `src/clients/shared/api/contracts/productcatalog.ts`
- `src/clients/shared/api/contracts/inventory.ts`

No request or response property shape changed.

## Order Access

- `orderClient.getOrder(code)` now requires an authenticated customer and only returns the current user's order.
- `orderClient.listOrders(input)` now requires an authenticated customer and only returns the current user's orders.
- Admin order methods still return tenant-wide orders:
  - `orderClient.listAdminOrders(input)`
  - `orderClient.getAdminOrder(code)`

Frontend should not call customer order list/detail endpoints without an access token.

## Checkout Ownership

- `paymentClient.createCheckout(orderCode, input)` now rejects anonymous orders and orders owned by another customer.
- If backend returns validation for `orderCode`, show the error near checkout/payment action.

## Admin Write Authorization

These existing write calls now require `TenantAdminUp`:

- `productCatalogClient.createProduct(input)`
- `productCatalogClient.updateProduct(id, input)`
- Category create/update/delete methods
- Collection create/update/delete/add-products methods
- Inventory initialize/import methods

Make sure admin pages send the admin access token for these calls.

## Product Variant Editing

`productCatalogClient.updateProduct(id, input)` now supports adding new variants when adding option values.

Rules:

- Existing variant option values still cannot be changed.
- Existing variants should keep their `id`.
- New variants may omit `id`; backend generates one.
- New variant `optionValues` must reference existing or newly submitted `options[].values`.
- Backend rejects duplicate variant combinations.

When admin adds a new option value, rebuild the missing variant combinations and include them in the same update request.
