# Blog Posts Backend Summary Flow

## Summary
Build blog post APIs in the `Content` module using the existing `BlogPost` entity.

## Flow
- Admin creates a draft blog post with title, markdown content, optional summary, and optional image URL.
- Backend generates a tenant-unique slug from the title.
- Admin can list, view, update, publish, archive, and soft delete posts.
- Publishing sets `PublishedAt` the first time the post becomes published.
- Public users can list and read only published, non-deleted posts.
- Draft, archived, deleted, and missing posts return `404` from public detail.

## Backend Notes
- Add `PublishedAt` to `BlogPost`.
- Add a tenant-scoped unique slug index on `(TenantId, Slug)`.
- Keep body markdown in the existing `Content` field.
- Soft delete by setting `IsDeleted = true`.
- Generate an EF migration when allowed.

## Contract Pointers
- API docs: `src/Modules/Content/Api/api.md`
- DTOs: `src/Modules/Content/DTOs/BlogPosts`
- Shared aliases: `src/clients/shared/api/content-types.ts`

## Claude Completion Note

After implementing this requirement, move this file to `requirements/done/`.
