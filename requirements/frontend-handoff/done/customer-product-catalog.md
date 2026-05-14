# Customer Product Catalog Frontend Handoff

## Goal

Move storefront/customer product list and detail pages to the new customer-safe product endpoints.

The existing product endpoints are now for staff/admin reads:

```http
GET /api/ProductCatalog/products
GET /api/ProductCatalog/products/{id}
```

They require `TenantModeratorUp` and may return internal catalog fields.

## Customer APIs

Use these public customer endpoints for storefront UI:

```http
GET /api/ProductCatalog/customer/categories
GET /api/ProductCatalog/customer/categories/{name}
GET /api/ProductCatalog/customer/collections
GET /api/ProductCatalog/customer/collections/{id}
GET /api/ProductCatalog/customer/products
GET /api/ProductCatalog/customer/products/{id}
```

These endpoints return storefront-safe data:

- categories: active categories only
- collections: public collection metadata, with active product counts
- collection detail: active products in active categories only
- products: active products in active categories only

## Shared Client

Use `src/clients/shared/api/clients/productcatalog.ts`.

```ts
productCatalogClient.listCustomerCategory(query)
productCatalogClient.getCustomerCategory(name)
productCatalogClient.listCustomerCollection(query)
productCatalogClient.getCustomerCollection(id)
productCatalogClient.listCustomerProduct(query)
productCatalogClient.getCustomerProduct(id)
```

Do not use `listProduct`, `getProduct`, `listCategory`, `getCategory`, `listCollection`, or `getCollection` on storefront/customer pages anymore. Those are staff/admin methods now.

## Shared Types

Use these aliases from `src/clients/shared/api/types/productcatalog.ts`:

```ts
export type CustomerCategoryResponse = {
    id: number;
    name: string;
    description: string;
    imageUrl?: string | null;
    parentName?: string | null;
    slug: string;
};

export type ListCustomerCategoriesQuery = {
    pageNumber?: number;
    pageSize?: number;
    search?: string | null;
};

export type ListCustomerCategoriesResponse = {
    items: CustomerCategoryResponse[];
    pageNumber: number;
    totalPages: number;
    totalCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
};

export type CustomerCollectionResponse = {
    id: number;
    title: string;
    description: string;
    slug: string;
    imageUrl?: string | null;
    productCount: number;
};

export type CustomerCollectionProductResponse = CustomerProductSummaryResponse & {
    displayOrder: number;
};

export type CustomerCollectionDetailResponse = CustomerCollectionResponse & {
    products: CustomerCollectionProductResponse[];
};

export type ListCustomerCollectionsQuery = {
    pageNumber?: number;
    pageSize?: number;
    search?: string | null;
};

export type ListCustomerCollectionsResponse = {
    items: CustomerCollectionResponse[];
    pageNumber: number;
    totalPages: number;
    totalCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
};

export type ListCustomerProductsQuery = {
    pageNumber?: number;
    pageSize?: number;
    search?: string | null;
    categoryName?: string | null;
    sortBy?: string | null;
    sortDirection?: string | null;
};

export type CustomerProductSummaryResponse = {
    id: string;
    name: string;
    slug: string;
    imageUrl: string;
    categoryId: number;
    categoryName: string;
    price: number;
    lowestPrice: number;
    highestPrice: number;
    currency: ProductResponse["currency"];
};

export type CustomerProductResponse = CustomerProductSummaryResponse & {
    description: string;
    compareAtPrice: number;
    medias: ProductResponse["medias"];
    options: ProductResponse["options"];
    variants: CustomerVariantResponse[];
};

export type CustomerVariantResponse = {
    id: string;
    price: number;
    compareAtPrice: number;
    imageUrl: string;
    optionValues: VariantResponse["optionValues"];
};

export type ListCustomerProductsResponse = {
    items: CustomerProductSummaryResponse[];
    pageNumber: number;
    totalPages: number;
    totalCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
};
```

## UI Notes

Product list cards should use:

- `imageUrl`
- `name`
- `lowestPrice` / `highestPrice`
- `currency`
- link to detail using `id` or existing product route convention

Product detail should use:

- `medias`
- `options`
- `variants`
- `price`, `lowestPrice`, `highestPrice`, `compareAtPrice`

The customer response intentionally does not include:

- `costPrice`
- `stock`
- `reserved`
- `trackInventory`
- `allowBackorder`
- shipping dimensions
- admin product status

Category customer responses intentionally do not include `status`.

Collection customer detail intentionally filters out draft/unlisted products and products in inactive categories.

Move this file to `requirements/frontend-handoff/done/` after implementation.
