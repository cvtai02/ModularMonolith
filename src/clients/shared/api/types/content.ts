import type { paths } from "../lib/openapi-types";
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
type CreateBlogPostOperation =
    Operation<"/api/Content/blog-posts", "post">;
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
    JsonResponse<ListPublishedBlogPostsOperation>;

export type GetPublishedBlogPostBySlugParams =
    PathParams<GetPublishedBlogPostBySlugOperation>;
// 200 OK
export type BlogPostResponse =
    JsonResponse<GetPublishedBlogPostBySlugOperation>;

export type ListAdminBlogPostsQuery =
    QueryParams<ListAdminBlogPostsOperation>;
// 200 OK
export type ListAdminBlogPostsResponse =
    JsonResponse<ListAdminBlogPostsOperation>;

export type GetAdminBlogPostByIdParams =
    PathParams<GetAdminBlogPostByIdOperation>;
// 200 OK
export type GetAdminBlogPostByIdResponse =
    JsonResponse<GetAdminBlogPostByIdOperation>;

export type CreateBlogPostRequest =
    JsonRequestBody<CreateBlogPostOperation>;
// 201 Created
export type CreateBlogPostResponse =
    JsonResponse<CreateBlogPostOperation>;

export type UpdateBlogPostParams =
    PathParams<UpdateBlogPostOperation>;
export type UpdateBlogPostRequest =
    JsonRequestBody<UpdateBlogPostOperation>;
// 200 OK
export type UpdateBlogPostResponse =
    JsonResponse<UpdateBlogPostOperation>;

export type PublishBlogPostParams =
    PathParams<PublishBlogPostOperation>;
// 200 OK
export type PublishBlogPostResponse =
    JsonResponse<PublishBlogPostOperation>;

export type ArchiveBlogPostParams =
    PathParams<ArchiveBlogPostOperation>;
// 200 OK
export type ArchiveBlogPostResponse =
    JsonResponse<ArchiveBlogPostOperation>;

export type DeleteBlogPostParams =
    PathParams<DeleteBlogPostOperation>;
// No content
export type DeleteBlogPostResponse = void;
