
import type { components } from "./lib/openapi-types";

type ApiTypes = components['schemas'] // donot export this
// SharedKernel - Pagination
export type PaginatedProductResponse = ApiTypes['SharedKernel.DTOs.PaginatedList`1[[ProductCatalog.Core.DTOs.Products.ProductResponse, ProductCatalog, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]'];
export type ValidationResponse = ApiTypes['Microsoft.AspNetCore.Http.HttpValidationProblemDetails'];

// SharedKernel.Enums.Currency
export const currencies = ["VND", "USD"] as const;
export type CurrencyCode = typeof currencies[number];

// SharedKernel.DTOs.Address
export type Address = {
    ownerName: string;
    type: string;
    phoneNumber: string;
    email: string;
    country: string;
    state?: string | null;
    city?: string | null;
    postalCode?: string | null;
    line1: string;
    line2?: string | null;
};

// SharedKernel.DTOs.PaginationRequest
export type PaginationRequest = {
    pageNumber: number;
    pageSize: number;
};

// SharedKernel.DTOs.PaginatedList<T>
export type PaginatedList<T> = {
    items: T[];
    pageNumber: number;
    totalPages: number;
    totalCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
};

// SharedKernel.DTOs.Result<T>
export type Result<T> = {
    value: T;
    exception?: unknown;
    errors: Record<string, string[]>;
    isSuccess: boolean;
    isFailure: boolean;
    isNull: boolean;
};

// SharedKernel.Authorization.UserClaims / RoleClaims
export const userClaims = {
    tenant: "Tenant",
    permission: "Permission",
} as const;

export const roleClaims = {
    permission: "Permission",
} as const;

export type UserClaim = typeof userClaims[keyof typeof userClaims];
export type RoleClaim = typeof roleClaims[keyof typeof roleClaims];

// SharedKernel.Authorization.Permissions
export const permissions = {
    manageRoles: "ManageRoles",
    manageClaims: "ManageClaims",
} as const;

export type Permission = typeof permissions[keyof typeof permissions];

// SharedKernel.Authorization.Policies
export const policies = {
    adminOnly: "AdminOnly",
    tenantAdminUp: "TenantAdminUp",
    tenantModeratorUp: "TenantModeratorUp",
    authenticatedUserUp: "AuthenticatedUserUp",
} as const;

export type Policy = typeof policies[keyof typeof policies];

// SharedKernel.Authorization.Roles
export const roles = {
    systemAdmin: "SystemAdmin",
    tenantAdmin: "TenantAdmin",
    tenantModerator: "TenantModerator",
    user: "User",
} as const;

export type Role = typeof roles[keyof typeof roles];

export const rolePermissions: Record<Role, Permission[]> = {
    [roles.systemAdmin]: [permissions.manageRoles, permissions.manageClaims],
    [roles.tenantAdmin]: [],
    [roles.tenantModerator]: [],
    [roles.user]: [],
};

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
