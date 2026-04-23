
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

// Authentication
export type ValidationResponse = ApiTypes['Microsoft.AspNetCore.Http.HttpValidationProblemDetails'];
export type LoginRequest = ApiTypes['Microsoft.AspNetCore.Identity.Data.LoginRequest'];
export type LoginResponse = ApiTypes['Microsoft.AspNetCore.Authentication.BearerToken.AccessTokenResponse'];
export type RegisterRequest = ApiTypes['Microsoft.AspNetCore.Identity.Data.RegisterRequest'];
export type RefreshRequest = ApiTypes['Microsoft.AspNetCore.Identity.Data.RefreshRequest'];
export type ResendConfirmationEmailRequest = ApiTypes['Microsoft.AspNetCore.Identity.Data.ResendConfirmationEmailRequest'];
export type ForgotPasswordRequest = ApiTypes['Microsoft.AspNetCore.Identity.Data.ForgotPasswordRequest'];
export type ResetPasswordRequest = ApiTypes['Microsoft.AspNetCore.Identity.Data.ResetPasswordRequest'];

// Account Management
export type UserInfo = ApiTypes['Identity.Api.UserInfo'];
export type TwoFactorRequest = ApiTypes['Microsoft.AspNetCore.Identity.Data.TwoFactorRequest'];
export type TwoFactorResponse = ApiTypes['Microsoft.AspNetCore.Identity.Data.TwoFactorResponse'];
export type InfoRequest = ApiTypes['Microsoft.AspNetCore.Identity.Data.InfoRequest'];
export type InfoResponse = ApiTypes['Microsoft.AspNetCore.Identity.Data.InfoResponse'];
export type AdminAccountInput = ApiTypes['Identity.Api.AdminAccountInput'];

// Content Module
export type CreateMenuRequest = ApiTypes['Content.Core.DTOs.Menus.CreateMenuRequest'];
export type UpdateMenuRequest = ApiTypes['Content.Core.DTOs.Menus.UpdateMenuRequest'];
export type CreateMetaObjectRequest = ApiTypes['Content.Core.DTOs.MetaObjects.CreateMetaObjectRequest'];
export type UpdateMetaObjectRequest = ApiTypes['Content.Core.DTOs.MetaObjects.UpdateMetaObjectRequest'];
export type GetPresignedUploadBulkUrlRequest = ApiTypes['Content.Core.DTOs.FileObjects.GetPresignedUploadBulkUrlRequest'];
export type PresignedUploadFileRequest = ApiTypes['Content.Core.DTOs.FileObjects.PresignedUploadFileRequest'];
export type PresignedUploadUrlResponse = ApiTypes['Content.Core.DTOs.FileObjects.PresignedUploadUrlResponse'];
export type ConfirmUploadRequest = ApiTypes['Content.Core.DTOs.FileObjects.ConfirmUploadRequest'];
export type ConfirmUploadFileRequest = ApiTypes['Content.Core.DTOs.FileObjects.ConfirmUploadFileRequest'];
export type UploadResponse = ApiTypes['Content.Core.DTOs.FileObjects.UploadResponse'];

// ProductCatalog Module - Categories
export type CategoryResponse = ApiTypes['ProductCatalog.Core.DTOs.Categories.CategoryResponse'];
export type CreateCategoryRequest = ApiTypes['ProductCatalog.Core.DTOs.Categories.CreateCategoryRequest'];
export type UpdateCategoryRequest = ApiTypes['ProductCatalog.Core.DTOs.Categories.UpdateCategoryRequest'];
export type CategoryStatus = ApiTypes['ProductCatalog.Core.Entities.CategoryStatus'];

// ProductCatalog Module - Collections
export type CollectionResponse = ApiTypes['ProductCatalog.Core.DTOs.Collections.CollectionResponse'];
export type CreateCollectionRequest = ApiTypes['ProductCatalog.Core.DTOs.Collections.CreateCollectionRequest'];
export type UpdateCollectionRequest = ApiTypes['ProductCatalog.Core.DTOs.Collections.UpdateCollectionRequest'];

// Order Module
export type OrderResponse = ApiTypes['Order.Core.DTOs.OrderResponse'];
export type OrderLineResponse = ApiTypes['Order.Core.DTOs.OrderLineResponse'];
export type CreateOrderRequest = ApiTypes['Order.Core.DTOs.CreateOrderRequest'];
export type UpdateOrderStatusRequest = ApiTypes['Order.Core.DTOs.UpdateOrderStatusRequest'];
export type OrderStatus = ApiTypes['Order.Core.Entities.OrderStatus'];

// ProductCatalog Module - Products
export type CreateProductRequest = ApiTypes['ProductCatalog.Core.DTOs.Products.CreateProductRequest'];
export type ProductResponse = ApiTypes['ProductCatalog.Core.DTOs.Products.ProductResponse'];
export type ProductStatus = ApiTypes['ProductCatalog.Core.Entities.ProductStatus'];

// ProductCatalog Module - Options & Variants
export type OptionResponse = ApiTypes['ProductCatalog.Core.DTOs.Products.OptionResponse'];
export type CreateVariantRequest = ApiTypes['ProductCatalog.Core.DTOs.Products.CreateVariantRequest'];
export type VariantResponse = ApiTypes['ProductCatalog.Core.DTOs.Products.VariantResponse'];
export type VariantOptionValueDto = ApiTypes['ProductCatalog.Core.DTOs.Products.VariantOptionValueDto'];

// SharedKernel - Pagination
export type PaginatedProductResponse = ApiTypes['SharedKernel.DTOs.PaginatedList`1[[ProductCatalog.Core.DTOs.Products.ProductResponse, ProductCatalog, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]'];

