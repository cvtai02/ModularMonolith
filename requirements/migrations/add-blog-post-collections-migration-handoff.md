# Add Blog Post Collections Migration Handoff

## Module/Project

`src/Modules/Content`

## Suggested Migration Name

`AddBlogPostCollections`

## Why It Is Needed

The Content module now has persistent blog post collection entities for curated ordered lists such as the customer-facing `highlight` collection.

The migration is needed because the backend added:

- `BlogPostCollection`
- `BlogPostCollectionItem`
- DbContext sets and relationship/index configuration

## Schema Changes Expected

Add `BlogPostCollections` table with:

- `Id`
- `Key`
- `Title`
- `Description`
- `IsPublic`
- tenant/audit/soft-delete columns from `AuditableEntity`

Add `BlogPostCollectionItems` table with:

- `Id`
- `BlogPostCollectionId`
- `BlogPostId`
- `DisplayOrder`
- tenant/audit/soft-delete columns from `AuditableEntity`

Add relationships:

- `BlogPostCollectionItem.BlogPostCollectionId` to `BlogPostCollection.Id`
- `BlogPostCollectionItem.BlogPostId` to `BlogPost.Id`

Add filtered unique indexes for active rows:

- `{ TenantId, Key }` on `BlogPostCollection`
- `{ TenantId, BlogPostCollectionId, BlogPostId }` on `BlogPostCollectionItem`
- `{ TenantId, BlogPostCollectionId, DisplayOrder }` on `BlogPostCollectionItem`

## Command Note

Codex must not run migration commands. Claude or the user should generate and review the migration.
