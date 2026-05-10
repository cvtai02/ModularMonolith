# Product List Summary API Handoff

## Change

`GET /api/ProductCatalog/products` now returns lightweight product summaries.

The detail endpoint is unchanged:

```http
GET /api/ProductCatalog/products/{id}
```

## Shared Types

Use:

```ts
productCatalogClient.listProduct(query)
```

Response:

```ts
type ListProductsResponse = {
  items: ProductSummaryResponse[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

type ProductSummaryResponse = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  status: ProductResponse["status"];
  categoryId: number;
  categoryName: string;
  price: number;
  lowestPrice: number;
  highestPrice: number;
  currency: ProductResponse["currency"];
  stock: number;
  sold: number;
  created: string;
  lastModified: string;
};
```

## Removed From List Response

The list endpoint no longer includes:

- description
- compare/cost/tax fields
- inventory policy fields
- shipping dimensions
- medias
- options
- variants

Use `getProduct(id)` when the UI needs those details.
