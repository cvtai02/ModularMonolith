# Admin Blog Posts By Collection Backend Plan

## Goal

Admins should be able to review blog posts grouped by blog post collection and create or update blog post body content as markdown text.

The existing Content module already owns blog posts, blog post collections, admin blog post CRUD, and public collection lookup. This work should extend that backend surface without changing frontend-owned files outside the shared API contract area.

## API Capability

Add an admin-only grouped blog post list capability under the Content module.

The grouped admin response should let the admin frontend render collection sections where each section includes collection metadata and the ordered blog post summaries assigned to that collection.

The response should include:

- collection id
- collection key
- collection title
- collection description
- collection visibility
- ordered blog post summaries for that collection

Blog posts that are not assigned to any collection should be represented in a separate ungrouped section so admins can still discover draft or orphaned posts.

The grouped endpoint should support enough filtering for admin workflows:

- blog post status filter
- search by blog post title, summary, slug, or collection title/key
- collection visibility filter
- pagination at the collection-group level if the existing shared pagination pattern fits cleanly

## Markdown Authoring

The existing `CreateBlogPostRequest.Content` and `UpdateBlogPostRequest.Content` fields should be treated as markdown source text.

No HTML rendering should be performed by the backend for this request. The backend should store and return the markdown content unchanged after normal string trimming/validation, so the frontend can provide a markdown editor and preview experience.

If the implementation needs clearer naming for frontend contracts, prefer additive aliases or documentation over a disruptive database rename. A database migration should not be required only to clarify that `Content` stores markdown.

## Affected Backend Boundaries

Primary module:

- `src/Modules/Content/`

Expected backend additions:

- DTOs under `src/Modules/Content/DTOs/BlogPostCollections/` or `src/Modules/Content/DTOs/BlogPosts/`
- Content use case under `src/Modules/Content/Core/Usecases/BlogPostCollections/` or `src/Modules/Content/Core/Usecases/BlogPosts/`
- Content controller endpoint under `src/Modules/Content/Api/`
- use case registration in `src/Modules/Content/Module.cs`
- concise endpoint summary update in `src/Modules/Content/Api/api.md`

Shared contract updates are expected under:

- `src/clients/shared/api/types/content.ts`
- `src/clients/shared/api/contracts/content.ts`
- `src/clients/shared/api/clients/content.ts`

Do not edit `src/clients/shared/api/lib/`.

## Validation Behavior

Grouped admin list validation should follow existing list request behavior for page number, page size, sort fields, and optional search values.

Markdown content validation should continue to require non-empty post content on create and update. The backend should not reject common markdown syntax, fenced code blocks, links, images, tables, headings, or inline HTML unless an existing security rule already does so elsewhere.

Public collections should continue to only expose published posts. The new grouped admin view may include draft, published, and archived posts because it is protected by `Policies.TenantAdminUp`.

## Frontend Contract Handoff

After implementation, write a Claude-facing handoff under `requirements/frontend-handoff/`.

The handoff should include the exact shared API type aliases and client method names added or changed. It should explicitly tell Claude:

- use the grouped admin list endpoint for the admin blog overview grouped by collection
- use existing create/update blog post methods for markdown authoring
- treat the blog post `content` property as markdown source text
- move the handoff file to `requirements/frontend-handoff/done/` after frontend implementation

## Migration Impact

No schema migration is expected if the implementation only adds an admin grouped read endpoint and treats the existing blog post `Content` column as markdown source text.

If implementation introduces a new persisted field, table, or relationship, Codex must not run migration commands. Instead, add a migration handoff under `requirements/migrations/` with module name, suggested migration name, reason, and expected schema change.
