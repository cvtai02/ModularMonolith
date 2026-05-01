import createFetchClient, { Client } from "openapi-fetch";
import type { paths } from "../lib/openapi-types";
import type {
  ArchiveBlogPostResponse,
  BlogPostResponse,
  ConfirmUploadRequest,
  ConfirmUploadResponse,
  CreateBlogPostRequest,
  CreateBlogPostResponse,
  DeleteBlogPostResponse,
  DeleteMediaFilesRequest,
  DeleteMediaFilesResponse,
  GetAllQuery,
  GetAllResponse,
  GetAdminBlogPostByIdResponse,
  GetPresignedUploadBulkUrlRequest,
  ListAdminBlogPostsQuery,
  ListAdminBlogPostsResponse,
  ListPublishedBlogPostsQuery,
  ListPublishedBlogPostsResponse,
  PresignedUploadBulkUrlResponse,
  PublishBlogPostResponse,
  UpdateBlogPostRequest,
  UpdateBlogPostResponse,
} from "../types/content";
import type { IContentClient } from "../contracts/content";
import type { Fetch } from "./shared";
import { requireData } from "./shared";

type OpenApiClient = Client<paths>;

export class ContentClient implements IContentClient {
  private readonly client: OpenApiClient;

  constructor(fetch: Fetch, apiBaseUrl: string) {
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
}
