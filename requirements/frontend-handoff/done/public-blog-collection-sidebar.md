# Public Blog Collection Sidebar

## Goal

Update the public blog detail sidebar to show grouped blog navigation by collection instead of a flat list of posts.

The backend now provides a public grouped collection API.

## API

Use the shared Content client:

```ts
contentClient.listPublicBlogPostCollections(query)
```

Endpoint:

```http
GET /api/Content/blog-post-collections/public
```

Query:

```ts
export type ListPublicBlogPostCollectionsQuery = {
    pageNumber?: number;
    pageSize?: number;
};
```

Response:

```ts
export type ListPublicBlogPostCollectionsResponse = {
    items: PublicBlogPostCollectionGroupResponse[];
    pageNumber: number;
    totalPages: number;
    totalCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
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
```

`items` inside each collection are already ordered by collection display order.

## Frontend Work

In the blog detail page/sidebar, replace the fallback flat post list call:

```ts
contentClient.listPublishedBlogPosts(...)
```

with:

```ts
contentClient.listPublicBlogPostCollections({ pageNumber: 1, pageSize: 100 })
```

Render:

- collection title as group heading
- collection description if useful in the current design
- each post under its collection using `post.title` and `post.slug`
- link posts to `/blog/${post.slug}`

Skip empty collections if the sidebar should only show navigable groups. If keeping empty collection headings looks odd, hide them.

## Notes

This API is public. Do not send admin auth.

The endpoint only returns `isPublic = true` collections and only published posts.

Move this file to `requirements/frontend-handoff/done/` after implementation.
