# Public Blog Collection Listing

Status: resolved by Codex.

Implemented backend endpoint:

```http
GET /api/Content/blog-post-collections/public
```

Shared client method:

```ts
contentClient.listPublicBlogPostCollections(query)
```

## Context

The blog post detail page (`/blog/[slug]`) includes a hover-reveal sidebar that shows
a navigation panel of **collection → posts** so users can browse related content.

Currently the sidebar falls back to a flat list of all published posts because there
is no public API to list blog post collections.

## Missing API

We need a **public** endpoint that returns all collections marked `isPublic = true`,
each with their ordered posts (summaries, not full content).

### Suggested endpoint

```
GET /api/Content/blog-post-collections/public
```

### Suggested query params (follow existing pagination conventions)

| param        | type    | description                             |
|--------------|---------|-----------------------------------------|
| pageNumber   | int     | 1-based page (default 1)                |
| pageSize     | int     | items per page (default 20, max 100)    |

### Suggested response shape

Match the existing `AdminBlogPostCollectionGroupResponse` but restricted to public data:

```json
{
  "items": [
    {
      "collectionId": 1,
      "key": "lifestyle",
      "title": "Lifestyle",
      "description": "Góc chia sẻ cuộc sống",
      "isPublic": true,
      "itemCount": 4,
      "items": [
        { "id": 10, "title": "Sáng thứ hai chậm rãi", "slug": "sang-thu-hai-cham-rai", ... }
      ]
    }
  ],
  "pageNumber": 1,
  "totalPages": 1,
  "totalCount": 2,
  "hasPreviousPage": false,
  "hasNextPage": false
}
```

Items within each collection should be ordered by `displayOrder` (ascending), same as
how `getPublicBlogPostCollectionByKey` returns them.

## Frontend contract to add

Once the endpoint exists, add to `IContentClient` in
`src/clients/shared/api/contracts/content.ts`:

```ts
// Contract method: listPublicBlogPostCollections. Public collection listing with posts.
// Query: pageNumber, pageSize
// Item response: public variant of AdminBlogPostCollectionGroupResponse (isPublic: true only)
listPublicBlogPostCollections(query?: ListPublicBlogPostCollectionsQuery): Promise<ListPublicBlogPostCollectionsResponse>;
```

And update the blog post sidebar data-fetch in
`src/clients/nekomin/app/blog/[slug]/page.tsx` to replace the flat
`listPublishedBlogPosts()` call with the grouped collection listing.
