
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
export type CreateBlogPostRequest = ApiTypes['Content.Core.DTOs.BlogPosts.CreateBlogPostRequest'];
export type UpdateBlogPostRequest = ApiTypes['Content.Core.DTOs.BlogPosts.UpdateBlogPostRequest'];
export type CreateContentFileRequest = ApiTypes['Content.Core.DTOs.ContentFiles.CreateContentFileRequest'];
export type UpdateContentFileRequest = ApiTypes['Content.Core.DTOs.ContentFiles.UpdateContentFileRequest'];
export type CreateMenuRequest = ApiTypes['Content.Core.DTOs.Menus.CreateMenuRequest'];
export type UpdateMenuRequest = ApiTypes['Content.Core.DTOs.Menus.UpdateMenuRequest'];
export type CreateMetaObjectRequest = ApiTypes['Content.Core.DTOs.MetaObjects.CreateMetaObjectRequest'];
export type UpdateMetaObjectRequest = ApiTypes['Content.Core.DTOs.MetaObjects.UpdateMetaObjectRequest'];
export type BlogPostStatus = ApiTypes['Content.Core.Entities.BlogPostStatus'];

// ProductCatalog Module - Categories
export type CreateCategoryRequest = ApiTypes['ProductCatalog.Core.DTOs.Categories.CreateCategoryRequest'];
export type UpdateCategoryRequest = ApiTypes['ProductCatalog.Core.DTOs.Categories.UpdateCategoryRequest'];
export type CategoryStatus = ApiTypes['ProductCatalog.Core.Entities.CategoryStatus'];

// ProductCatalog Module - Collections
export type CreateCollectionRequest = ApiTypes['ProductCatalog.Core.DTOs.Collections.CreateCollectionRequest'];
export type UpdateCollectionRequest = ApiTypes['ProductCatalog.Core.DTOs.Collections.UpdateCollectionRequest'];

// ProductCatalog Module - Products
export type CreateProductRequest = ApiTypes['ProductCatalog.Core.DTOs.Products.CreateProductRequest'];
export type UpdateProductRequest = ApiTypes['ProductCatalog.Core.DTOs.Products.UpdateProductRequest'];
export type ProductResponse = ApiTypes['ProductCatalog.Core.DTOs.Products.ProductResponse'];
export type ProductStatus = ApiTypes['ProductCatalog.Core.Entities.ProductStatus'];

// ProductCatalog Module - Inventory
export type AdjustProductInventoryRequest = ApiTypes['ProductCatalog.Core.DTOs.Inventory.AdjustProductInventoryRequest'];
export type ProductInventoryResponse = ApiTypes['ProductCatalog.Core.DTOs.Inventory.ProductInventoryResponse'];
export type UpdateProductInventoryRequest = ApiTypes['ProductCatalog.Core.DTOs.Inventory.UpdateProductInventoryRequest'];

// ProductCatalog Module - Options & Variants
export type CreateOptionRequest = ApiTypes['ProductCatalog.Core.DTOs.Products.CreateOptionRequest'];
export type OptionResponse = ApiTypes['ProductCatalog.Core.DTOs.Products.OptionResponse'];
export type CreateVariantRequest = ApiTypes['ProductCatalog.Core.DTOs.Products.CreateVariantRequest'];
export type VariantResponse = ApiTypes['ProductCatalog.Core.DTOs.Products.VariantResponse'];
export type VariantOptionValueDto = ApiTypes['ProductCatalog.Core.DTOs.Products.VariantOptionValueDto'];

// SharedKernel - Pagination
export type PaginatedProductResponse = ApiTypes['SharedKernel.DTOs.PaginatedList`1[[ProductCatalog.Core.DTOs.Products.ProductResponse, ProductCatalog, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]'];

