import type {
  CategoryResponse,
  CollectionResponse,
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

export interface IProductCatalogClient {
  listProduct(query?: ListProductsQuery): Promise<ListProductsResponse>;
  getProduct(id: number): Promise<ProductResponse>;
  createProduct(input: CreateProductRequest): Promise<CreateProductResponse>;
  updateProduct(id: number, input: UpdateProductRequest): Promise<UpdateProductResponse>;

  listCategory(query?: ListCategoriesQuery): Promise<ListCategoriesResponse>;
  getCategory(name: string): Promise<CategoryResponse>;
  createCategory(input: CreateCategoryRequest): Promise<CreateCategoryResponse>;
  updateCategory(name: string, input: UpdateCategoryRequest): Promise<UpdateCategoryResponse>;
  deleteCategory(name: string): Promise<DeleteCategoryResponse>;

  listCollection(query?: ListCollectionsQuery): Promise<ListCollectionsResponse>;
  getCollection(id: number): Promise<CollectionResponse>;
  createCollection(input: CreateCollectionRequest): Promise<CreateCollectionResponse>;
  updateCollection(id: number, input: UpdateCollectionRequest): Promise<UpdateCollectionResponse>;
  deleteCollection(id: number): Promise<DeleteCollectionResponse>;
}
