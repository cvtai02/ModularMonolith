import type {
  AddCollectionProductsRequest,
  AddCollectionProductsResponse,
  CategoryResponse,
  CollectionDetailResponse,
  CreateCategoryRequest,
  CreateCategoryResponse,
  CreateCollectionRequest,
  CreateCollectionResponse,
  CreateProductRequest,
  CreateProductResponse,
  DeleteCategoryResponse,
  DeleteCollectionResponse,
  ListCategoriesQuery,
  ListCategoriesResponse,
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
  // Query: src/Modules/ProductCatalog/DTOs/Products/ListProductsRequest.cs
  // Item response: src/Modules/ProductCatalog/DTOs/Products/ProductResponse.cs
  // Wrapper response is generated in src/clients/shared/api/types/productcatalog.ts.
  listProduct(query?: ListProductsQuery): Promise<ListProductsResponse>;

  // Response: src/Modules/ProductCatalog/DTOs/Products/ProductResponse.cs
  getProduct(id: number): Promise<ProductResponse>;

  // Request: src/Modules/ProductCatalog/DTOs/Products/CreateProductRequest.cs
  // Nested variant request: src/Modules/ProductCatalog/DTOs/Products/CreateVariantRequest.cs
  // Response: src/Modules/ProductCatalog/DTOs/Products/ProductResponse.cs
  createProduct(input: CreateProductRequest): Promise<CreateProductResponse>;

  // Request: src/Modules/ProductCatalog/DTOs/Products/UpdateProductRequest.cs
  // Nested variant request: src/Modules/ProductCatalog/DTOs/Products/CreateVariantRequest.cs
  // Response: src/Modules/ProductCatalog/DTOs/Products/ProductResponse.cs
  updateProduct(id: number, input: UpdateProductRequest): Promise<UpdateProductResponse>;

  // Query alias is generated in src/clients/shared/api/types/productcatalog.ts.
  // Item response: src/Modules/ProductCatalog/DTOs/Categories/CategoryResponse.cs
  // Wrapper response is generated in src/clients/shared/api/types/productcatalog.ts.
  listCategory(query?: ListCategoriesQuery): Promise<ListCategoriesResponse>;

  // Response: src/Modules/ProductCatalog/DTOs/Categories/CategoryResponse.cs
  getCategory(name: string): Promise<CategoryResponse>;

  // Request: src/Modules/ProductCatalog/DTOs/Categories/CreateCategoryRequest.cs
  // Response: src/Modules/ProductCatalog/DTOs/Categories/CategoryResponse.cs
  createCategory(input: CreateCategoryRequest): Promise<CreateCategoryResponse>;

  // Request: src/Modules/ProductCatalog/DTOs/Categories/UpdateCategoryRequest.cs
  // Response: src/Modules/ProductCatalog/DTOs/Categories/CategoryResponse.cs
  updateCategory(name: string, input: UpdateCategoryRequest): Promise<UpdateCategoryResponse>;

  // No response body. Alias is generated in src/clients/shared/api/types/productcatalog.ts.
  deleteCategory(name: string): Promise<DeleteCategoryResponse>;

  // Query alias is generated in src/clients/shared/api/types/productcatalog.ts.
  // Item response: src/Modules/ProductCatalog/DTOs/Collections/CollectionResponse.cs
  // Wrapper response is generated in src/clients/shared/api/types/productcatalog.ts.
  listCollection(query?: ListCollectionsQuery): Promise<ListCollectionsResponse>;

  // Method: getCollection - returns collection detail with assigned product summaries.
  // Response: src/Modules/ProductCatalog/DTOs/Collections/CollectionResponse.cs
  getCollection(id: number): Promise<CollectionDetailResponse>;

  // Request: src/Modules/ProductCatalog/DTOs/Collections/CreateCollectionRequest.cs
  // Response: src/Modules/ProductCatalog/DTOs/Collections/CollectionResponse.cs
  createCollection(input: CreateCollectionRequest): Promise<CreateCollectionResponse>;

  // Request: src/Modules/ProductCatalog/DTOs/Collections/AddCollectionProductsRequest.cs
  // Response: src/Modules/ProductCatalog/DTOs/Collections/CollectionResponse.cs
  addCollectionProducts(id: number, input: AddCollectionProductsRequest): Promise<AddCollectionProductsResponse>;

  // Request: src/Modules/ProductCatalog/DTOs/Collections/UpdateCollectionRequest.cs
  // Response: src/Modules/ProductCatalog/DTOs/Collections/CollectionResponse.cs
  updateCollection(id: number, input: UpdateCollectionRequest): Promise<UpdateCollectionResponse>;

  // No response body. Alias is generated in src/clients/shared/api/types/productcatalog.ts.
  deleteCollection(id: number): Promise<DeleteCollectionResponse>;
}
