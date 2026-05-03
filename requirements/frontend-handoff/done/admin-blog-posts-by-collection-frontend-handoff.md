# Admin Blog Posts By Collection Frontend Handoff

## Completion Summary

Admin blog overview at `/content/blogs` fetches `listAdminBlogPostsByCollection` and renders each collection group as a collapsible card with posts listed inside. Filters: search, post status (Draft/Published/Archived), collection visibility (public/private). Each post row navigates to the edit page. Blog post form at `/content/blogs/:id/edit` includes title, summary, image URL, and a tabbed Write/Preview markdown editor (raw text preview; integrate a parser like `marked` for full HTML rendering). Publish and archive actions appear in a status bar on the edit page. Create at `/content/blogs/new`. The shared contract already had `listAdminBlogPostsByCollection` with all required types. Completed 2026-05-03.

---

## Goal

Build the admin blog overview so admins can see blog posts grouped by blog post collection and author blog post body content as markdown.

Move this file to `requirements/frontend-handoff/done/` after frontend implementation.

## Shared API Contract

Use the Content shared API contract:

- `src/clients/shared/api/contracts/content.ts`
- `src/clients/shared/api/clients/content.ts`
- `src/clients/shared/api/types/content.ts`

New client method:

- `listAdminBlogPostsByCollection(query?: ListAdminBlogPostsByCollectionQuery): Promise<ListAdminBlogPostsByCollectionResponse>`

Existing markdown authoring methods:

- `createBlogPost(input: CreateBlogPostRequest): Promise<CreateBlogPostResponse>`
- `updateBlogPost(id: number, input: UpdateBlogPostRequest): Promise<UpdateBlogPostResponse>`

## Grouped Blog Query

Type alias:

```ts
export type ListAdminBlogPostsByCollectionQuery = {
    pageNumber?: number;
    pageSize?: number;
    search?: string | null;
    status?: "Draft" | "Published" | "Archived" | null;
    isPublic?: boolean | null;
    sortBy?: string | null;
    sortDirection?: string | null;
};
```

Response alias:

```ts
export type ListAdminBlogPostsByCollectionResponse =
    PaginatedList<AdminBlogPostCollectionGroupResponse>;
```

Grouped item shape:

```ts
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
```

Blog post summary shape:

```ts
export type BlogPostSummary = {
    id: number;
    title: string;
    slug: string;
    summary: string;
    imageUrl: string;
    status: "Draft" | "Published" | "Archived";
    publishedAt?: string | null;
    created: string;
    lastModified: string;
};
```

## API Behavior

Endpoint:

- `GET /api/Content/blog-post-collections/admin/blog-posts`
- auth: tenant admin or higher
- client method: `listAdminBlogPostsByCollection`

The response is paginated at the collection-group level. Normal collection groups are sorted by collection metadata. A synthetic ungrouped section is included when matching posts have no active collection membership:

- `collectionId: null`
- `key: "ungrouped"`
- `title: "Ungrouped"`
- `isUngrouped: true`

Filters:

- `status` filters posts by `Draft`, `Published`, or `Archived`
- `isPublic` filters collection groups by collection visibility
- `search` matches collection key/title/description and post title/summary/slug

## Markdown Authoring

Use the existing blog post `content` property as markdown source text.

Create/update request aliases come from generated OpenAPI types:

- `CreateBlogPostRequest`
- `UpdateBlogPostRequest`

Frontend-facing request properties:

```ts
{
    title: string;
    content: string;
    summary?: string | null;
    imageUrl?: string | null;
}
```

Backend stores and returns `content` as markdown source text. It does not render markdown to HTML. The admin UI should provide the markdown editor/preview behavior on the frontend side.
