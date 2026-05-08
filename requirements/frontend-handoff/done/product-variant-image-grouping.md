# Product Variant Image Grouping Handoff

## Goal

On add/edit product, all variants that share the same value of the first product option must display and submit the same variant image.

Example:

- First option: `Color`
- Variants:
  - `Color = Red, Size = S`
  - `Color = Red, Size = M`
  - `Color = Blue, Size = S`

Both `Red` variants must use the same image. `Blue` variants can use a different shared image.

## Backend Behavior

Backend now enforces this in ProductCatalog create/edit usecases:

- `POST /api/ProductCatalog/products`
- `PUT /api/ProductCatalog/products/{id}`

Backend groups variants by the first option value and applies one `imageKey` to every variant in that group.

## Frontend Behavior

In add/edit product forms:

- Treat variant images as first-option-value images, not per-variant images.
- When admin changes the image for one variant, update every variant with the same first option value in form state.
- Submit the same `imageKey` for all variants in that group.

Variant request shape already supports this:

```ts
type CreateVariantRequest = {
  id?: string | null;
  imageKey?: string | null;
  optionValues: Array<{
    optionName: string;
    value: string;
  }>;
};
```

## Notes

- The first option is determined by option `displayOrder`, then name.
- If a group submits multiple different images, backend uses the first explicit image it sees for that first-option-value group.
- If no variant in a group submits an image, backend falls back to the product image on create, or keeps the existing group image on edit.
