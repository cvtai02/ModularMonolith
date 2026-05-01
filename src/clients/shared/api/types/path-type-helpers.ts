// Codex-owned API type helper. Claude must not read or edit this file.

export type JsonRequestBody<TOperation> =
    TOperation extends { requestBody: { content: { "application/json": infer TRequest } } }
        ? TRequest
        : never;

export type JsonResponse<TOperation> =
    TOperation extends { responses: Record<200, { content: { "application/json": infer TResponse } }> } //openapi alway generate 200, actual can be 2xx
        ? TResponse
        : never;

export type QueryParams<TOperation> =
    TOperation extends { parameters: { query?: infer TQuery } }
        ? TQuery
        : never;

export type PathParams<TOperation> =
    TOperation extends { parameters: { path: infer TPath } }
        ? TPath
        : never;
