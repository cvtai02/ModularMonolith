# Admin Product And Variant Display Plan

## Summary
Build an admin product detail vision that makes product-level data and variant-level differences easy to scan, compare, and edit. Claude owns the admin UI implementation; Codex should only support backend/API contract gaps if needed.

## Existing Backend Contract
- Use `GET /api/ProductCatalog/products` for the product table with pagination, search, category, status, and sorting.
- Use `GET /api/ProductCatalog/products/{id}` for the product detail page.
- `ProductResponse` already includes product media, options, variants, pricing, inventory, tax, shipping dimensions, status, category, slug, and stock/reserved counts.
- `VariantResponse` includes pricing override flags, inventory values, shipping override flags, image value, and selected option values.

## Admin UI Vision For Claude
- Product list page:
  - Dense table optimized for scanning: thumbnail, name, category, status, price, stock, reserved, variant count, last modified if available.
  - Top controls: search, category filter, status filter, sort, page size.
  - Row click opens product detail; primary action opens edit flow.
- Product detail page:
  - Header: product name, status, category, slug, primary image, price range, total stock/reserved.
  - Tabs: `Overview`, `Variants`, `Media`, `Inventory`, `Shipping`.
  - Overview shows description, product-level pricing/tax, base inventory, and base shipping values.
- Variant display:
  - Use a compact comparison table.
  - Columns: option combination, image, effective price, compare-at price, cost, stock, reserved, track inventory, allow backorder, physical product, weight/dimensions.
  - Show inherited values visually when `UseProductPricing`, `UseProductInventory`, or `UseProductShipping` is true.
  - Highlight overrides only where variant values differ from product defaults.
- Variant drill-in:
  - Clicking a variant opens a side panel or detail section with all option values, pricing, inventory, shipping, and image.
  - Do not make users leave the product detail page just to inspect one variant.

## Backend Support Needed
- Confirm/fix variant image contract: `VariantResponse.ImageUrl` should return a public URL or an empty string. Current mapper appears to return `ImageKey` directly.
- If the product list becomes slow, add a lightweight admin list DTO later; do not optimize early unless measured.
- If Claude needs last modified in the product table and it is not present in `ProductResponse`, add `Created` and `LastModified` to product response DTOs.

## Acceptance Criteria
- Admin can find a product by search/filter and open detail.
- Admin can see product-level defaults and every variant in one detail view.
- Admin can tell which variant fields inherit product defaults versus override them.
- Variant option combinations are readable without opening each variant.
- Inventory and reserved counts are visible at both product and variant levels.
- Media thumbnails render from URLs usable by the browser.

## Handoff Notes
- Claude should not need new frontend-generated types if existing `productcatalog-types.ts` is current.
- If backend changes are made for image URL or timestamps, Codex must update `src/Modules/ProductCatalog/Api/api.md` and `src/clients/shared/api/productcatalog-types.ts` as needed, while avoiding `src/clients/shared/api/lib`.
