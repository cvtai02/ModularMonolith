# Product Save Inventory Flow

## Scope

Add-product and edit-product must save catalog data and inventory data with two API calls.

## Shared Clients

Use existing shared clients:

- `productCatalogClient.createProduct(input)`
- `productCatalogClient.updateProduct(productId, input)`
- `inventoryClient.initializeProductInventory(productId, input)`

Types:

- `CreateProductRequest`
- `UpdateProductRequest`
- `ProductResponse`
- `InitializeProductInventoryRequest`
- `InitializeProductInventoryResponse`

## Add Product Flow

1. Build and submit `CreateProductRequest` to ProductCatalog.
2. Wait for `ProductResponse`.
3. Use `ProductResponse.id` as `productId`.
4. Use `ProductResponse.variants[].id` for inventory variant rows.
5. Submit `InitializeProductInventoryRequest` to Inventory.
6. Show success only after both calls succeed.

```ts
const product = await productCatalogClient.createProduct(productInput);

await inventoryClient.initializeProductInventory(product.id, {
  trackInventory: inventoryInput.trackInventory,
  allowBackorder: inventoryInput.allowBackorder,
  lowStockThreshold: inventoryInput.lowStockThreshold,
  variants: product.variants.map((variant) => {
    const draft = findDraftVariantByReturnedVariant(variant);
    return {
      variantId: variant.id,
      useProductInventory: draft.useProductInventory,
      trackInventory: draft.trackInventory,
      allowBackorder: draft.allowBackorder,
      lowStockThreshold: draft.lowStockThreshold,
      quantity: draft.quantity,
    };
  }),
});
```

## Edit Product Flow

1. Build and submit `UpdateProductRequest` to ProductCatalog.
2. Wait for updated `ProductResponse`.
3. Use `ProductResponse.id` as `productId`.
4. Use `ProductResponse.variants[].id` for inventory variant rows.
5. Submit `InitializeProductInventoryRequest` to Inventory.
6. Show success only after both calls succeed.

```ts
const product = await productCatalogClient.updateProduct(productId, productInput);

await inventoryClient.initializeProductInventory(product.id, {
  trackInventory: inventoryInput.trackInventory,
  allowBackorder: inventoryInput.allowBackorder,
  lowStockThreshold: inventoryInput.lowStockThreshold,
  variants: product.variants.map((variant) => {
    const draft = findDraftVariantByReturnedVariant(variant);
    return {
      variantId: variant.id,
      useProductInventory: draft.useProductInventory,
      trackInventory: draft.trackInventory,
      allowBackorder: draft.allowBackorder,
      lowStockThreshold: draft.lowStockThreshold,
      quantity: draft.quantity,
    };
  }),
});
```

## Important Rules

- Do not assume frontend draft variant ids are final when product/variant id is auto-generated.
- Always use returned `ProductResponse.id` and `ProductResponse.variants[].id` for Inventory.
- ProductCatalog owns product text, price, media, options, and variant identity.
- Inventory owns real stock quantity and inventory policy used by ordering/reservation.
- If ProductCatalog save succeeds but Inventory initialize fails, show a partial-save error and let admin retry inventory save.
