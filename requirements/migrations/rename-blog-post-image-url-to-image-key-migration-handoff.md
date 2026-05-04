# Rename Blog Post Image Url To Image Key Migration Handoff

## Module/Project

`src/Modules/Content`

## Suggested Migration Name

`RenameBlogPostImageUrlToImageKey`

## Why It Is Needed

The Content blog post entity now stores uploaded media keys instead of resolved image URLs.

The backend changed:

- `BlogPost.ImageUrl` to `BlogPost.ImageKey`
- blog post create/update DTOs from `imageUrl` to `imageKey`
- blog post detail/list responses from `imageUrl` to `imageKey`

## Schema Changes Expected

Rename the `BlogPosts` column:

- from `ImageUrl`
- to `ImageKey`

Use a column rename migration if the provider-generated migration supports it, so existing stored values are preserved. If the migration generator produces add/drop behavior instead, adjust it to copy existing values before dropping the old column.

## Command Note

Codex must not run migration commands. Claude or the user should generate and review the Content module migration.
