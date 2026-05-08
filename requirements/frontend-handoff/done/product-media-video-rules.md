# Product Media Video Rules

## Scope

Apply these rules in add-product and edit-product media inputs.

## API Type Aliases

No shared client shape changed. Continue using:

- `CreateProductRequest`
- `UpdateProductRequest`
- `ProductResponse`

from `src/clients/shared/api/types/productcatalog.ts`.

## Rules

- A product can include at most one `.mp4` media key.
- If an `.mp4` is included, backend stores it as the first media item with `displayOrder: 0`.
- Product thumbnail/image should use the next image media, not the `.mp4`.
- If frontend shows media ordering, render the `.mp4` first and images after it.
- If the user selects more than one `.mp4`, block submit and show a validation message before calling the API.

## Backend Validation

Create/update product returns validation error when more than one `.mp4` media key is submitted:

```ts
{
  mediaKeys: ["Only one mp4 media key is allowed per product."]
}
```
