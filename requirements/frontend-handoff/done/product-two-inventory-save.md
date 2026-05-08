# Product Two Inventory Save Handoff

## Goal

Add/edit product must save both inventory copies:

1. ProductCatalog inventory info for product cards/detail response.
2. Inventory module policy/quantity for reservation and stock behavior.

## Edit Product Save Flow

Call ProductCatalog first:

```ts
productCatalogClient.updateProduct(productId, productInput)
```

Endpoint:

```http
PUT /api/ProductCatalog/products/{id}
```

`productInput` must include:

```ts
{
  trackInventory: boolean;
  allowBackorder: boolean;
  stock: number;
  variants: Array<{
    id: string;
    trackInventory?: boolean;
    allowBackorder?: boolean;
    quantity: number;
  }>;
}
```

Then call Inventory:

```ts
inventoryClient.initializeProductInventory(productId, inventoryInput)
```

Endpoint:

```http
POST /api/Inventory/products/{productId}/initialize
```

`inventoryInput` must include:

```ts
{
  trackInventory: boolean;
  allowBackorder: boolean;
  lowStockThreshold: number;
  variants: Array<{
    variantId: string;
    useProductInventory: boolean;
    trackInventory?: boolean;
    allowBackorder?: boolean;
    lowStockThreshold?: number;
    quantity: number;
  }>;
}
```

## Rules

- Do not rely on ProductCatalog update alone for real inventory behavior.
- Do not rely on Inventory initialize alone for ProductCatalog product response fields.
- `lowStockThreshold` belongs to the Inventory module save, not ProductCatalog.
- For variant inheritance, send `useProductInventory: true`; backend copies product policy into the variant inventory row.
- For variant-specific policy, send `useProductInventory: false` and include the variant policy fields.
