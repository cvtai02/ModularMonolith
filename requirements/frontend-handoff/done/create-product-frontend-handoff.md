# Create Product Frontend Summary Flow

## Status
Implemented and moved to `requirements/done/`.

## Flow
- Admin opens the create/edit product screen.
- Frontend loads categories from `GET /api/ProductCatalog/categories`.
- Admin fills product sections:
  - General info
  - Media
  - Product options
  - Variants
  - Pricing
  - Inventory
  - Shipping
- Media upload flow:
  - Request presigned URLs from Content.
  - Upload files directly to storage.
  - Confirm uploads with Content.
  - Send returned storage keys in the product payload.
- Variant flow:
  - Options generate variant combinations.
  - Variants can inherit product pricing, inventory, and shipping defaults.
  - Variant overrides are sent in the variant payload.
- Create submit:
  - Send `POST /api/ProductCatalog/products` with the complete create payload.
- Edit submit:
  - Send `PUT /api/ProductCatalog/products/{id}` with the complete update payload.
  - Update is full-replace, including media. Send the complete desired media set.

## Contract Pointers
- Shared aliases: `src/clients/shared/api/api-types.ts`
- ProductCatalog aliases: `src/clients/shared/api/productcatalog-types.ts`
- Content aliases: `src/clients/shared/api/content-types.ts`
- Inventory aliases: `src/clients/shared/api/inventory-types.ts`
