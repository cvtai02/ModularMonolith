import createFetchClient, { type Client } from "openapi-fetch";
import type { paths } from "../lib/openapi-types";
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
import type { IProductCatalogClient } from "../contracts/productcatalog";
import { requireData, type Fetch } from "./shared";

type OpenApiClient = Client<paths>;
type CollectionProductsPostClient = {
  POST(
    path: "/api/ProductCatalog/collections/{id}/products",
    options: {
      params: { path: { id: number } };
      body: AddCollectionProductsRequest;
    },
  ): Promise<{ data?: AddCollectionProductsResponse; error?: unknown }>;
};

export class ProductCatalogClient implements IProductCatalogClient {
  private readonly client: OpenApiClient;
  private readonly fetch: Fetch;
  private readonly apiBaseUrl: string;

  constructor(fetch: Fetch, apiBaseUrl: string) {
    this.fetch = fetch;
    this.apiBaseUrl = apiBaseUrl.replace(/\/$/, "");
    this.client = createFetchClient<paths>({
      baseUrl: apiBaseUrl,
      fetch,
    });
  }

  async listProduct(query?: ListProductsQuery): Promise<ListProductsResponse> {
    const { data, error } = await this.client.GET("/api/ProductCatalog/products", { params: { query } });
    if (error) throw error;
    return requireData(data, "Products response was empty.");
  }

  async getProduct(id: string): Promise<ProductResponse> {
    return this.requestJson<ProductResponse>(
      `/api/ProductCatalog/products/${encodeURIComponent(id)}`,
      undefined,
      "Product response was empty.",
    );
  }

  async createProduct(input: CreateProductRequest): Promise<CreateProductResponse> {
    const { data, error } = await this.client.POST("/api/ProductCatalog/products", {
      body: input,
    });
    if (error) throw error;
    return requireData(data, "Create product response was empty.");
  }

  async updateProduct(id: string, input: UpdateProductRequest): Promise<UpdateProductResponse> {
    return this.requestJson<UpdateProductResponse>(
      `/api/ProductCatalog/products/${encodeURIComponent(id)}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      },
      "Update product response was empty.",
    );
  }

  async listCategory(query?: ListCategoriesQuery): Promise<ListCategoriesResponse> {
    const { data, error } = await this.client.GET("/api/ProductCatalog/categories", {
      params: { query },
    });
    if (error) throw error;
    return requireData(data, "Categories response was empty.");
  }

  async getCategory(name: string): Promise<CategoryResponse> {
    const { data, error } = await this.client.GET("/api/ProductCatalog/categories/{name}", {
      params: { path: { name } },
    });
    if (error) throw error;
    return requireData(data, "Category response was empty.");
  }

  async createCategory(input: CreateCategoryRequest): Promise<CreateCategoryResponse> {
    const { data, error } = await this.client.POST("/api/ProductCatalog/categories", {
      body: input,
    });
    if (error) throw error;
    return requireData(data, "Create category response was empty.");
  }

  async updateCategory(name: string, input: UpdateCategoryRequest): Promise<UpdateCategoryResponse> {
    const { data, error } = await this.client.PUT("/api/ProductCatalog/categories/{name}", {
      params: { path: { name } },
      body: input,
    });
    if (error) throw error;
    return requireData(data, "Update category response was empty.");
  }

  async deleteCategory(name: string): Promise<DeleteCategoryResponse> {
    const { data, error } = await this.client.DELETE("/api/ProductCatalog/categories/{name}", {
      params: { path: { name } },
    });
    if (error) throw error;
    return requireData(data, "Collections response was empty.");
  }

  async listCollection(query?: ListCollectionsQuery): Promise<ListCollectionsResponse> {
    const { data, error } = await this.client.GET("/api/ProductCatalog/collections", {
      params: { query },
    });
    if (error) throw error;
    return requireData(data, "Collection response was empty.");
  }

  async getCollection(id: number): Promise<CollectionDetailResponse> {
    const { data, error } = await this.client.GET("/api/ProductCatalog/collections/{id}", {
      params: { path: { id } },
    });
    if (error) throw error;
    return requireData(data, "Collection detail response was empty.") as CollectionDetailResponse;
  }

  async createCollection(input: CreateCollectionRequest): Promise<CreateCollectionResponse> {
    const { data, error } = await this.client.POST("/api/ProductCatalog/collections", {
      body: input,
    });
    if (error) throw error;
    return requireData(data, "Create collection response was empty.");
  }

  async addCollectionProducts(id: number, input: AddCollectionProductsRequest): Promise<AddCollectionProductsResponse> {
    const client = this.client as unknown as CollectionProductsPostClient;
    const { data, error } = await client.POST("/api/ProductCatalog/collections/{id}/products", {
      params: { path: { id } },
      body: input,
    });
    if (error) throw error;
    return requireData(data, "Add collection products response was empty.");
  }

  async updateCollection(id: number, input: UpdateCollectionRequest): Promise<UpdateCollectionResponse> {
    const { data, error } = await this.client.PUT("/api/ProductCatalog/collections/{id}", {
      params: { path: { id } },
      body: input,
    });
    if (error) throw error;
    return requireData(data, "Update collection response was empty.");
  }

  async deleteCollection(id: number): Promise<DeleteCollectionResponse> {
    const { data, error } = await this.client.DELETE("/api/ProductCatalog/collections/{id}", {
      params: { path: { id } },
    });
    if (error) throw error;
    return data;
  }

  private async requestJson<T>(path: string, init: RequestInit | undefined, emptyMessage: string): Promise<T> {
    const response = await this.fetch(`${this.apiBaseUrl}${path}`, init);
    if (!response.ok) {
      throw await this.readError(response);
    }

    const data = await response.json() as T | undefined;
    return requireData(data, emptyMessage);
  }

  private async readError(response: Response): Promise<unknown> {
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      return await response.json();
    }

    return new Error(await response.text());
  }
}
