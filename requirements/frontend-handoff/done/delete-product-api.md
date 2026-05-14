# Delete Product API

## Goal

Allow admin product management UI to delete a product.

## Backend Endpoint

Delete inventory first:

```txt
DELETE /api/Inventory/products/{productId}
```

Auth: `TenantAdminUp`.

Behavior:

- Returns `204 No Content`.
- Idempotent: returns `204` even when inventory rows are already missing.
- Deletes Inventory `ProductInventory` plus matching `VariantInventory` rows by `productId`.
- Inventory child rows under variant inventory are removed by database cascade.

Then delete catalog product:

```txt
DELETE /api/ProductCatalog/products/{id}
```

Auth: `TenantAdminUp`.

Behavior:

- Returns `204 No Content` when the product exists and is deleted.
- Returns `404 Not Found` when the product id does not exist.
- Deletes the ProductCatalog product and its catalog child rows through database cascade.
- ProductCatalog cascade includes collection product links, product media, product metric, product shipping, variants, variant metrics, variant shipping, and variant option values.
- This endpoint does not delete Inventory module records by itself.

## Shared Client

Use both:

```ts
inventoryClient.deleteProductInventory(id)
productCatalogClient.deleteProduct(id)
```

Contracts:

```txt
src/clients/shared/api/contracts/inventory.ts
src/clients/shared/api/contracts/productcatalog.ts
```

Implementations:

```txt
src/clients/shared/api/clients/inventory.ts
src/clients/shared/api/clients/productcatalog.ts
```

Types:

```ts
export type DeleteProductInventoryResponse = void;
export type DeleteProductResponse = void;
```

from:

```txt
src/clients/shared/api/types/productcatalog.ts
```

## Frontend Flow

1. Use product `id`, not `slug`.
2. Call `inventoryClient.deleteProductInventory(id)`.
3. Call `productCatalogClient.deleteProduct(id)`.
4. After success, remove the item from the current product list or refetch the list.

## Frontend Notes

- Show a confirmation UI before deleting.
- Show a not-found/error state if the API returns `404`.
- If inventory cleanup succeeds but product delete returns `404`, show not found and refresh the product list.
- Move this handoff to `requirements/frontend-handoff/done/` after implementation.
