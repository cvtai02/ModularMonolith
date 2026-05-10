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
  CreateGalleryRequest,
  CreateGalleryResponse,
  DeleteBlogPostCollectionResponse,
  DeleteBlogPostResponse,
  DeleteGalleryResponse,
  DeleteMediaFilesRequest,
  DeleteMediaFilesResponse,
  GalleryResponse,
  GetAllQuery,
  GetAllResponse,
  GetAdminBlogPostByIdResponse,
  GetPresignedUploadBulkUrlRequest,
  ListAdminGalleriesResponse,
  ListAdminBlogPostsByCollectionQuery,
  ListAdminBlogPostsByCollectionResponse,
  ListBlogPostCollectionsQuery,
  ListBlogPostCollectionsResponse,
  ListGalleriesQuery,
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
  UpdateGalleryRequest,
  UpdateGalleryResponse,
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
    return this.requestJson<ListPublishedBlogPostsResponse>(
      `/api/Content/blog-posts${this.toQueryString(query)}`,
      undefined,
      "Published blog posts response was empty.",
    );
  }

  async getPublishedBlogPostBySlug(slug: string): Promise<BlogPostResponse> {
    return this.requestJson<BlogPostResponse>(
      `/api/Content/blog-posts/${encodeURIComponent(slug)}`,
      undefined,
      "Blog post response was empty.",
    );
  }

  async listAdminBlogPosts(query?: ListAdminBlogPostsQuery): Promise<ListAdminBlogPostsResponse> {
    return this.requestJson<ListAdminBlogPostsResponse>(
      `/api/Content/blog-posts/admin${this.toQueryString(query)}`,
      undefined,
      "Admin blog posts response was empty.",
    );
  }

  async getAdminBlogPostById(id: number): Promise<GetAdminBlogPostByIdResponse> {
    return this.requestJson<GetAdminBlogPostByIdResponse>(
      `/api/Content/blog-posts/admin/${id}`,
      undefined,
      "Admin blog post response was empty.",
    );
  }

  async createBlogPost(input: CreateBlogPostRequest): Promise<CreateBlogPostResponse> {
    return this.requestJson<CreateBlogPostResponse>(
      "/api/Content/blog-posts",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      },
      "Create blog post response was empty.",
    );
  }

  async updateBlogPost(id: number, input: UpdateBlogPostRequest): Promise<UpdateBlogPostResponse> {
    return this.requestJson<UpdateBlogPostResponse>(
      `/api/Content/blog-posts/${id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      },
      "Update blog post response was empty.",
    );
  }

  async publishBlogPost(id: number): Promise<PublishBlogPostResponse> {
    return this.requestJson<PublishBlogPostResponse>(
      `/api/Content/blog-posts/${id}/publish`,
      { method: "POST" },
      "Publish blog post response was empty.",
    );
  }

  async archiveBlogPost(id: number): Promise<ArchiveBlogPostResponse> {
    return this.requestJson<ArchiveBlogPostResponse>(
      `/api/Content/blog-posts/${id}/archive`,
      { method: "POST" },
      "Archive blog post response was empty.",
    );
  }

  async deleteBlogPost(id: number): Promise<DeleteBlogPostResponse> {
    return this.requestJson<DeleteBlogPostResponse>(
      `/api/Content/blog-posts/${id}`,
      { method: "DELETE" },
      "",
    );
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

  async getPublicGalleryByKey(key: string): Promise<GalleryResponse> {
    return this.requestJson<GalleryResponse>(
      `/api/Content/galleries/${encodeURIComponent(key)}`,
      undefined,
      "Gallery response was empty.",
    );
  }

  async listAdminGalleries(query?: ListGalleriesQuery): Promise<ListAdminGalleriesResponse> {
    return this.requestJson<ListAdminGalleriesResponse>(
      `/api/Content/galleries/admin${this.toQueryString(query)}`,
      undefined,
      "Admin galleries response was empty.",
    );
  }

  async getAdminGalleryById(id: number): Promise<GalleryResponse> {
    return this.requestJson<GalleryResponse>(
      `/api/Content/galleries/admin/${id}`,
      undefined,
      "Admin gallery response was empty.",
    );
  }

  async createGallery(input: CreateGalleryRequest): Promise<CreateGalleryResponse> {
    return this.requestJson<CreateGalleryResponse>(
      "/api/Content/galleries",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      },
      "Create gallery response was empty.",
    );
  }

  async updateGallery(id: number, input: UpdateGalleryRequest): Promise<UpdateGalleryResponse> {
    return this.requestJson<UpdateGalleryResponse>(
      `/api/Content/galleries/${id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      },
      "Update gallery response was empty.",
    );
  }

  async deleteGallery(id: number): Promise<DeleteGalleryResponse> {
    return this.requestJson<DeleteGalleryResponse>(
      `/api/Content/galleries/${id}`,
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
