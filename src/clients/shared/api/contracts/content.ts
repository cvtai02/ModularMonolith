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

export * from "../types/content"

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

  // Contract method: getPublicBlogPostCollectionByKey. Public collection lookup by key.
  // Response: src/Modules/Content/DTOs/BlogPostCollections/BlogPostCollectionResponse.cs
  getPublicBlogPostCollectionByKey(key: string): Promise<BlogPostCollectionResponse>;

  // Contract method: listAdminBlogPostCollections. Admin collection listing.
  // Query: src/Modules/Content/DTOs/BlogPostCollections/ListBlogPostCollectionsRequest.cs
  // Item response: src/Modules/Content/DTOs/BlogPostCollections/BlogPostCollectionSummaryResponse.cs
  listAdminBlogPostCollections(query?: ListBlogPostCollectionsQuery): Promise<ListBlogPostCollectionsResponse>;

  // Contract method: listAdminBlogPostsByCollection. Admin grouped blog overview by collection.
  // Query: src/Modules/Content/DTOs/BlogPostCollections/ListAdminBlogPostsByCollectionRequest.cs
  // Item response: src/Modules/Content/DTOs/BlogPostCollections/AdminBlogPostCollectionGroupResponse.cs
  listAdminBlogPostsByCollection(
    query?: ListAdminBlogPostsByCollectionQuery,
  ): Promise<ListAdminBlogPostsByCollectionResponse>;

  // Contract method: getAdminBlogPostCollectionById. Admin collection detail.
  // Response: src/Modules/Content/DTOs/BlogPostCollections/BlogPostCollectionResponse.cs
  getAdminBlogPostCollectionById(id: number): Promise<BlogPostCollectionResponse>;

  // Contract method: createBlogPostCollection. Creates a keyed collection with ordered posts.
  // Request: src/Modules/Content/DTOs/BlogPostCollections/CreateBlogPostCollectionRequest.cs
  // Response: src/Modules/Content/DTOs/BlogPostCollections/BlogPostCollectionResponse.cs
  createBlogPostCollection(input: CreateBlogPostCollectionRequest): Promise<CreateBlogPostCollectionResponse>;

  // Contract method: updateBlogPostCollection. Updates collection metadata and replaces ordered posts.
  // Request: src/Modules/Content/DTOs/BlogPostCollections/UpdateBlogPostCollectionRequest.cs
  // Response: src/Modules/Content/DTOs/BlogPostCollections/BlogPostCollectionResponse.cs
  updateBlogPostCollection(id: number, input: UpdateBlogPostCollectionRequest): Promise<UpdateBlogPostCollectionResponse>;

  // Contract method: deleteBlogPostCollection. Soft deletes the collection.
  // No response body. Alias is generated in src/clients/shared/api/types/content.ts.
  deleteBlogPostCollection(id: number): Promise<DeleteBlogPostCollectionResponse>;

  // Contract method: getPublicGalleryByKey. Public full gallery lookup by key.
  // Response: src/Modules/Content/DTOs/Galleries/GalleryResponse.cs
  getPublicGalleryByKey(key: string): Promise<GalleryResponse>;

  // Contract method: listAdminGalleries. Admin gallery listing.
  // Query: src/Modules/Content/DTOs/Galleries/ListGalleriesRequest.cs
  // Item response: src/Modules/Content/DTOs/Galleries/GallerySummaryResponse.cs
  listAdminGalleries(query?: ListGalleriesQuery): Promise<ListAdminGalleriesResponse>;

  // Contract method: getAdminGalleryById. Admin gallery detail.
  // Response: src/Modules/Content/DTOs/Galleries/GalleryResponse.cs
  getAdminGalleryById(id: number): Promise<GalleryResponse>;

  // Contract method: createGallery. Creates a keyed gallery with ordered image items.
  // Request: src/Modules/Content/DTOs/Galleries/CreateGalleryRequest.cs
  // Response: src/Modules/Content/DTOs/Galleries/GalleryResponse.cs
  createGallery(input: CreateGalleryRequest): Promise<CreateGalleryResponse>;

  // Contract method: updateGallery. Updates gallery metadata and replaces ordered image items.
  // Request: src/Modules/Content/DTOs/Galleries/UpdateGalleryRequest.cs
  // Response: src/Modules/Content/DTOs/Galleries/GalleryResponse.cs
  updateGallery(id: number, input: UpdateGalleryRequest): Promise<UpdateGalleryResponse>;

  // Contract method: deleteGallery. Soft deletes the gallery.
  // No response body.
  deleteGallery(id: number): Promise<DeleteGalleryResponse>;
}
