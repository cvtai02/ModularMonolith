# Customer Product Detail By Slug

## Goal

Use the public customer product slug endpoint for storefront product detail pages.

Frontend routes like:

```txt
/products/:slug
```

should call the customer-safe product detail API by slug, not the admin/moderator `getProduct(id)` API.

## Backend Endpoint

```txt
GET /api/ProductCatalog/customer/products/by-slug/{slug}
```

Auth: public.

Example for the newly added product:

```txt
GET /api/ProductCatalog/customer/products/by-slug/đèn-ngủ-gấu-trúc-silicone-3-mức-sáng
```

Important: current backend slug keeps Vietnamese characters. Do not use the product id `den-ngu-gau-truc-silicone-3-muc-sang` as the slug unless the backend slug generator is changed later.

## Shared Client

Use:

```ts
productCatalogClient.getCustomerProductBySlug(slug)
```

Defined in:

```txt
src/clients/shared/api/contracts/productcatalog.ts
src/clients/shared/api/clients/productcatalog.ts
```

## Types

Use these aliases from:

```txt
src/clients/shared/api/types/productcatalog.ts
```

```ts
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

export type CustomerVariantResponse = {
    id: string;
    price: number;
    compareAtPrice: number;
    imageUrl: string;
    optionValues: VariantResponse["optionValues"];
};

export type CustomerProductResponse = CustomerProductSummaryResponse & {
    description: string;
    compareAtPrice: number;
    medias: ProductResponse["medias"];
    options: ProductResponse["options"];
    variants: CustomerVariantResponse[];
};
```

## Frontend Notes

- Product list cards should link with `item.slug`, not `item.id`.
- Product detail page should read the route `slug`, URL-decode it if needed, then call `getCustomerProductBySlug(slug)`.
- Keep admin/edit product pages on id-based APIs.
- If a page currently calls `/api/ProductCatalog/products/{id}` for storefront detail, replace it with the customer slug API above.

