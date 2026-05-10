# Product Option Value Reorder Handoff

## Goal

Option values should be draggable for re-ordering in add/edit product forms.

## Backend Behavior

ProductCatalog uses the order of the `options[].values` string array as the display order.

No new API shape is required.

Shared client methods and types:

- `productCatalogClient.createProduct(input: CreateProductRequest)`
- `productCatalogClient.updateProduct(id: string, input: UpdateProductRequest)`
- `ProductResponse`

```ts
type CreateProductOptionRequest = {
  name: string;
  displayOrder: number;
  values: string[];
};
```

On update:

- Existing option values cannot be removed.
- Existing option values can be re-ordered.
- New option values can be inserted anywhere in the `values` array.
- Backend writes `OptionValue.DisplayOrder = index` for every value in the submitted order.
- Duplicate values in the same option are rejected.

## Frontend Work

In add/edit product forms:

- Make each option's `values` list draggable.
- When drag ends, reorder the `values: string[]` array.
- Submit the reordered array as-is in `CreateProductRequest` / `UpdateProductRequest`.
- Do not send a separate display order per value.

Example:

```ts
{
  name: "Color",
  displayOrder: 0,
  values: ["Black", "White", "Brown"]
}
```

If admin drags `Brown` first, submit:

```ts
{
  name: "Color",
  displayOrder: 0,
  values: ["Brown", "Black", "White"]
}
```

## Detail Response

`ProductResponse.options[].values` is already returned in display order. Use that order to initialize the draggable list.
