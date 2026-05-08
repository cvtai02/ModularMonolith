# Product Price Range Handoff

## API Change

ProductCatalog product responses now include price range fields from `ProductMetric`.

Affected aliases in `src/clients/shared/api/types/productcatalog.ts`:

```ts
type ProductResponse = {
  lowestPrice: number;
  highestPrice: number;
};

type CreateProductResponse = ProductResponse;
type UpdateProductResponse = ProductResponse;
type ListProductsResponse = {
  items: ProductResponse[];
};
```

## Behavior

- Create product recalculates `lowestPrice` and `highestPrice` from created variant prices.
- Edit product recalculates `lowestPrice` and `highestPrice` from updated variant prices.
- `price` remains the existing product/display price.
- `lowestPrice` and `highestPrice` are read-only response fields for the frontend.
