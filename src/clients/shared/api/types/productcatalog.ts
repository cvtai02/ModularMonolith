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

export type ListCollectionsQuery = QueryParams<ListCollectionsOperation>;
// 200 OK
type ListCollectionsResponseBody = JsonResponse<ListCollectionsOperation>;
type CreateCollectionRequestBody = JsonRequestBody<CreateCollectionOperation>;
export type CreateCollectionRequest = CreateCollectionRequestBody & {
    productIds?: number[] | null;
};
export type GetCollectionParams = PathParams<GetCollectionOperation>;
// 200 OK
type CollectionResponseBody = JsonResponse<GetCollectionOperation>;
export type CollectionResponse = CollectionResponseBody & {
    productCount: number;
};
export type CollectionProductResponse = {
    productId: number;
    name: string;
    slug: string;
    imageUrl: string;
    status: ProductResponse["status"];
    price: number;
    currency: ProductResponse["currency"];
    displayOrder: number;
};
export type CollectionDetailResponse = CollectionResponse & {
    products: CollectionProductResponse[];
};
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
    productIds: number[];
};
// 200 OK
export type AddCollectionProductsResponse = CollectionResponse;
export type UpdateCollectionParams = PathParams<UpdateCollectionOperation>;
type UpdateCollectionRequestBody = JsonRequestBody<UpdateCollectionOperation>;
export type UpdateCollectionRequest = UpdateCollectionRequestBody & {
    title?: string | null;
    productIds?: number[] | null;
};
// 200 OK
export type UpdateCollectionResponse = CollectionResponse;
export type DeleteCollectionParams = PathParams<DeleteCollectionOperation>;
// No content
export type DeleteCollectionResponse = void;

export type ListProductsQuery = QueryParams<ListProductsOperation>;
// 200 OK
export type ListProductsResponse = JsonResponse<ListProductsOperation>;
export type CreateProductRequest = JsonRequestBody<CreateProductOperation>;
// 200 OK
export type CreateProductResponse = JsonResponse<CreateProductOperation>;
export type GetProductParams = PathParams<GetProductOperation>;
// 200 OK
export type ProductResponse = JsonResponse<GetProductOperation>;
export type UpdateProductParams = PathParams<UpdateProductOperation>;
// PUT uses the backend UpdateProductRequest DTO. It currently has the same
// full-replace shape as CreateProductRequest.
export type UpdateProductRequest = CreateProductRequest;
// 200 OK
export type UpdateProductResponse = JsonResponse<UpdateProductOperation>;
