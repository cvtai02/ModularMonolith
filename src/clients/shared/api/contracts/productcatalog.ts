import type {
  AddCollectionProductsRequest,
  AddCollectionProductsResponse,
  CategoryResponse,
  CustomerCategoryResponse,
  CustomerCollectionDetailResponse,
  CollectionDetailResponse,
  CreateCategoryRequest,
  CreateCategoryResponse,
  CreateCollectionRequest,
  CreateCollectionResponse,
  CreateProductRequest,
  CreateProductResponse,
  CustomerProductResponse,
  DeleteProductResponse,
  DeleteCategoryResponse,
  DeleteCollectionResponse,
  ListCustomerProductsQuery,
  ListCustomerProductsResponse,
  ListCategoriesQuery,
  ListCategoriesResponse,
  ListCustomerCategoriesQuery,
  ListCustomerCategoriesResponse,
  ListCustomerCollectionsQuery,
  ListCustomerCollectionsResponse,
  ListCollectionsQuery,
  ListCollectionsResponse,
  ListProductsQuery,
  ListProductsResponse,
  ProductResponse,
  UpdateCategoryRequest,
  UpdateCategoryResponse,
  UpdateCollectionRequest,
  UpdateCollectionResponse,
  UpdateProductRequest,
  UpdateProductResponse,
} from "../types/productcatalog";

export * from "../types/productcatalog"

export interface IProductCatalogClient {
  // Contract method: listCustomerCategory. Public storefront category list; active categories only.
  // Item response: src/Modules/ProductCatalog/DTOs/Categories/CustomerCategoryResponse.cs
  listCustomerCategory(query?: ListCustomerCategoriesQuery): Promise<ListCustomerCategoriesResponse>;

  // Contract method: getCustomerCategory. Public storefront category detail; active categories only.
  // Response: src/Modules/ProductCatalog/DTOs/Categories/CustomerCategoryResponse.cs
  getCustomerCategory(name: string): Promise<CustomerCategoryResponse>;

  // Contract method: getCustomerCategoryBySlug. Public storefront category detail by slug.
  // Response: src/Modules/ProductCatalog/DTOs/Categories/CustomerCategoryResponse.cs
  getCustomerCategoryBySlug(slug: string): Promise<CustomerCategoryResponse>;

  // Contract method: listCustomerCollection. Public storefront collection list.
  // Item response: src/Modules/ProductCatalog/DTOs/Collections/CustomerCollectionResponse.cs
  listCustomerCollection(query?: ListCustomerCollectionsQuery): Promise<ListCustomerCollectionsResponse>;

  // Contract method: getCustomerCollection. Public storefront collection detail with active products only.
  // Response: src/Modules/ProductCatalog/DTOs/Collections/CustomerCollectionResponse.cs
  getCustomerCollection(id: number): Promise<CustomerCollectionDetailResponse>;

  // Contract method: getCustomerCollectionBySlug. Public storefront collection detail by slug with active products only.
  // Response: src/Modules/ProductCatalog/DTOs/Collections/CustomerCollectionResponse.cs
  getCustomerCollectionBySlug(slug: string): Promise<CustomerCollectionDetailResponse>;

  // Contract method: listCustomerProduct. Public storefront product list; active products only.
  // Query: src/Modules/ProductCatalog/DTOs/Products/ListCustomerProductsRequest.cs
  // Item response: src/Modules/ProductCatalog/DTOs/Products/CustomerProductResponse.cs
  listCustomerProduct(query?: ListCustomerProductsQuery): Promise<ListCustomerProductsResponse>;

  // Contract method: getCustomerProduct. Public storefront product detail; active products only.
  // Response: src/Modules/ProductCatalog/DTOs/Products/CustomerProductResponse.cs
  getCustomerProduct(id: string): Promise<CustomerProductResponse>;

  // Contract method: getCustomerProductBySlug. Public storefront product detail by slug.
  // Response: src/Modules/ProductCatalog/DTOs/Products/CustomerProductResponse.cs
  getCustomerProductBySlug(slug: string): Promise<CustomerProductResponse>;

  // Auth: TenantModeratorUp.
  // Query: src/Modules/ProductCatalog/DTOs/Products/ListProductsRequest.cs
  // Item response: src/Modules/ProductCatalog/DTOs/Products/ProductSummaryResponse.cs
  // Wrapper response is generated in src/clients/shared/api/types/productcatalog.ts.
  listProduct(query?: ListProductsQuery): Promise<ListProductsResponse>;

  // Auth: TenantModeratorUp.
  // Response: src/Modules/ProductCatalog/DTOs/Products/ProductResponse.cs
  getProduct(id: string): Promise<ProductResponse>;

  // Auth: TenantAdminUp.
  // Request: src/Modules/ProductCatalog/DTOs/Products/CreateProductRequest.cs
  // Nested variant request: src/Modules/ProductCatalog/DTOs/Products/CreateVariantRequest.cs
  // Response: src/Modules/ProductCatalog/DTOs/Products/ProductResponse.cs
  createProduct(input: CreateProductRequest): Promise<CreateProductResponse>;

  // Auth: TenantAdminUp. Supports adding new variants for newly added option values.
  // Request: src/Modules/ProductCatalog/DTOs/Products/UpdateProductRequest.cs
  // Nested variant request: src/Modules/ProductCatalog/DTOs/Products/CreateVariantRequest.cs
  // Response: src/Modules/ProductCatalog/DTOs/Products/ProductResponse.cs
  updateProduct(id: string, input: UpdateProductRequest): Promise<UpdateProductResponse>;

  // Contract method: deleteProduct. Auth: TenantAdminUp. Deletes a product by id; returns 204/no body.
  deleteProduct(id: string): Promise<DeleteProductResponse>;

  // Auth: TenantModeratorUp.
  // Query alias is generated in src/clients/shared/api/types/productcatalog.ts.
  // Item response: src/Modules/ProductCatalog/DTOs/Categories/CategoryResponse.cs
  // Wrapper response is generated in src/clients/shared/api/types/productcatalog.ts.
  listCategory(query?: ListCategoriesQuery): Promise<ListCategoriesResponse>;

  // Auth: TenantModeratorUp.
  // Response: src/Modules/ProductCatalog/DTOs/Categories/CategoryResponse.cs
  getCategory(name: string): Promise<CategoryResponse>;

  // Auth: TenantAdminUp.
  // Request: src/Modules/ProductCatalog/DTOs/Categories/CreateCategoryRequest.cs
  // Response: src/Modules/ProductCatalog/DTOs/Categories/CategoryResponse.cs
  createCategory(input: CreateCategoryRequest): Promise<CreateCategoryResponse>;

  // Auth: TenantAdminUp.
  // Request: src/Modules/ProductCatalog/DTOs/Categories/UpdateCategoryRequest.cs
  // Response: src/Modules/ProductCatalog/DTOs/Categories/CategoryResponse.cs
  updateCategory(name: string, input: UpdateCategoryRequest): Promise<UpdateCategoryResponse>;

  // Auth: TenantAdminUp. No response body. Alias is generated in src/clients/shared/api/types/productcatalog.ts.
  deleteCategory(name: string): Promise<DeleteCategoryResponse>;

  // Auth: TenantModeratorUp.
  // Query alias is generated in src/clients/shared/api/types/productcatalog.ts.
  // Item response: src/Modules/ProductCatalog/DTOs/Collections/CollectionResponse.cs
  // Wrapper response is generated in src/clients/shared/api/types/productcatalog.ts.
  listCollection(query?: ListCollectionsQuery): Promise<ListCollectionsResponse>;

  // Auth: TenantModeratorUp.
  // Method: getCollection - returns collection detail with assigned product summaries.
  // Response: src/Modules/ProductCatalog/DTOs/Collections/CollectionResponse.cs
  getCollection(id: number): Promise<CollectionDetailResponse>;

  // Auth: TenantAdminUp.
  // Request: src/Modules/ProductCatalog/DTOs/Collections/CreateCollectionRequest.cs
  // Response: src/Modules/ProductCatalog/DTOs/Collections/CollectionResponse.cs
  createCollection(input: CreateCollectionRequest): Promise<CreateCollectionResponse>;

  // Auth: TenantAdminUp.
  // Request: src/Modules/ProductCatalog/DTOs/Collections/AddCollectionProductsRequest.cs
  // Response: src/Modules/ProductCatalog/DTOs/Collections/CollectionResponse.cs
  addCollectionProducts(id: number, input: AddCollectionProductsRequest): Promise<AddCollectionProductsResponse>;

  // Auth: TenantAdminUp.
  // Request: src/Modules/ProductCatalog/DTOs/Collections/UpdateCollectionRequest.cs
  // Response: src/Modules/ProductCatalog/DTOs/Collections/CollectionResponse.cs
  updateCollection(id: number, input: UpdateCollectionRequest): Promise<UpdateCollectionResponse>;

  // Auth: TenantAdminUp. No response body. Alias is generated in src/clients/shared/api/types/productcatalog.ts.
  deleteCollection(id: number): Promise<DeleteCollectionResponse>;
}
