# Blog Post Image Key Frontend Handoff

## Completed

- `BlogPostFormValues.imageUrl` renamed to `imageKey`
- `SingleImagePickerField` now stores/emits keys; resolves to CDN URL for display via `src/clients/admin/src/lib/media.ts`
- Markdown preview resolves image keys to `https://cdn.nekomin.com/<key>` via custom `img` renderer (absolute URLs left untouched)
- `add.tsx` and `edit.tsx` send `imageKey` to the API; `edit.tsx` loads `post.imageKey` into default form values

## Goal

Update blog post admin and display code to use media keys instead of resolved image URLs.

Move this file to `requirements/frontend-handoff/done/` after frontend implementation.

## Shared API Contract

Use the Content shared API contract:

- `src/clients/shared/api/contracts/content.ts`
- `src/clients/shared/api/clients/content.ts`
- `src/clients/shared/api/types/content.ts`

Existing client methods keep the same names:

- `createBlogPost(input)`
- `updateBlogPost(id, input)`
- `listPublishedBlogPosts(query)`
- `getPublishedBlogPostBySlug(slug)`
- `listAdminBlogPosts(query)`
- `getAdminBlogPostById(id)`
- `listAdminBlogPostsByCollection(query)`
- `getPublicBlogPostCollectionByKey(key)`

## Request Shape

`CreateBlogPostRequest` and `UpdateBlogPostRequest` now use `imageKey`.

```ts
{
    title: string;
    content: string;
    summary?: string | null;
    imageKey?: string | null;
}
```

Do not send `imageUrl` for blog posts.

## Response Shapes

Blog post summary:

```ts
{
    id: number;
    title: string;
    slug: string;
    summary: string;
    imageKey: string;
    status: "Draft" | "Published" | "Archived";
    publishedAt?: string | null;
    created: string;
    lastModified: string;
}
```

Blog post detail includes all summary properties plus:

```ts
{
    content: string;
}
```

Collection responses and grouped admin collection responses include blog post summaries, so those nested blog post items now use `imageKey`.

## Frontend Behavior

Admin blog editor should save the selected uploaded media object's key into `imageKey`.

Blog rendering should resolve `imageKey` to the actual image URL before rendering. The backend stores the key only and does not decide the CDN/domain URL.

Markdown rendering should also resolve image keys in markdown image syntax against this CDN base URL:

```text
https://cdn.nekomin.com
```

For example:

```markdown
![Cozy bedding](blog/cozy-bedroom/cozy-bedding.jpg)
```

should render as:

```text
https://cdn.nekomin.com/blog/cozy-bedroom/cozy-bedding.jpg
```

If the markdown image source already starts with `http://`, `https://`, or `/`, keep the existing frontend URL behavior rather than prefixing the CDN domain.

Markdown body content is still sent and returned as markdown source text in `content`.
