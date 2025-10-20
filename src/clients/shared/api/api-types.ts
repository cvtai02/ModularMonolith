
import type { components } from "./lib/openapi-types";

// -- Error Types --
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


// -- API Types --
type ApiTypes = components['schemas'] // donot export this

export type ValidationResponse = ApiTypes['Microsoft.AspNetCore.Http.HttpValidationProblemDetails'];
export type LoginRequest = ApiTypes['Microsoft.AspNetCore.Identity.Data.LoginRequest'];
export type LoginResponse = ApiTypes['Microsoft.AspNetCore.Authentication.BearerToken.AccessTokenResponse'];
export type UserInfo = ApiTypes['Identity.Api.UserInfo'];

