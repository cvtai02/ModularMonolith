import type { paths } from "../lib/openapi-types";
import type { JsonRequestBody, JsonResponse, PathParams, QueryParams } from "./path-type-helpers";

// -- API Types --
type ProductCatalogPaths = paths; // do not export this

type ListCategoriesOperation =
    ProductCatalogPaths["/api/ProductCatalog/categories"]["get"];
type CreateCategoryOperation =
    ProductCatalogPaths["/api/ProductCatalog/categories"]["post"];
type GetCategoryOperation =
    ProductCatalogPaths["/api/ProductCatalog/categories/{name}"]["get"];
type UpdateCategoryOperation =
    ProductCatalogPaths["/api/ProductCatalog/categories/{name}"]["put"];
type DeleteCategoryOperation =
    ProductCatalogPaths["/api/ProductCatalog/categories/{name}"]["delete"];

type ListCollectionsOperation =
    ProductCatalogPaths["/api/ProductCatalog/collections"]["get"];
type CreateCollectionOperation =
    ProductCatalogPaths["/api/ProductCatalog/collections"]["post"];
type GetCollectionOperation =
    ProductCatalogPaths["/api/ProductCatalog/collections/{id}"]["get"];
type UpdateCollectionOperation =
    ProductCatalogPaths["/api/ProductCatalog/collections/{id}"]["put"];
type DeleteCollectionOperation =
    ProductCatalogPaths["/api/ProductCatalog/collections/{id}"]["delete"];

type ListProductsOperation =
    ProductCatalogPaths["/api/ProductCatalog/products"]["get"];
type CreateProductOperation =
    ProductCatalogPaths["/api/ProductCatalog/products"]["post"];
type GetProductOperation =
    ProductCatalogPaths["/api/ProductCatalog/products/{id}"]["get"];
type UpdateProductOperation =
    ProductCatalogPaths["/api/ProductCatalog/products/{id}"]["put"];

export type ListCategoriesQuery = QueryParams<ListCategoriesOperation>;
// 200 OK
export type ListCategoriesResponse = JsonResponse<ListCategoriesOperation>;
export type CreateCategoryRequest = JsonRequestBody<CreateCategoryOperation>;
// 200 OK
export type CreateCategoryResponse = JsonResponse<CreateCategoryOperation>;
export type GetCategoryParams = PathParams<GetCategoryOperation>;
// 200 OK
export type CategoryResponse = JsonResponse<GetCategoryOperation>;
export type UpdateCategoryParams = PathParams<UpdateCategoryOperation>;
export type UpdateCategoryRequest = JsonRequestBody<UpdateCategoryOperation>;
// 200 OK
export type UpdateCategoryResponse = JsonResponse<UpdateCategoryOperation>;
export type DeleteCategoryParams = PathParams<DeleteCategoryOperation>;
// No content
export type DeleteCategoryResponse = void;

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

export type ListCustomerCategoriesResponse = Omit<ListCategoriesResponse, "items"> & {
    items: CustomerCategoryResponse[];
};

export type ListCollectionsQuery = QueryParams<ListCollectionsOperation>;
// 200 OK
type ListCollectionsResponseBody = JsonResponse<ListCollectionsOperation>;
type CreateCollectionRequestBody = JsonRequestBody<CreateCollectionOperation>;
export type CreateCollectionRequest = CreateCollectionRequestBody & {
    productIds?: string[] | null;
};
export type GetCollectionParams = PathParams<GetCollectionOperation>;
// 200 OK
export type CollectionResponse = JsonResponse<CreateCollectionOperation>;
export type CollectionProductResponse = {
    productId: string;
    name: string;
    slug: string;
    imageUrl: string;
    status: ProductResponse["status"];
    price: number;
    currency: ProductResponse["currency"];
    displayOrder: number;
};
export type CollectionDetailResponse = JsonResponse<GetCollectionOperation>;
// 200 OK
export type ListCollectionsResponse = Omit<ListCollectionsResponseBody, "items"> & {
    items: CollectionResponse[];
};
// 200 OK
export type CreateCollectionResponse = CollectionResponse;
export type AddCollectionProductsParams = {
    id: number;
};
export type AddCollectionProductsRequest = {
    productIds: string[];
};
// 200 OK
export type AddCollectionProductsResponse = CollectionResponse;
export type UpdateCollectionParams = PathParams<UpdateCollectionOperation>;
type UpdateCollectionRequestBody = JsonRequestBody<UpdateCollectionOperation>;
export type UpdateCollectionRequest = UpdateCollectionRequestBody & {
    title?: string | null;
    productIds?: string[] | null;
};
// 200 OK
export type UpdateCollectionResponse = JsonResponse<UpdateCollectionOperation>;
export type DeleteCollectionParams = PathParams<DeleteCollectionOperation>;
// No content
export type DeleteCollectionResponse = void;

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

export type ListCustomerCollectionsResponse = Omit<ListCollectionsResponseBody, "items"> & {
    items: CustomerCollectionResponse[];
};

export type ListProductsQuery = QueryParams<ListProductsOperation>;
// 200 OK
type ListProductsResponseBody = JsonResponse<ListProductsOperation>;
export type CreateProductRequest = JsonRequestBody<CreateProductOperation>;
// 200 OK
export type CreateProductResponse = ProductResponse;
export type GetProductParams = { id: string };
// 200 OK
type GeneratedProductResponse = JsonResponse<GetProductOperation>;
type GeneratedVariantResponse = GeneratedProductResponse extends { variants?: Array<infer TVariant> } ? TVariant : never;
export type VariantResponse = Omit<GeneratedVariantResponse, "id"> & {
    id: string;
};
export type ProductResponse = Omit<GeneratedProductResponse, "id" | "variants" | "lowestPrice" | "highestPrice"> & {
    id: string;
    lowestPrice: number;
    highestPrice: number;
    variants: VariantResponse[];
};
export type ProductSummaryResponse = {
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
export type ListProductsResponse = Omit<ListProductsResponseBody, "items"> & {
    items: ProductSummaryResponse[];
};
export type UpdateProductParams = { id: string };
// PUT uses the backend UpdateProductRequest DTO. It currently has the same
// full-replace shape as CreateProductRequest.
export type UpdateProductRequest = CreateProductRequest;
// 200 OK
export type UpdateProductResponse = ProductResponse;
// No content
export type DeleteProductResponse = void;

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

export type ListCustomerProductsResponse = Omit<ListProductsResponseBody, "items"> & {
    items: CustomerProductSummaryResponse[];
};
