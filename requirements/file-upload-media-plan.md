# Media Upload via Presigned URL Plan

## Summary

Build media upload around the `FileObject` entity and presigned upload URLs. The backend creates upload intents, validates file metadata, generates storage keys, returns presigned URLs, and confirms uploads after the client uploads directly to object storage.

The client flow is:

1. Request presigned upload URLs from the backend.
2. Upload each file directly to object storage with `PUT`.
3. Confirm uploaded files with the backend.
4. Use the confirmed media response and public URL.

## API Contract

Import aliases from `src/clients/shared/api/api-types.ts`.

### Create Presigned Upload URLs

`POST /api/content/file-objects/presigned-upload`

Types:

- Request: `GetPresignedUploadBulkUrlRequest`.
- Response: `PresignedUploadBulkUrlResponse`.

Properties:

`GetPresignedUploadBulkUrlRequest`:
- `files: CreatePresignedUploadFileRequest[]`
- `expiryMinutes: number`

`CreatePresignedUploadFileRequest`:
- `category: string`
- `fileName: string`
- `contentType: string`
- `size: number`

`PresignedUploadBulkUrlResponse`:
- `files: PresignedUploadUrlResponse[]`

`PresignedUploadUrlResponse`:
- `uploadId: string`
- `key: string`
- `uploadUrl: string`
- `publicUrl: string`
- `method: string`
- `headers: Record<string, string>`
- `expiresAt: string`

Request:

```json
{
  "files": [
    {
      "category": "product",
      "fileName": "milk-tea.jpg",
      "contentType": "image/jpeg",
      "size": 245000
    }
  ],
  "expiryMinutes": 15
}
```

Response:

```json
{
  "files": [
    {
      "uploadId": "01HX...",
      "key": "product/01HX.../milk-tea.jpg",
      "uploadUrl": "https://storage-presigned-url",
      "publicUrl": "https://cdn/product/01HX.../milk-tea.jpg",
      "method": "PUT",
      "headers": {
        "Content-Type": "image/jpeg"
      },
      "expiresAt": "2026-04-29T10:15:00Z"
    }
  ]
}
```

### Confirm Upload

`POST /api/content/file-objects/confirm-upload`

Types:

- Request: `ConfirmUploadRequest`.
- Response: `ConfirmUploadResponse`.

Properties:

`ConfirmUploadRequest`:
- `files: ConfirmUploadFileRequest[]`

`ConfirmUploadFileRequest`:
- `uploadId: string`
- `key: string`

`ConfirmUploadResponse`:
- `files: UploadResponse[]`

`UploadResponse`:
- `id: number`
- `key: string`
- `category: string`
- `name: string`
- `contentType: string`
- `size: number`
- `publicUrl: string`

Request:

```json
{
  "files": [
    {
      "uploadId": "01HX...",
      "key": "product/01HX.../milk-tea.jpg"
    }
  ]
}
```

Response:

```json
{
  "files": [
    {
      "id": 123,
      "key": "product/01HX.../milk-tea.jpg",
      "category": "product",
      "name": "milk-tea.jpg",
      "contentType": "image/jpeg",
      "size": 245000,
      "publicUrl": "https://cdn/product/01HX.../milk-tea.jpg"
    }
  ]
}
```

## Backend Behavior

- Persist confirmed media as `FileObject` records with `Id`, `Category`, `Key`, `Name`, `ContentType`, `Size`, and audit fields.
- Do not add a unique constraint or dedicated index on `FileObject.Key`.
- Create upload intents when issuing presigned URLs; upload intents are temporary and should not create `FileObject` rows.
- Generate storage keys server-side only, using `{category}/{uploadId}/{safeFileName}`.
- Sign upload URLs for `PUT` and require the `Content-Type` header in the client upload.
- Default presigned URL expiry is `15` minutes; allowed range is `1..60` minutes.
- Confirm upload by validating that the upload intent exists, the key matches the intent, the object exists in storage, and storage metadata matches the original intent.
- Failed, expired, or abandoned upload intents must not create media records.

## Validation Rules

- File list is required and must contain at least one file.
- Maximum batch size is `20`.
- Supported categories: `avatar`, `review`, `product`, `content`.
- Supported content types: images by default, with category-specific additions only when needed.
- File size must be greater than `0`.
- Default max sizes:
  - `avatar`: 5 MB
  - `product`: 10 MB
  - `review`: 20 MB
  - `content`: 20 MB
- File name must be a safe leaf file name, without path separators or traversal.

## Frontend Handoff

Claude should implement the client flow:

1. Call `POST /api/content/file-objects/presigned-upload`.
2. Upload each file to `uploadUrl` with method `PUT` and the returned headers.
3. Call `POST /api/content/file-objects/confirm-upload`.
4. Store or display the returned `publicUrl`.
5. Handle upload failures per file so one failed upload does not discard successful uploads.

## Additional Shared Types

- `GET /api/Content/file-objects`
  - Query: `GetAllQuery`.
  - Response: `GetAllResponse`.
- `DELETE /api/Content/file-objects`
  - Request: `DeleteMediaFilesRequest`.
  - Response: `DeleteMediaFilesResponse`.

`GetAllQuery`:
- `pageNumber?: number`
- `pageSize?: number`
- `search?: string | null`
- `category?: string | null`
- `contentType?: string | null`
- `minSize?: number | null`
- `maxSize?: number | null`
- `createdFrom?: string | null`
- `createdTo?: string | null`
- `sortBy?: string | null`
- `sortDirection?: string | null`

`GetAllResponse`:
- `items: MediaFileResponse[]`
- `pageNumber: number`
- `totalPages: number`
- `totalCount: number`
- `hasPreviousPage: boolean`
- `hasNextPage: boolean`

`MediaFileResponse`:
- `id: number`
- `url: string`
- `category: string`
- `name: string`
- `contentType: string`
- `size: number`
- `created: string`
- `lastModified: string`

`DeleteMediaFilesRequest`:
- `ids: number[]`
