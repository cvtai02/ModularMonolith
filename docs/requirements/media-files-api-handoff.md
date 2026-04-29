# Media Files API Handoff

## Backend Endpoint

`GET /api/Content/file-objects`

Returns paginated media files for the current tenant.

`DELETE /api/Content/file-objects`

Bulk deletes media files for the current tenant.

## Query Parameters

- `pageNumber`: default `1`
- `pageSize`: default `20`, max `200`
- `search`: filters by file name or storage key
- `category`: exact category filter
- `contentType`: exact content type filter
- `minSize`: minimum file size in bytes
- `maxSize`: maximum file size in bytes
- `createdFrom`: minimum created timestamp
- `createdTo`: maximum created timestamp
- `sortBy`: supports `name`, `category`, `contentType`, `size`, `created`, `lastModified`
- `sortDirection`: supports `asc` or `desc`

## Response Shape

Response type: `PaginatedList<MediaFileResponse>`

```ts
{
  items: Array<{
    id: number
    url: string
    category: string
    name: string
    contentType: string
    size: number
    created: string
    lastModified: string
  }>
  pageNumber: number
  totalPages: number
  totalCount: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}
```

## Frontend Notes

- Use `url` directly for previews/download links.
- The API intentionally does not return the storage `key`.
- `url` is built by the backend through `IFileManager.BuildPublicUrl(file.Key)`.
- Delete media by sending selected media `id` values to `DELETE /api/Content/file-objects`.
- Delete blocks when selected media is still used by product media.
- No frontend files were changed by Codex.

## Delete Request

```ts
{
  ids: number[]
}
```

Success response: `204 No Content`

## Backend Files Changed

- `src/Modules/Content/Api/FileObjectController.cs`
- `src/Modules/Content/Core/DTOs/FileObjects/DeleteMediaFilesRequest.cs`
- `src/Modules/Content/Core/DTOs/FileObjects/ListMediaFilesRequest.cs`
- `src/Modules/Content/Core/DTOs/FileObjects/MediaFileResponse.cs`
- `src/Modules/Content/Core/Usecases/FileObjects/DeleteMediaFiles.cs`
- `src/Modules/Content/Core/Usecases/FileObjects/ListMediaFiles.cs`
- `src/Modules/Content/Module.cs`
- `src/Modules/Content/Api/api.md`
- `src/Intermediary/Media/IMediaUsageChecker.cs`
- `src/Modules/ProductCatalog/Core/Services/ProductMediaUsageChecker.cs`
- `src/Modules/ProductCatalog/Module.cs`

## Verification

No `dotnet` build, run, or API type generation was executed because `AGENTS.md` forbids dotnet build/run commands in this repository.
