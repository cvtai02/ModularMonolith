# File Upload Media Summary Flow

## Status
Implemented and moved to `requirements/done/`.

## Flow
- Client requests upload intents from `POST /api/Content/file-objects/presigned-upload`.
- Backend validates file metadata and returns presigned upload URLs.
- Client uploads each file directly to object storage with `PUT`.
- Client confirms completed uploads with `POST /api/Content/file-objects/confirm-upload`.
- Backend validates the upload intent and storage object, then creates `FileObject` records.
- Client uses returned public URLs or storage keys in feature payloads such as product media.

## Media Management
- Media listing uses Content file-object APIs.
- Media deletion soft/removes records through Content delete endpoint.
- Product creation/update consumes confirmed media keys.

## Contract Pointers
- API docs: `src/Modules/Content/Api/api.md`
- Shared frontend aliases: `src/clients/shared/api/content-types.ts`
- DTOs: `src/Modules/Content/DTOs/FileObjects`
