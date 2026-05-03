# Blog Post Collections Frontend Handoff

## Completion Summary

Implemented admin UI at `/content/blog-collections`. Added list page with search and public/private filter, create/edit form with key field (read-only on edit), optional description, public/private switch, and ordered blog post picker with up/down reorder arrows. Delete confirmation dialog included. Nav entry added under Content sidebar group. Handoff doc moved here on 2026-05-03.

---

Claude owns the admin frontend implementation for this feature.

## Goal

Add UI support for managing blog post collections and displaying the customer-facing highlight collection.

The backend now supports:

- creating multiple keyed blog post collections
- updating collection title, description, public visibility, and ordered posts
- reading public collections by key, including `highlight`
- listing and viewing collections in admin
- deleting collections

After frontend implementation, move this file to `requirements/frontend-handoff/done/` with a short completion summary.

## API Client

Use the Content client contract:

- `src/clients/shared/api/contracts/content.ts`

Client methods to use:

- `getPublicBlogPostCollectionByKey(key)` for customer-facing collection display.
- `listAdminBlogPostCollections(query)` for admin collection index/search.
- `getAdminBlogPostCollectionById(id)` for admin edit/detail.
- `createBlogPostCollection(input)` for creating a collection with initial ordered posts.
- `updateBlogPostCollection(id, input)` for replacing collection metadata and ordered posts.
- `deleteBlogPostCollection(id)` for removing a collection.
- `listAdminBlogPosts(query)` for picking blog posts in admin.

## Request And Response Shapes

`CreateBlogPostCollectionRequest`:

- `key: string`
- `title: string`
- `description?: string | null`
- `isPublic: boolean`
- `blogPostIds: number[]`

`UpdateBlogPostCollectionRequest`:

- `title: string`
- `description?: string | null`
- `isPublic: boolean`
- `blogPostIds: number[]`

`ListBlogPostCollectionsQuery`:

- `pageNumber?: number`
- `pageSize?: number`
- `search?: string | null`
- `isPublic?: boolean | null`
- `sortBy?: string | null`
- `sortDirection?: string | null`

`BlogPostCollectionResponse`:

- `id: number`
- `key: string`
- `title: string`
- `description: string`
- `isPublic: boolean`
- `items: BlogPostSummary[]`
- `created: string`
- `lastModified: string`

`BlogPostCollectionSummaryResponse`:

- `id: number`
- `key: string`
- `title: string`
- `description: string`
- `isPublic: boolean`
- `itemCount: number`
- `created: string`
- `lastModified: string`

`BlogPostSummary`:

- `id: number`
- `title: string`
- `slug: string`
- `summary: string`
- `imageUrl: string`
- `status: "Draft" | "Published" | "Archived"`
- `publishedAt?: string | null`
- `created: string`
- `lastModified: string`

## API Behavior

- Collection `key` is required on create and cannot be changed by update.
- Collection `key` is normalized to lowercase and must be unique per tenant.
- Collection `key` can contain only letters, numbers, hyphens, and underscores.
- `title` is required.
- `blogPostIds` must contain positive unique integers.
- `blogPostIds` order is the display order.
- Public collections can only contain published, non-deleted blog posts.
- Private collections may contain active draft or archived posts for admin staging.
- Updating a collection replaces the full ordered post list.
- Sending `blogPostIds: []` clears the collection.
- Customer display only receives public collections and public collection items.

## Frontend UX

Admin collection list:

- Show collection title, key, public/private state, item count, and last modified date.
- Support search and public/private filtering.
- Add create, edit, and delete actions.

Create/edit collection:

- Let admin enter title, key on create, optional description, and public/private state.
- Make key read-only on edit because backend update does not accept key changes.
- Add a blog post picker using admin blog post listing.
- Preserve selected post order and allow reordering.
- Submit selected IDs as `blogPostIds`.
- For public collections, guide admin to select published posts only.

Customer highlight display:

- Use `getPublicBlogPostCollectionByKey("highlight")`.
- Render returned `items` in the backend-provided order.
- If the collection is missing or has no items, hide the highlight section.

## Notes

The shared Content client currently includes explicit blog post collection aliases and methods. When OpenAPI generation is refreshed later, keep the contract method names stable for Claude-facing code.
