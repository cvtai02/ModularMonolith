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

export interface IContentClient {
  // Query: src/Modules/Content/DTOs/FileObjects/ListMediaFilesRequest.cs
  // Item response: src/Modules/Content/DTOs/FileObjects/MediaFileResponse.cs
  // Wrapper response is generated in src/clients/shared/api/types/content.ts.
  listMediaFiles(query?: GetAllQuery): Promise<GetAllResponse>;

  // Request: src/Modules/Content/DTOs/FileObjects/GetPresignedUploadBulkUrlRequest.cs
  // Response: src/Modules/Content/DTOs/FileObjects/PresignedUploadUrlResponse.cs
  getPresignedUploadBulkUrl(input: GetPresignedUploadBulkUrlRequest): Promise<PresignedUploadBulkUrlResponse>;

  // Request: src/Modules/Content/DTOs/FileObjects/ConfirmUploadRequest.cs
  // Response: src/Modules/Content/DTOs/FileObjects/UploadResponse.cs
  confirmUpload(input: ConfirmUploadRequest): Promise<ConfirmUploadResponse>;

  // Request: src/Modules/Content/DTOs/FileObjects/DeleteMediaFilesRequest.cs
  // No response body. Alias is generated in src/clients/shared/api/types/content.ts.
  deleteMediaFiles(input: DeleteMediaFilesRequest): Promise<DeleteMediaFilesResponse>;

  // Query: src/Modules/Content/DTOs/BlogPosts/ListBlogPostsRequest.cs
  // Item response: src/Modules/Content/DTOs/BlogPosts/BlogPostSummaryResponse.cs
  // Wrapper response is generated in src/clients/shared/api/types/content.ts.
  listPublishedBlogPosts(query?: ListPublishedBlogPostsQuery): Promise<ListPublishedBlogPostsResponse>;

  // Response: src/Modules/Content/DTOs/BlogPosts/BlogPostResponse.cs
  getPublishedBlogPostBySlug(slug: string): Promise<BlogPostResponse>;

  // Query: src/Modules/Content/DTOs/BlogPosts/ListAdminBlogPostsRequest.cs
  // Item response: src/Modules/Content/DTOs/BlogPosts/BlogPostSummaryResponse.cs
  // Wrapper response is generated in src/clients/shared/api/types/content.ts.
  listAdminBlogPosts(query?: ListAdminBlogPostsQuery): Promise<ListAdminBlogPostsResponse>;

  // Response: src/Modules/Content/DTOs/BlogPosts/BlogPostResponse.cs
  getAdminBlogPostById(id: number): Promise<GetAdminBlogPostByIdResponse>;

  // Request: src/Modules/Content/DTOs/BlogPosts/CreateBlogPostRequest.cs
  // Response: src/Modules/Content/DTOs/BlogPosts/BlogPostResponse.cs
  createBlogPost(input: CreateBlogPostRequest): Promise<CreateBlogPostResponse>;

  // Request: src/Modules/Content/DTOs/BlogPosts/UpdateBlogPostRequest.cs
  // Response: src/Modules/Content/DTOs/BlogPosts/BlogPostResponse.cs
  updateBlogPost(id: number, input: UpdateBlogPostRequest): Promise<UpdateBlogPostResponse>;

  // Response: src/Modules/Content/DTOs/BlogPosts/BlogPostResponse.cs
  publishBlogPost(id: number): Promise<PublishBlogPostResponse>;

  // Response: src/Modules/Content/DTOs/BlogPosts/BlogPostResponse.cs
  archiveBlogPost(id: number): Promise<ArchiveBlogPostResponse>;

  // No response body. Alias is generated in src/clients/shared/api/types/content.ts.
  deleteBlogPost(id: number): Promise<DeleteBlogPostResponse>;
}
