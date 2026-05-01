# Blog Posts Backend Plan

## Summary
Build blog post APIs in the existing `Content` module using the existing `BlogPost` entity as the base. V1 will support tenant-admin management, public published-only reads, markdown body content, backend-generated unique slugs, and soft delete.

## Key Changes
- Extend `BlogPost` with `PublishedAt: DateTimeOffset?`; use existing `CreatedBy`, `Created`, and `LastModified` audit fields for author/audit metadata.
- Add a tenant-scoped unique slug rule with a unique index on `(TenantId, Slug)`.
- Store blog body as markdown in existing `Content`; keep existing `Title`, `Summary`, `ImageUrl`, and `Status`.
- Generate slug from title on create; if duplicate, append numeric suffixes like `my-post-2`.
- Use soft delete by setting `IsDeleted = true`; all blog queries exclude deleted posts.

## Public APIs
- `GET /api/Content/blog-posts`: public paginated summaries for `Published` posts only. Supports `search`, `pageNumber`, `pageSize`, `sortBy`, `sortDirection`.
- `GET /api/Content/blog-posts/{slug}`: public full post by slug only when `Status == Published` and not deleted.

## Request And Response Types
- Import aliases from `src/clients/shared/api/api-types.ts`.
- `GET /api/Content/blog-posts`
  - Query: `ListPublishedBlogPostsQuery`.
  - Response: `ListPublishedBlogPostsResponse`.
- `GET /api/Content/blog-posts/{slug}`
  - Path params: `GetPublishedBlogPostBySlugParams`.
  - Response: `BlogPostResponse`.
- `GET /api/Content/blog-posts/admin`
  - Query: `ListAdminBlogPostsQuery`.
  - Response: `ListAdminBlogPostsResponse`.
- `GET /api/Content/blog-posts/admin/{id}`
  - Path params: `GetAdminBlogPostByIdParams`.
  - Response: `GetAdminBlogPostByIdResponse`.
- `POST /api/Content/blog-posts`
  - Request: `CreateBlogPostRequest`.
  - Response: `CreateBlogPostResponse`.
- `PUT /api/Content/blog-posts/{id}`
  - Path params: `UpdateBlogPostParams`.
  - Request: `UpdateBlogPostRequest`.
  - Response: `UpdateBlogPostResponse`.
- `POST /api/Content/blog-posts/{id}/publish`
  - Path params: `PublishBlogPostParams`.
  - Response: `PublishBlogPostResponse`.
- `POST /api/Content/blog-posts/{id}/archive`
  - Path params: `ArchiveBlogPostParams`.
  - Response: `ArchiveBlogPostResponse`.
- `DELETE /api/Content/blog-posts/{id}`
  - Path params: `DeleteBlogPostParams`.
  - Response: `DeleteBlogPostResponse`.

## Type Properties

`BlogPostStatus` values:
- `Draft`
- `Published`
- `Archived`

`ListPublishedBlogPostsQuery`:
- `pageNumber?: number`
- `pageSize?: number`
- `search?: string | null`
- `sortBy?: string | null`
- `sortDirection?: string | null`

`ListAdminBlogPostsQuery`:
- `pageNumber?: number`
- `pageSize?: number`
- `search?: string | null`
- `sortBy?: string | null`
- `sortDirection?: string | null`
- `status?: BlogPostStatus | null`

`BlogPostSummaryResponse`: [BlogPostSummaryResponse.cs](../src/Modules/Content/DTOs/BlogPosts/BlogPostSummaryResponse.cs)

`ListPublishedBlogPostsResponse` and `ListAdminBlogPostsResponse`:
- `items: BlogPostSummaryResponse[]`
- `pageNumber: number`
- `totalPages: number`
- `totalCount: number`
- `hasPreviousPage: boolean`
- `hasNextPage: boolean`

`GetPublishedBlogPostBySlugParams`:
- `slug: string`

`GetAdminBlogPostByIdParams`, `UpdateBlogPostParams`, `PublishBlogPostParams`, `ArchiveBlogPostParams`, and `DeleteBlogPostParams`:
- `id: number`

DTO-backed blog types:
- `BlogPostResponse`, `GetAdminBlogPostByIdResponse`, `CreateBlogPostResponse`, `UpdateBlogPostResponse`, `PublishBlogPostResponse`, and `ArchiveBlogPostResponse`: [BlogPostResponse.cs](../src/Modules/Content/DTOs/BlogPosts/BlogPostResponse.cs)
- `CreateBlogPostRequest`: [CreateBlogPostRequest.cs](../src/Modules/Content/DTOs/BlogPosts/CreateBlogPostRequest.cs)
- `UpdateBlogPostRequest`: [UpdateBlogPostRequest.cs](../src/Modules/Content/DTOs/BlogPosts/UpdateBlogPostRequest.cs)

## Admin APIs
- Tenant-admin protected endpoints: admin list/detail, create draft, update, publish, archive, and soft delete.
- `POST /api/Content/blog-posts` creates draft posts with backend-generated slugs.
- `PUT /api/Content/blog-posts/{id:int}` updates title/content/summary/imageUrl and regenerates backend-owned slugs when the title changes.

## Test Plan
- Create draft returns generated slug and `Draft` status.
- Duplicate titles generate unique slugs.
- Public list/detail exclude draft, archived, deleted posts.
- Publish makes post visible publicly and sets `PublishedAt`.
- Archive hides post from public endpoints.
- Delete hides post from normal queries.
- Unauthorized write attempts are rejected.
## Claude Completion Note

After implementing this requirement, move this file to `requirements/done/`.