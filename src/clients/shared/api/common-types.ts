
import type { components } from "./lib/openapi-types";

type ApiTypes = components['schemas'] // donot export this
// SharedKernel - Pagination
export type PaginatedProductResponse = ApiTypes['SharedKernel.DTOs.PaginatedList`1[[ProductCatalog.Core.DTOs.Products.ProductResponse, ProductCatalog, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]'];
export type ValidationResponse = ApiTypes['Microsoft.AspNetCore.Http.HttpValidationProblemDetails'];

export class ApiError extends Error {
    public statusCode: number;
    public detail: string | undefined | null;

    constructor(message: string, statusCode: number, detail: string | undefined | null) {
        super(message);
        this.name = 'ApiError';
        this.statusCode = statusCode;
        this.detail = detail;
    }
};

export class ValidationError extends ApiError  {
    errors: { [key: string]: string[] } | undefined;

    constructor(res: ValidationResponse) {
        super(res.title || "Validation Error", 400, res.detail);
        this.name = 'ValidationError';
        this.errors = res.errors;
    }
};