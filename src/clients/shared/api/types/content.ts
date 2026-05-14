import type { paths } from "../lib/openapi-types";
import type { PaginatedList } from "../contracts/common-types";
import type { JsonRequestBody, JsonResponse, PathParams, QueryParams } from "./path-type-helpers";

// -- API Types --
type ContentPaths = paths; // do not export this
type Operation<TPath extends string, TMethod extends string> =
    TPath extends keyof ContentPaths
        ? TMethod extends keyof ContentPaths[TPath]
            ? ContentPaths[TPath][TMethod]
            : never
        : never;

type GetAllOperation =
    ContentPaths["/api/Content/file-objects"]["get"];

type GetPresignedUploadBulkUrlOperation =
    ContentPaths["/api/Content/file-objects/presigned-upload"]["post"];

type ConfirmUploadOperation =
    ContentPaths["/api/Content/file-objects/confirm-upload"]["post"];

type DeleteOperation =
    ContentPaths["/api/Content/file-objects"]["delete"];

type ListPublishedBlogPostsOperation =
    Operation<"/api/Content/blog-posts", "get">;
type GetPublishedBlogPostBySlugOperation =
    Operation<"/api/Content/blog-posts/{slug}", "get">;
type UpdateBlogPostOperation =
    Operation<"/api/Content/blog-posts/{id}", "put">;
type DeleteBlogPostOperation =
    Operation<"/api/Content/blog-posts/{id}", "delete">;
type PublishBlogPostOperation =
    Operation<"/api/Content/blog-posts/{id}/publish", "post">;
type ArchiveBlogPostOperation =
    Operation<"/api/Content/blog-posts/{id}/archive", "post">;
type ListAdminBlogPostsOperation =
    Operation<"/api/Content/blog-posts/admin", "get">;
type GetAdminBlogPostByIdOperation =
    Operation<"/api/Content/blog-posts/admin/{id}", "get">;

// GET all media files
export type GetAllQuery =
    QueryParams<GetAllOperation>;
export type GetAllResponse =
    JsonResponse<GetAllOperation>;

export type GetPresignedUploadBulkUrlRequest =
    JsonRequestBody<GetPresignedUploadBulkUrlOperation>;
// 200 OK
export type PresignedUploadBulkUrlResponse =
    JsonResponse<GetPresignedUploadBulkUrlOperation>;

export type ConfirmUploadRequest =
    JsonRequestBody<ConfirmUploadOperation>;
// 200 OK
export type ConfirmUploadResponse =
    JsonResponse<ConfirmUploadOperation>;

export type DeleteMediaFilesRequest =
    JsonRequestBody<DeleteOperation>;
// No content
export type DeleteMediaFilesResponse = void;

export type ListPublishedBlogPostsQuery =
    QueryParams<ListPublishedBlogPostsOperation>;
// 200 OK
export type ListPublishedBlogPostsResponse =
    PaginatedList<BlogPostSummary>;

export type GetPublishedBlogPostBySlugParams =
    PathParams<GetPublishedBlogPostBySlugOperation>;
// 200 OK
export type BlogPostResponse =
    BlogPostDetail;

export type ListAdminBlogPostsQuery =
    QueryParams<ListAdminBlogPostsOperation>;
// 200 OK
export type ListAdminBlogPostsResponse =
    PaginatedList<BlogPostSummary>;

export type GetAdminBlogPostByIdParams =
    PathParams<GetAdminBlogPostByIdOperation>;
// 200 OK
export type GetAdminBlogPostByIdResponse =
    BlogPostDetail;

export type CreateBlogPostRequest =
    SaveBlogPostRequest;
// 201 Created
export type CreateBlogPostResponse =
    BlogPostDetail;

export type UpdateBlogPostParams =
    PathParams<UpdateBlogPostOperation>;
export type UpdateBlogPostRequest =
    SaveBlogPostRequest;
// 200 OK
export type UpdateBlogPostResponse =
    BlogPostDetail;

export type PublishBlogPostParams =
    PathParams<PublishBlogPostOperation>;
// 200 OK
export type PublishBlogPostResponse =
    BlogPostDetail;

export type ArchiveBlogPostParams =
    PathParams<ArchiveBlogPostOperation>;
// 200 OK
export type ArchiveBlogPostResponse =
    BlogPostDetail;

export type DeleteBlogPostParams =
    PathParams<DeleteBlogPostOperation>;
// No content
export type DeleteBlogPostResponse = void;

export type SaveBlogPostRequest = {
    title: string;
    content: string;
    summary?: string | null;
    imageKey?: string | null;
};

export type BlogPostDetail = BlogPostSummary & {
    content: string;
};

export type BlogPostSummary = {
    id: number;
    title: string;
    slug: string;
    summary: string;
    imageKey: string;
    status: "Draft" | "Published" | "Archived";
    publishedAt?: string | null;
    created: string;
    lastModified: string;
};

export type BlogPostCollectionResponse = {
    id: number;
    key: string;
    title: string;
    description: string;
    isPublic: boolean;
    items: BlogPostSummary[];
    created: string;
    lastModified: string;
};

export type BlogPostCollectionSummaryResponse = {
    id: number;
    key: string;
    title: string;
    description: string;
    isPublic: boolean;
    itemCount: number;
    created: string;
    lastModified: string;
};

export type ListBlogPostCollectionsQuery = {
    pageNumber?: number;
    pageSize?: number;
    search?: string | null;
    isPublic?: boolean | null;
    sortBy?: string | null;
    sortDirection?: string | null;
};

export type ListBlogPostCollectionsResponse =
    PaginatedList<BlogPostCollectionSummaryResponse>;

export type ListAdminBlogPostsByCollectionQuery = {
    pageNumber?: number;
    pageSize?: number;
    search?: string | null;
    status?: "Draft" | "Published" | "Archived" | null;
    isPublic?: boolean | null;
    sortBy?: string | null;
    sortDirection?: string | null;
};

export type AdminBlogPostCollectionGroupResponse = {
    collectionId?: number | null;
    key: string;
    title: string;
    description: string;
    isPublic: boolean;
    isUngrouped: boolean;
    itemCount: number;
    items: BlogPostSummary[];
};

export type ListAdminBlogPostsByCollectionResponse =
    PaginatedList<AdminBlogPostCollectionGroupResponse>;

export type ListPublicBlogPostCollectionsQuery = {
    pageNumber?: number;
    pageSize?: number;
};

export type PublicBlogPostCollectionGroupResponse = {
    collectionId: number;
    key: string;
    title: string;
    description: string;
    isPublic: true;
    itemCount: number;
    items: BlogPostSummary[];
};

export type ListPublicBlogPostCollectionsResponse =
    PaginatedList<PublicBlogPostCollectionGroupResponse>;

export type CreateBlogPostCollectionRequest = {
    key: string;
    title: string;
    description?: string | null;
    isPublic: boolean;
    blogPostIds: number[];
};

export type CreateBlogPostCollectionResponse =
    BlogPostCollectionResponse;

export type UpdateBlogPostCollectionRequest = {
    title: string;
    description?: string | null;
    isPublic: boolean;
    blogPostIds: number[];
};

export type UpdateBlogPostCollectionResponse =
    BlogPostCollectionResponse;

export type DeleteBlogPostCollectionResponse = void;

export type GalleryItemResponse = {
    id: number;
    imageKey: string;
    displayOrder: number;
    name: string;
    note: string;
    link: string;
};

export type GalleryResponse = {
    id: number;
    key: string;
    name: string;
    note: string;
    isPublic: boolean;
    items: GalleryItemResponse[];
    created: string;
    lastModified: string;
};

export type GallerySummaryResponse = {
    id: number;
    key: string;
    name: string;
    note: string;
    isPublic: boolean;
    itemCount: number;
    created: string;
    lastModified: string;
};

export type ListGalleriesQuery = {
    pageNumber?: number;
    pageSize?: number;
    search?: string | null;
    isPublic?: boolean | null;
    sortBy?: string | null;
    sortDirection?: string | null;
};

export type ListAdminGalleriesResponse =
    PaginatedList<GallerySummaryResponse>;

export type SaveGalleryItemRequest = {
    imageKey: string;
    displayOrder: number;
    name?: string | null;
    note?: string | null;
    link?: string | null;
};

export type CreateGalleryRequest = {
    key: string;
    name: string;
    note?: string | null;
    isPublic: boolean;
    items: SaveGalleryItemRequest[];
};

export type CreateGalleryResponse = GalleryResponse;

export type UpdateGalleryRequest = {
    name: string;
    note?: string | null;
    isPublic: boolean;
    items: SaveGalleryItemRequest[];
};

export type UpdateGalleryResponse = GalleryResponse;

export type DeleteGalleryResponse = void;
