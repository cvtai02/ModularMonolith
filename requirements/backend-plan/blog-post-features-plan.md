# Blog Post Features Backend Plan

## Goal

Use the existing Content module BlogPost APIs as the backend foundation for admin blog management, public blog display, and curated blog post collections such as highlighted posts.

This plan is abstract and review-oriented. It describes current API capability, expected feature behavior, module boundaries, validation behavior, and frontend handoff impact. It does not describe implementation steps.

## Current API Capability

The Content module already supports public blog consumption:

- listing published blog posts
- getting a published blog post by slug

The Content module already supports admin blog management:

- listing all non-deleted blog posts
- filtering admin blog posts by status
- getting a blog post by id
- creating a draft blog post
- updating a blog post
- publishing a blog post
- archiving a blog post
- deleting a blog post through soft delete

The Content module also supports media upload workflows through FileObject APIs, which can be used to prepare blog post images before saving the blog post payload.

The Content module does not yet expose dedicated blog post collections for customers.

The Content module does not yet expose an admin capability for managing which posts appear in a named blog post collection.

## Feature Behavior

Public readers should only see published, non-deleted posts.

Admins should be able to manage draft, published, and archived posts.

Create should produce a draft post with a generated unique slug derived from title.

Update should preserve or regenerate the slug based on existing slug/title behavior.

Publish should move a post to published status and set `publishedAt` when it has not already been set.

Archive should move a post to archived status.

Delete should remove the post from active admin/public queries without requiring a hard delete.

Customers should be able to see curated blog post collections, including a highlight collection.

Admins should be able to create and update multiple blog post collections without changing the normal blog post lifecycle.

Each blog post collection should preserve an explicit display order so customer-facing sections can render in the order chosen by admins.

Only published, non-deleted posts should appear in customer-facing collection responses.

If an admin selects draft or archived posts for a public collection, the backend should either reject them during update or exclude them from the public collection response. The preferred behavior is to reject invalid public collection selections so admin state stays clear.

The highlight feature should be represented as a normal blog post collection with a stable key such as `highlight`, not as a separate hard-coded entity or menu row.

## Module Boundaries

Content owns:

- blog post lifecycle
- blog post public/admin query behavior
- slug generation
- blog post publishing metadata
- blog post image URL value stored on the post
- blog post collection membership and display order

File/media handling owns:

- presigned upload URLs
- upload confirmation
- media file listing and deletion

Frontend/admin owns:

- editor experience
- preview experience
- file upload UI
- calling Content file APIs before sending the final blog post image URL/key value

## Validation Behavior

Blog post APIs should validate:

- request body exists
- title is required
- content is required
- generated slug is unique among active blog posts
- update target exists and is not deleted
- public slug lookup ignores blank slug values
- collection key is required, stable, and unique per tenant
- collection title/name is required
- collection blog post IDs are positive and unique
- collection blog post IDs exist
- public collection posts are published and not deleted
- collection display order is derived from the submitted list order

Validation errors should remain grouped by frontend-facing request fields where possible.

## Blog Post Collection Model

The preferred abstraction is a reusable blog post collection model.

`BlogPostCollection` should represent the collection itself:

- `Id`
- `Key`
- `Title`
- `Description`
- `IsPublic`

`BlogPostCollectionItem` should represent ordered membership:

- `Id`
- `BlogPostCollectionId`
- `BlogPostId`
- `DisplayOrder`

Both entities should use the module's tenant and audit behavior.

The `highlight` list should be a `BlogPostCollection` row with `Key = "highlight"`.

This allows the same API shape to support future collections such as `home-featured`, `latest-guides`, `seasonal-news`, or campaign-specific blog sections.

## API Client And Handoff Impact

The shared Content API client contract should be the frontend integration point for blog post features.

If frontend work is needed, create a frontend handoff under `requirements/frontend-handoff/` that mentions:

- `src/clients/shared/api/contracts/content.ts`
- public list/detail methods for storefront-style blog display
- public collection method for customer blog post collections, including the `highlight` collection
- admin list/detail/create/update/publish/archive/delete methods for admin blog management
- admin blog post collection methods for creating collections and updating ordered collection posts
- Content media/file methods needed for blog image upload

Do not edit any existing files under a `done/` folder; add a separate update-note if this changes completed frontend work.

## Migration

Blog post collection support requires a schema migration.

Expected schema additions:

- add `BlogPostCollection`
- add `BlogPostCollectionItem`
- add a relationship from `BlogPostCollectionItem` to `BlogPostCollection`
- add a relationship from `BlogPostCollectionItem` to `BlogPost`
- add a unique index for collection key per tenant
- add a unique index for blog post membership per tenant and collection

Suggested migration name: `AddBlogPostCollections`.

A migration may be needed later only if future requirements add tags, authors, SEO metadata, scheduled publishing, categories, revisions, comments, or structured image keys instead of stored image URLs.
