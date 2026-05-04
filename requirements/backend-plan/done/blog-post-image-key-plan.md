# Blog Post Image Key Backend Plan

## Goal

Blog posts should store and expose an uploaded media key instead of a resolved image URL.

Admins should save the selected media object's key on a blog post. Frontend rendering can resolve that key to a full URL or CDN URL using frontend media resolution rules.

## API Capability

Update the Content blog post API contract so create, update, detail, list, public collection, and admin grouped collection responses consistently use `imageKey`.

Affected blog post request shapes:

- `CreateBlogPostRequest`
- `UpdateBlogPostRequest`

Affected blog post response shapes:

- `BlogPostResponse`
- `BlogPostSummaryResponse`
- collection responses that include `BlogPostSummaryResponse`
- admin grouped blog post collection responses that include `BlogPostSummaryResponse`

The API should no longer expose `imageUrl` for blog post data after this change.

## Affected Backend Boundaries

Primary module:

- `src/Modules/Content/`

Expected backend updates:

- `BlogPost` entity should rename image storage from `ImageUrl` to `ImageKey`
- blog post create/update DTOs should accept `ImageKey`
- blog post response DTOs should return `ImageKey`
- blog post mapper and create/update use cases should map `ImageKey`
- `src/Modules/Content/Api/api.md` should stay concise and mention request/response DTO paths if needed

Shared contract updates are expected under:

- `src/clients/shared/api/types/content.ts`
- `src/clients/shared/api/contracts/content.ts` if comments or handoff wording needs adjustment
- `src/clients/shared/api/clients/content.ts` only if method signatures need explicit non-generated aliases

Do not edit `src/clients/shared/api/lib/`.

## Validation Behavior

`ImageKey` should remain optional. Empty or whitespace values should normalize to an empty string, matching current optional image behavior.

The backend should not validate or resolve the key against storage in this change unless existing Content media APIs already provide a local validation pattern that can be reused without changing user flow.

Markdown post content should continue to be stored as source text and should not be rendered by the backend.

## Frontend Handoff

Write a Claude-facing handoff under `requirements/frontend-handoff/`.

The handoff should tell Claude:

- blog post create/update now use `imageKey`, not `imageUrl`
- blog post responses now return `imageKey`, not `imageUrl`
- admin/editor UI should save the media key from the upload/media flow
- frontend display should resolve `imageKey` to a URL before rendering images
- move the handoff to `requirements/frontend-handoff/done/` after implementation

## Migration Impact

This entity rename requires a Content module migration.

Codex must not run migration commands. Add a migration handoff under `requirements/migrations/` after implementation with:

- module: `Content`
- suggested migration name: `RenameBlogPostImageUrlToImageKey`
- reason: blog posts store media keys instead of resolved image URLs
- expected schema change: rename `BlogPosts.ImageUrl` to `ImageKey` or add/copy/drop as appropriate for the migration style
