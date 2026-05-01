# Admin Product Variant Display Summary Flow

## Status
Implemented and moved to `requirements/done/`.

## Flow
- Admin opens the product list using `GET /api/ProductCatalog/products`.
- List supports searching, filtering, pagination, and sorting from shared query aliases.
- Admin opens a product detail with `GET /api/ProductCatalog/products/{id}`.
- Product detail should show:
  - Product-level identity, status, category, slug, images, pricing, inventory, and shipping.
  - Variant-level pricing, image, inventory, shipping, and option values.
- Variant display should make inherited vs overridden values easy to scan.
- Editing from this view uses `PUT /api/ProductCatalog/products/{id}` with the full update payload.

## Contract Pointers
- API docs: `src/Modules/ProductCatalog/Api/api.md`
- Shared frontend aliases: `src/clients/shared/api/productcatalog-types.ts`
- DTOs: `src/Modules/ProductCatalog/DTOs`
