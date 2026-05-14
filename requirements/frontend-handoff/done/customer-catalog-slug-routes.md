# Customer Catalog Slug Routes Frontend Handoff

## Goal

Use slug-based customer catalog APIs for storefront routes.

## New Customer APIs

```http
GET /api/ProductCatalog/customer/categories/by-slug/{slug}
GET /api/ProductCatalog/customer/collections/by-slug/{slug}
GET /api/ProductCatalog/customer/products/by-slug/{slug}
```

These are public endpoints.

They keep the same storefront-safe behavior:

- category slug lookup returns active categories only
- collection slug lookup returns collection detail with active products in active categories only
- product slug lookup returns active products in active categories only

## Shared Client

Use `src/clients/shared/api/clients/productcatalog.ts`.

```ts
productCatalogClient.getCustomerCategoryBySlug(slug)
productCatalogClient.getCustomerCollectionBySlug(slug)
productCatalogClient.getCustomerProductBySlug(slug)
```

Prefer these methods for customer-facing routes.

The existing id/name methods remain available:

```ts
productCatalogClient.getCustomerCategory(name)
productCatalogClient.getCustomerCollection(id)
productCatalogClient.getCustomerProduct(id)
```

## Frontend Notes

For public storefront URLs, route by `slug` from list/card responses:

- product cards use `product.slug`
- category links use `category.slug`
- collection links use `collection.slug`

Do not call staff/admin methods from storefront pages.

Move this file to `requirements/frontend-handoff/done/` after implementation.
