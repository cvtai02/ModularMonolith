# Create Product Backend Summary Flow

## Status
Implemented and moved to `requirements/done/`.

## Create Flow
- Backend receives `POST /api/ProductCatalog/products`.
- ProductCatalog validates category, slug uniqueness, options, variants, pricing, and media payload.
- ProductCatalog creates:
  - Product
  - Product shipping
  - Product media
  - Options and option values
  - Variants and variant option values
  - Variant shipping
- ProductCatalog initializes inventory records through the Inventory module.
- Response returns the full product DTO with media, options, variants, shipping, pricing, and inventory values.

## Update Flow
- Backend receives `PUT /api/ProductCatalog/products/{id}`.
- Update is full-replace, not partial patch.
- ProductCatalog replaces product fields, product media, options, variants, variant shipping, and inventory configuration from the submitted payload.
- Media update is also full-replace:
  - Submitted `MediaKeys`, `Medias`, or fallback `ImageUrl` become the new media set.
  - Omitted media removes existing product media.
- Response returns the updated full product DTO.

## Inventory Flow
- Product-level inventory stores tracking policy and backorder policy.
- Variant inventory can inherit product inventory or override it.
- Variant tracking stores quantity/reserved values.
- Product create/update coordinates ProductCatalog data and Inventory records.

## Contract Pointers
- API docs: `src/Modules/ProductCatalog/Api/api.md`
- Product DTOs: `src/Modules/ProductCatalog/DTOs/Products`
- Inventory DTOs: `src/Modules/Inventory/DTOs/Inventory`
