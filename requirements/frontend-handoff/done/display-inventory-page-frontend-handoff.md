# Display Inventory Page Frontend Handoff

Claude owns the admin frontend implementation for this feature.

## Goal

Add an admin inventory display page that lets staff review product and variant inventory status.

The first version should focus on display and navigation, not import or bulk editing.

## API Client

Use the Product Catalog client contract for inventory display data:

- `src/clients/shared/api/contracts/productcatalog.ts`

Client methods to use:

- `listProduct(query)` for the inventory table.
- `getProduct(id)` for product-level inventory detail when the page drills into one product.

Use the Inventory client contract only for existing inventory mutation flows:

- `src/clients/shared/api/contracts/inventory.ts`

Client method currently available:

- `initializeProductInventory(productId, input)`

## API Behavior

- Product responses include product-level inventory display fields such as stock, reserved, track inventory, low-stock threshold, and allow backorder.
- Product responses include variant rows with variant inventory fields such as stock, reserved, track inventory, low-stock threshold, and allow backorder.
- Product Catalog is currently the read source for inventory display.
- Inventory currently exposes initialization/update behavior, not a dedicated inventory list query.
- If the UI needs a dedicated inventory-only listing, filtering, import, or audit history API, document that backend gap instead of deriving unsupported behavior in frontend state.

## Frontend UX

Inventory index page:

- Show a dense admin table optimized for scanning stock status.
- Include product name, primary image, category, status, stock, reserved, available quantity, low-stock threshold, tracking status, and backorder status when available.
- Use clear low-stock and out-of-stock visual states.
- Support existing product list filters/search where available.
- Link each row to the product edit/detail page or an inventory detail view if one exists.

Variant inventory display:

- For products with variants, show variant rows or an expandable product row.
- Show variant option values so staff can distinguish variants.
- Show stock, reserved, available, tracking, threshold, and backorder values per variant.

Empty/loading/error states:

- Show a normal loading state while product inventory data is loading.
- Show an empty state when no products match filters.
- Surface validation/API errors using existing admin error patterns.

## Notes

The planned import variant inventory backend work is separate. Do not build import UI from this handoff unless a later import-specific handoff is added.

After frontend implementation, move this file to `requirements/frontend-handoff/done/` with a short completion summary.
