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
  listMediaFiles(query?: GetAllQuery): Promise<GetAllResponse>;
  getPresignedUploadBulkUrl(input: GetPresignedUploadBulkUrlRequest): Promise<PresignedUploadBulkUrlResponse>;
  confirmUpload(input: ConfirmUploadRequest): Promise<ConfirmUploadResponse>;
  deleteMediaFiles(input: DeleteMediaFilesRequest): Promise<DeleteMediaFilesResponse>;

  listPublishedBlogPosts(query?: ListPublishedBlogPostsQuery): Promise<ListPublishedBlogPostsResponse>;
  getPublishedBlogPostBySlug(slug: string): Promise<BlogPostResponse>;
  listAdminBlogPosts(query?: ListAdminBlogPostsQuery): Promise<ListAdminBlogPostsResponse>;
  getAdminBlogPostById(id: number): Promise<GetAdminBlogPostByIdResponse>;
  createBlogPost(input: CreateBlogPostRequest): Promise<CreateBlogPostResponse>;
  updateBlogPost(id: number, input: UpdateBlogPostRequest): Promise<UpdateBlogPostResponse>;
  publishBlogPost(id: number): Promise<PublishBlogPostResponse>;
  archiveBlogPost(id: number): Promise<ArchiveBlogPostResponse>;
  deleteBlogPost(id: number): Promise<DeleteBlogPostResponse>;
}
