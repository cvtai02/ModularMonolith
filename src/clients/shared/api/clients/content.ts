import createFetchClient, { type Client } from "openapi-fetch";
import type { paths } from "../lib/openapi-types";
import type {
  ArchiveBlogPostResponse,
  BlogPostResponse,
  BlogPostCollectionResponse,
  ConfirmUploadRequest,
  ConfirmUploadResponse,
  CreateBlogPostCollectionRequest,
  CreateBlogPostCollectionResponse,
  CreateBlogPostRequest,
  CreateBlogPostResponse,
  DeleteBlogPostCollectionResponse,
  DeleteBlogPostResponse,
  DeleteMediaFilesRequest,
  DeleteMediaFilesResponse,
  GetAllQuery,
  GetAllResponse,
  GetAdminBlogPostByIdResponse,
  GetPresignedUploadBulkUrlRequest,
  ListAdminBlogPostsByCollectionQuery,
  ListAdminBlogPostsByCollectionResponse,
  ListBlogPostCollectionsQuery,
  ListBlogPostCollectionsResponse,
  ListAdminBlogPostsQuery,
  ListAdminBlogPostsResponse,
  ListPublishedBlogPostsQuery,
  ListPublishedBlogPostsResponse,
  PresignedUploadBulkUrlResponse,
  PublishBlogPostResponse,
  UpdateBlogPostCollectionRequest,
  UpdateBlogPostCollectionResponse,
  UpdateBlogPostRequest,
  UpdateBlogPostResponse,
} from "../types/content";
import type { IContentClient } from "../contracts/content";
import type { Fetch } from "./shared";
import { requireData } from "./shared";

type OpenApiClient = Client<paths>;

export class ContentClient implements IContentClient {
  private readonly client: OpenApiClient;
  private readonly fetch: Fetch;
  private readonly apiBaseUrl: string;

  constructor(fetch: Fetch, apiBaseUrl: string) {
    this.fetch = fetch;
    this.apiBaseUrl = apiBaseUrl.replace(/\/$/, "");
    this.client = createFetchClient<paths>({ baseUrl: apiBaseUrl, fetch });
  }

  async listMediaFiles(query?: GetAllQuery): Promise<GetAllResponse> {
    const { data, error } = await this.client.GET("/api/Content/file-objects", { params: { query } });
    if (error) throw error;
    return requireData(data, "Media files response was empty.");
  }

  async getPresignedUploadBulkUrl(
    input: GetPresignedUploadBulkUrlRequest,
  ): Promise<PresignedUploadBulkUrlResponse> {
    const { data, error } = await this.client.POST("/api/Content/file-objects/presigned-upload", { body: input });
    if (error) throw error;
    return requireData(data, "Presigned upload response was empty.");
  }

  async confirmUpload(input: ConfirmUploadRequest): Promise<ConfirmUploadResponse> {
    const { data, error } = await this.client.POST("/api/Content/file-objects/confirm-upload", { body: input });
    if (error) throw error;
    return requireData(data, "Confirm upload response was empty.");
  }

  async deleteMediaFiles(input: DeleteMediaFilesRequest): Promise<DeleteMediaFilesResponse> {
    const { error } = await this.client.DELETE("/api/Content/file-objects", { body: input });
    if (error) throw error;
    return undefined as DeleteMediaFilesResponse;
  }

  async listPublishedBlogPosts(query?: ListPublishedBlogPostsQuery): Promise<ListPublishedBlogPostsResponse> {
    const { data, error } = await this.client.GET("/api/Content/blog-posts", { params: { query } });
    if (error) throw error;
    return requireData(data, "Published blog posts response was empty.");
  }

  async getPublishedBlogPostBySlug(slug: string): Promise<BlogPostResponse> {
    const { data, error } = await this.client.GET("/api/Content/blog-posts/{slug}", {
      params: { path: { slug } },
    });
    if (error) throw error;
    return requireData(data, "Blog post response was empty.");
  }

  async listAdminBlogPosts(query?: ListAdminBlogPostsQuery): Promise<ListAdminBlogPostsResponse> {
    const { data, error } = await this.client.GET("/api/Content/blog-posts/admin", { params: { query } });
    if (error) throw error;
    return requireData(data, "Admin blog posts response was empty.");
  }

  async getAdminBlogPostById(id: number): Promise<GetAdminBlogPostByIdResponse> {
    const { data, error } = await this.client.GET("/api/Content/blog-posts/admin/{id}", {
      params: { path: { id } },
    });
    if (error) throw error;
    return requireData(data, "Admin blog post response was empty.");
  }

  async createBlogPost(input: CreateBlogPostRequest): Promise<CreateBlogPostResponse> {
    const { data, error } = await this.client.POST("/api/Content/blog-posts", { body: input });
    if (error) throw error;
    return requireData(data, "Create blog post response was empty.");
  }

  async updateBlogPost(id: number, input: UpdateBlogPostRequest): Promise<UpdateBlogPostResponse> {
    const { data, error } = await this.client.PUT("/api/Content/blog-posts/{id}", {
      params: { path: { id } },
      body: input,
    });
    if (error) throw error;
    return requireData(data, "Update blog post response was empty.");
  }

  async publishBlogPost(id: number): Promise<PublishBlogPostResponse> {
    const { data, error } = await this.client.POST("/api/Content/blog-posts/{id}/publish", {
      params: { path: { id } },
    });
    if (error) throw error;
    return requireData(data, "Publish blog post response was empty.");
  }

  async archiveBlogPost(id: number): Promise<ArchiveBlogPostResponse> {
    const { data, error } = await this.client.POST("/api/Content/blog-posts/{id}/archive", {
      params: { path: { id } },
    });
    if (error) throw error;
    return requireData(data, "Archive blog post response was empty.");
  }

  async deleteBlogPost(id: number): Promise<DeleteBlogPostResponse> {
    const { error } = await this.client.DELETE("/api/Content/blog-posts/{id}", {
      params: { path: { id } },
    });
    if (error) throw error;
    return undefined as DeleteBlogPostResponse;
  }

  async getPublicBlogPostCollectionByKey(key: string): Promise<BlogPostCollectionResponse> {
    return this.requestJson<BlogPostCollectionResponse>(
      `/api/Content/blog-post-collections/${encodeURIComponent(key)}`,
      undefined,
      "Blog post collection response was empty.",
    );
  }

  async listAdminBlogPostCollections(query?: ListBlogPostCollectionsQuery): Promise<ListBlogPostCollectionsResponse> {
    return this.requestJson<ListBlogPostCollectionsResponse>(
      `/api/Content/blog-post-collections/admin${this.toQueryString(query)}`,
      undefined,
      "Admin blog post collections response was empty.",
    );
  }

  async listAdminBlogPostsByCollection(
    query?: ListAdminBlogPostsByCollectionQuery,
  ): Promise<ListAdminBlogPostsByCollectionResponse> {
    return this.requestJson<ListAdminBlogPostsByCollectionResponse>(
      `/api/Content/blog-post-collections/admin/blog-posts${this.toQueryString(query)}`,
      undefined,
      "Admin blog posts by collection response was empty.",
    );
  }

  async getAdminBlogPostCollectionById(id: number): Promise<BlogPostCollectionResponse> {
    return this.requestJson<BlogPostCollectionResponse>(
      `/api/Content/blog-post-collections/admin/${id}`,
      undefined,
      "Admin blog post collection response was empty.",
    );
  }

  async createBlogPostCollection(
    input: CreateBlogPostCollectionRequest,
  ): Promise<CreateBlogPostCollectionResponse> {
    return this.requestJson<CreateBlogPostCollectionResponse>(
      "/api/Content/blog-post-collections",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      },
      "Create blog post collection response was empty.",
    );
  }

  async updateBlogPostCollection(
    id: number,
    input: UpdateBlogPostCollectionRequest,
  ): Promise<UpdateBlogPostCollectionResponse> {
    return this.requestJson<UpdateBlogPostCollectionResponse>(
      `/api/Content/blog-post-collections/${id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      },
      "Update blog post collection response was empty.",
    );
  }

  async deleteBlogPostCollection(id: number): Promise<DeleteBlogPostCollectionResponse> {
    return this.requestJson<DeleteBlogPostCollectionResponse>(
      `/api/Content/blog-post-collections/${id}`,
      { method: "DELETE" },
      "",
    );
  }

  private async requestJson<T>(path: string, init: RequestInit | undefined, emptyMessage: string): Promise<T> {
    const response = await this.fetch(`${this.apiBaseUrl}${path}`, init);
    if (!response.ok) {
      throw await this.readError(response);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const data = await response.json() as T | undefined;
    return requireData(data, emptyMessage);
  }

  private toQueryString(query?: object): string {
    if (!query) {
      return "";
    }

    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, String(value));
      }
    }

    const value = params.toString();
    return value ? `?${value}` : "";
  }

  private async readError(response: Response): Promise<unknown> {
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      return await response.json();
    }

    return new Error(await response.text());
  }
}
