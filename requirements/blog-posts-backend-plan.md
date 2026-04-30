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
