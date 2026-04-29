import type { paths } from "./lib/openapi-types";
import type { JsonRequestBody, JsonResponse, QueryParams } from "./path-type-helpers";

// -- API Types --
type ContentPaths = paths; // do not export this

type GetAllOperation =
    ContentPaths["/api/Content/file-objects"]["get"];

type GetPresignedUploadBulkUrlOperation =
    ContentPaths["/api/Content/file-objects/presigned-upload"]["post"];

type ConfirmUploadOperation =
    ContentPaths["/api/Content/file-objects/confirm-upload"]["post"];

type DeleteOperation =
    ContentPaths["/api/Content/file-objects"]["delete"];

// GET all media files
export type GetAllQuery =
    QueryParams<GetAllOperation>;
export type GetAllResponse =
    JsonResponse<GetAllOperation, 200>;

export type GetPresignedUploadBulkUrlRequest =
    JsonRequestBody<GetPresignedUploadBulkUrlOperation>;
// 200 OK
export type PresignedUploadBulkUrlResponse =
    JsonResponse<GetPresignedUploadBulkUrlOperation, 200>;

export type ConfirmUploadRequest =
    JsonRequestBody<ConfirmUploadOperation>;
// 200 OK
export type ConfirmUploadResponse =
    JsonResponse<ConfirmUploadOperation, 200>;

export type DeleteMediaFilesRequest =
    JsonRequestBody<DeleteOperation>;
// 204 No Content
export type DeleteMediaFilesResponse =
    JsonResponse<DeleteOperation, 204>;
